import { DatePipe } from "@angular/common";
import { Component, Input, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { messageService } from "../../../@core/utils/messages";
import { NbDialogRef } from "@nebular/theme";
import * as moment from "moment";
import { LegalEntityService } from "../../../@core/services/legalEntity.service";
import { ThirdPartyContractsService } from "../../../@core/services/thirdPartyContracts.service";
import { Observable, of } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";
import { NominationsService } from "../../../@core/services/nominations.service";
import { JobsService } from "../../../@core/services/jobs.service";

@Component({
  selector: "ngx-dialog-export-scheduling",
  templateUrl: "./dialog-export-scheduling.component.html",
  styleUrls: ["./dialog-export-scheduling.component.scss"],
})
export class DialogExportSchedulingComponent implements OnInit {
  @Input() balanceZone: number;
  @Input() legalEntity: number;
  @Input() connection_point: number;
  @Input() start_date: string;
  @Input() end_date: string;
  @Input() title: string;
  @Input() service: number;
  @Input() granularity: any;
  @Input() option: string;
  @Input() dates: any;
  exportForm!: FormGroup;
  loading = false;

  @ViewChild("autoInput") input;
  constructor(
    private formBuilder: FormBuilder,
    private apiLegalEntity: LegalEntityService,
    private messageService: messageService,
    public datepipe: DatePipe,
    protected ref: NbDialogRef<DialogExportSchedulingComponent>,
    private apiThirdPartyContract: ThirdPartyContractsService,
    private excelService: ExcelService,
    private apiNomination: NominationsService,
    private jobService: JobsService
  ) {}
  ngOnInit(): void {
    this.exportForm = this.formBuilder.group({
      time: new FormControl("", Validators.required),
    });

  }

  /*   private filter(value: string): string[] {
    const filterValue = value;
    return this.exchangeContractsOptions.filter((optionValue) =>
      optionValue.includes(filterValue)
    );
  } */

  cancel() {
    this.ref.close();
  }

  actionButton() {
    if (this.title == "Export to XLS") {
      this.exportAsXLSX();
    } else if (this.title == "Export to XML") {
      this.exportAsXML();
    } else if (this.title == "Submit to TSO") {
      this.submit();
    }
    else if (this.title == "Submit to ETRM") {
      this.submitToETRM();
    }

    this.ref.close();
  }

  exportAsXLSX() {



    if (this.option == "current") {
    
   
      this.apiNomination
        .getFileNominationsTSO(
          this.balanceZone,
          this.legalEntity,
          this.connection_point,
          this.start_date,
          this.end_date,
          "XLS",
          this.service,
          'daily',
          this.exportForm
          .get("time")
          .value
        )
        .subscribe({
          next: (res) => {
            this.excelService.exportAsExcelFileOld(
              res,
              "nomination_" +
                this.connection_point +
                "_" +
                this.start_date +
                "_" +
                this.end_date
            );
          },
          error: (e) => {
            if (e.error?.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while export nomination to XML"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        });
    } else if (this.option == "all") {
      this.apiNomination
        .getFileNominationsTSO(
          this.balanceZone,
          this.legalEntity,
          this.connection_point,
          this.start_date,
          this.end_date,
          "XLS",
          null,
          'daily',
          this.exportForm
          .get("time")
          .value
        )
        .subscribe({
          next: (res) => {
            this.excelService.exportAsExcelFileOld(
              res,
              "nomination_" +
                this.connection_point +
                "_" +
                this.start_date +
                "_" +
                this.end_date
            );
          },
          error: (e) => {
            if (e.error?.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while export nomination to XML"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        });
    }
  }

  exportAsXML() {
    this.apiNomination
    .getFileNominationsTSO(
      this.balanceZone,
      this.legalEntity,
      this.connection_point,
      this.start_date,
      this.end_date,
      "XML",
      this.service,
      'daily',
      this.exportForm
      .get("time")
      .value
    )
    .subscribe({
      next: (res) => {
        var xmltext = res.toString();
        var filename =
          "nomination_" +
          this.connection_point +
          "_" +
          this.start_date +
          "_" +
          this.end_date +
          ".xml";
        var pom = document.createElement("a");
        var bb = new Blob([xmltext], { type: "text/plain" });
        if (typeof window !== 'undefined') {
          pom.setAttribute("href", window.URL.createObjectURL(bb));
        }
   
        pom.setAttribute("download", filename);

        pom.dataset.downloadurl = ["text/xml", pom.download, pom.href].join(
          ":"
        );
        pom.draggable = true;
        pom.classList.add("dragout");

        pom.click();
      },
      error: (e) => {
        if (e.error?.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while export nomination to XML"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  submit(){
    this.loading = true;
    this.apiNomination
    .submitNominationsToTSO(
      this.balanceZone,
      this.legalEntity,
      this.connection_point,
      this.start_date,
      this.end_date,
      this.service,
      "daily",
      this.exportForm
      .get("time")
      .value
    )
    .subscribe({
      next: (res) => {
        this.messageService.showToast("success", "Success", res["msg"]);
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        if (e.error?.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while export submit nominations"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
}
submitToETRM(){
  this.loading = true;
  this.jobService
  .submitLogisticOperations(
    this.balanceZone,
    this.legalEntity,
    this.connection_point,
    this.start_date,
    this.end_date,
    this.service,
    "daily",
    this.exportForm
    .get("time")
    .value
  )
  .subscribe({
    next: (res) => {
      this.messageService.showToast("success", "Success", res["msg"]);
      this.loading = false;
    },
    error: (e) => {
      this.loading = false;
      if (e.error?.title == "Internal Server Error") {
        this.messageService.showToast(
          "danger",
          "Error",
          "Internal server error while export submit nominations"
        );
      } else {
        this.messageService.showToast("danger", "Error", e.error);
      }
    },
  });
}
  }



