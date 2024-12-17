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
import { CountryService } from "../../../@core/services/country.service";
import { BalanceZoneService } from "../../../@core/services/balanceZone.service";

@Component({
  selector: "ngx-dialog-schedule",
  templateUrl: "./dialog-schedule.component.html",
  styleUrls: ["./dialog-schedule.component.scss"],
})
export class DialogScheduleComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() contractId: number;
  @Input() startDate: string;
  @Input() endDate: string;
  exchangeScheduleForm!: FormGroup;
  errorDateRange = false;
  entitiesOptions: any;
  entitiesOptions2: any;
  entitiesOptions3: any;
  errorLegalEntity = false;
  errorLegalEntity2 = false;
  errorLegalEntity3 = false;
  exchangeContractsOptions: any;
  filteredControlOptions$: Observable<string[]>;
  options: string[];
  filteredOptions$: Observable<string[]>;
  start_date: any;
  end_date: any;
  contractsOptions: any;
  code: any;
  zoneOptions: any = [];
  countriesOptions: any = [];
  errorBalanceZone = false;
  settings = {
    singleSelection: true,
    text: "",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    enableSearchFilter: true,
    position: "bottom",
    autoPosition: false,
  };
  settingsContract = {
    singleSelection: true,
    text: "",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    enableSearchFilter: true,
    position: "bottom",
    autoPosition: false,
    labelKey: "swap_code",
    primaryKey: "swap_code",
  };
  @ViewChild("autoInput") input;
  balancing_zone: any;
  constructor(
    private formBuilder: FormBuilder,
    private apiLegalEntity: LegalEntityService,
    private messageService: messageService,
    public datepipe: DatePipe,
    protected ref: NbDialogRef<DialogScheduleComponent>,
    private apiThirdPartyContract: ThirdPartyContractsService,
    private excelService: ExcelService,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService
  ) {
    this.getCountries();
  }
  ngOnInit(): void {

    this.exchangeScheduleForm = this.formBuilder.group({
      date: new FormControl("", [Validators.required, this.dateRangeValidator]),
      country_code: new FormControl("", Validators.required),
      balancing_zone: new FormControl("", Validators.required),
    });
    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.exchangeScheduleForm
        .get("country_code")
        .setValue(object["country_code"]);
      this.exchangeScheduleForm
        .get("balancing_zone")
        .setValue(object["balancing_zone"]);
      this.getbalanceZones(object["country_code"]);
    }
    this.setDefaultDateSubmit();
  }

  /*   private filter(value: string): string[] {
    const filterValue = value;
    return this.exchangeContractsOptions.filter((optionValue) =>
      optionValue.includes(filterValue)
    );
  } */
  private dateRangeValidator: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date =
      this.exchangeScheduleForm && this.exchangeScheduleForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.exchangeScheduleForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.exchangeScheduleForm.get("date").value.end,
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
      this.errorDateRange = true;
    } else {
      this.errorDateRange = false;
    }

    return invalid
      ? {
          invalidRange: {},
        }
      : null;
  };
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

    this.ref.close();
  }

  exportAsXLSX() {
    this.start_date = this.datepipe.transform(
      this.exchangeScheduleForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.exchangeScheduleForm.get("date").value.end,
      "yyyy-MM-dd"
    );
    this.balancing_zone = this.exchangeScheduleForm.get("balancing_zone").value;
    this.apiThirdPartyContract
      .getFileThirdPartyTSO(
        this.contractId,
        this.start_date,
        this.end_date,
        "XLS",
        this.balancing_zone
      )
      .subscribe({
        next: (res) => {
          this.excelService.exportAsExcelFileOld(
            res,
            "swap_scheduling_" + this.start_date + "_" + this.end_date
          );
        },
        error: (e) => {
          if (e.error?.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while export exchange scheduling to XML"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }

  exportAsXML() {
    this.start_date = this.datepipe.transform(
      this.exchangeScheduleForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.exchangeScheduleForm.get("date").value.end,
      "yyyy-MM-dd"
    );
    this.balancing_zone = this.exchangeScheduleForm.get("balancing_zone").value;
    this.apiThirdPartyContract
      .getFileThirdPartyTSO(
        this.contractId,
        this.start_date,
        this.end_date,
        "XML",
        this.balancing_zone
      )
      .subscribe({
        next: (res) => {
          var xmltext = res.toString();
          var filename =
            "swap_scheduling_" + this.start_date + "_" + this.end_date + ".xml";
          var pom = document.createElement("a");
          var bb = new Blob([xmltext], { type: "text/plain" });
          if (typeof window !== 'undefined') {
            pom.setAttribute("href", window.URL.createObjectURL(bb));
          }

          pom.setAttribute("download", filename);

          pom.dataset.downloadurl = ["text/plain", pom.download, pom.href].join(
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
              "Internal server error while export swap scheduling to XML"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }
  submit() {
    this.start_date = this.datepipe.transform(
      this.exchangeScheduleForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.exchangeScheduleForm.get("date").value.end,
      "yyyy-MM-dd"
    );
    this.balancing_zone = this.exchangeScheduleForm.get("balancing_zone").value;
    this.apiThirdPartyContract
      .submitThirdPartyToTSO(
        this.contractId,
        this.start_date,
        this.end_date,
        this.balancing_zone
      )
      .subscribe({
        next: (res) => {
          this.messageService.showToast("primary", "Message from TSO", res);
        },
        error: (e) => {
          if (e.error?.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while submit exchanges scheduling"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }
  setDefaultDateSubmit() {
      this.exchangeScheduleForm.controls["date"].setValue({
      start: new Date(
        Number(this.startDate.split("-")[0]),
        Number(this.startDate.split("-")[1]) - 1,
        Number(this.startDate.split("-")[2])
      ),
      end: new Date(
        Number(this.endDate.split("-")[0]),
        Number(this.endDate.split("-")[1]) - 1,
        Number(this.endDate.split("-")[2])
      ),
    });  
  }

  getCountries() {
    this.apiCountry.getcountries().subscribe({
      next: (res) => {
        this.countriesOptions = res;
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting countries"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  onChangeCountry($event) {
    this.getbalanceZones(this.exchangeScheduleForm.get("country_code").value);
    this.exchangeScheduleForm.controls["balancing_zone"].setValue("");
  }
  getbalanceZones(country) {
    this.apiBalanceZone.getAllBalanceZonesByCountry(country).subscribe({
      next: (res) => {
        this.zoneOptions = res;
        if (this.zoneOptions.length == 0) {
          this.errorBalanceZone = true;
        } else {
          this.errorBalanceZone = false;
        }
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting balance"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
}
