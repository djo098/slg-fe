import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import * as moment from "moment";
import { SupplyPointsAreaService } from '../../../../@core/services/supplyPointsArea.service';
import { ExcelService } from '../../../../@core/services/sharedServices/excel.service';
import { messageService } from "../../../../@core/utils/messages";
import * as XLSX from "xlsx";
@Component({
  selector: 'ngx-dialog-export-coefficients',
  templateUrl: './dialog-export-coefficients.component.html',
  styleUrls: ['./dialog-export-coefficients.component.scss']
})
export class DialogExportCoefficientsComponent implements OnInit {
  downloadForm!: FormGroup;
  errorDate1 = false;
  @Input() balance_zone: number;
  @Input() country_code: string;
  constructor(private formBuilder: FormBuilder, public datepipe: DatePipe, protected ref: NbDialogRef<DialogExportCoefficientsComponent>, private apiSupplyPointsAreaService: SupplyPointsAreaService, private excelService: ExcelService, private messageService: messageService) { }

  ngOnInit(): void {
    this.downloadForm = this.formBuilder.group({
      date: new FormControl("", [Validators.required, this.dateRangeValidator1]),
    });
  }
  private dateRangeValidator1: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date = this.downloadForm && this.downloadForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.downloadForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.downloadForm.get("date").value.end,
        "yyyy-MM-dd"
      );

      if (from && to) {
        if (
          (moment(from, "yyyy-MM-dd").isValid() == true ||
            moment(to, "yyyy-MM-dd").isValid() == true) &&
          new Date(from).valueOf() <= new Date(to).valueOf()
        ) {
          invalid = false;
        } else {
          invalid = true;
        }
      }
    } else {
      invalid = true;

    }
    if (invalid == true) {
      this.errorDate1 = true;
    } else {
      this.errorDate1 = false;
    }
    return invalid ? { invalidRange: {} } : null;
  };

  cancel() {
    this.ref.close();
  }
  download() {

    this.apiSupplyPointsAreaService.getSupplyPointCoefficientsWorksheet(this.balance_zone, this.datepipe.transform(
      this.downloadForm.get("date").value.start,
      "yyyy-MM-dd"
    ), this.datepipe.transform(
      this.downloadForm.get("date").value.end,
      "yyyy-MM-dd"
    )).subscribe({
      next: (res) => {
        var objectTemp = [{}];
        objectTemp = objectTemp.map(x => {
          res.map(j => {
            x[j['label']] = null
          }
          )
          return x
        })

        // order res so that Date is the first column and supply point the second one

        this.excelService.exportAsExcelFile(res, 'supply_coefficients_' + this.country_code)
        this.ref.close();

      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while downloading TSO coefficients"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
}
