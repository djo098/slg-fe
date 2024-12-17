import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import * as moment from "moment";
import { DemandService } from '../../../@core/services/demand.service';
import { ExcelService } from '../../../@core/services/sharedServices/excel.service';
import { messageService } from "../../../@core/utils/messages";
import * as XLSX from "xlsx";
@Component({
  selector: 'ngx-dialog-export-demand',
  templateUrl: './dialog-export-demand.component.html',
  styleUrls: ['./dialog-export-demand.component.scss']
})
export class DialogExportDemandComponent implements OnInit {
  downloadForm!: FormGroup;
  errorDate1 = false;
  @Input() balance_zone: number;
  @Input() granularity: string;
  constructor( private formBuilder: FormBuilder,  public datepipe: DatePipe,   protected ref: NbDialogRef<DialogExportDemandComponent>,   private apiDemandService: DemandService,  private excelService: ExcelService,   private messageService: messageService) { }

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

    this.apiDemandService.getDemandWorksheetTemplate(this.balance_zone, this.datepipe.transform(
      this.downloadForm.get("date").value.start,
      "yyyy-MM-dd"
    ), this.datepipe.transform(
      this.downloadForm.get("date").value.end,
      "yyyy-MM-dd"
    ),       this.granularity).subscribe({
      next: (res) => {


        var objectTemp = [{}];
        objectTemp = objectTemp.map(x => {
          res.map(j => {
            x[j['label']] = null
          }
          )
          return x
        })

        this.excelService.exportAsExcelFile(objectTemp, 'demand_template_' + this.balance_zone)
        this.ref.close();

      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while downloading template"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });



  }
}
