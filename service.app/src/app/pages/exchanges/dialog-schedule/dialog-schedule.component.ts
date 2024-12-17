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
  @Input() contractCode: string;
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
    this.setDefaultDateSubmit();
    this.exchangeScheduleForm = this.formBuilder.group({
      date: new FormControl("", [Validators.required, this.dateRangeValidator]),
     /*  legal_entity: new FormControl(""),
      counterparty: new FormControl(""),
      contract_id: new FormControl("", Validators.required), */
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
  getLegalEntities() {
    this.apiLegalEntity
      .getAllLegalEntitiesByCountry(null, "Internal")
      .subscribe({
        next: (res) => {
          this.entitiesOptions = res.sort((a, b) => (a.name > b.name ? 1 : -1));
          if (this.entitiesOptions.length == 0) {
            this.errorLegalEntity = true;
          } else {
            this.errorLegalEntity = false;
          }
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting legal entities"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
    this.apiLegalEntity
      .getAllLegalEntitiesByCountry(null, "External")
      .subscribe({
        next: (res) => {
          this.entitiesOptions2 = res.sort((a, b) =>
            a.name > b.name ? 1 : -1
          );
          this.entitiesOptions2.map((x) => {
            x["itemName"] = x["name"];
          });
          if (this.entitiesOptions2.length == 0) {
            this.errorLegalEntity2 = true;
          } else {
            this.errorLegalEntity2 = false;
          }
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting legal entities"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }

  getExchanges() {
    var array = [];
    this.apiThirdPartyContract
      .getGasSwapContracts()
      .subscribe({
        next: (res) => {
          res.map((x) => {
            array.push(x["swap_code"]);
          });
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting gas swap contracts"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.options = array;
        this.filteredOptions$ = of(this.options);
      });
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
  /*   private filter(value: string): string[] {
    if (this.options) {
      const filterValue = value.toLowerCase();
      return this.options.filter((optionValue) =>
        optionValue.toLowerCase().includes(filterValue)
      );
    }
  } */

  /* getFilteredOptions(value: string): Observable<string[]> {
    return of(value).pipe(map((filterString) => this.filter(filterString)));
  }

 

  onSelectionChange($event) {
    this.filteredOptions$ = this.getFilteredOptions($event);
    this.setDefaultDateSubmit();
  } */
  onChange() {
    /* this.filteredOptions$ = this.getFilteredOptions(
      this.input.nativeElement.value
    ); */

    this.setDefaultDateSubmit();
  }
  getContractsId(owner_id, counterparty_id) {
    this.apiThirdPartyContract
      .getGasSwapContractsByCounterparty(owner_id, counterparty_id)
      .subscribe({
        next: (res) => {

          this.contractsOptions = res;
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting gas swap contracts"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }
  onChangeCounterparty($event) {
    var counterparty = this.exchangeScheduleForm.get("counterparty").value;
    var owner = this.exchangeScheduleForm.get("legal_entity").value;
    if (owner) {
      this.getContractsId(owner, counterparty[0]["id"]);
    }
  }
  onChangeOwner($event) {
    var owner = this.exchangeScheduleForm.get("legal_entity").value;
    var counterparty = this.exchangeScheduleForm.get("counterparty").value;
    if (counterparty) {
      this.getContractsId(owner, counterparty[0]["id"]);
    }
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
      .getFilePhysicalGasSwapsTSO(
        this.contractCode,
        this.start_date,
        this.end_date,
        "XLS",
        this.balancing_zone,
     
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
      .getFilePhysicalGasSwapsTSO(
        this.contractCode,
        this.start_date,
        this.end_date,
        "XML",
        this.balancing_zone,

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
      .submitPhysicalGasSwapsToTSO(
        this.contractCode,
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

  
    if (this.contractCode) {
      this.apiThirdPartyContract.getGasSwapOperationsDateRange(this.contractCode).subscribe({
        next: (res) => {
          var maxDate = res[1];
          var minDate = res[0];

          this.exchangeScheduleForm.controls["date"].setValue({
            start: new Date(
              Number(minDate.split("-")[0]),
              Number(minDate.split("-")[1]) - 1,
              Number(minDate.split("-")[2])
            ),
            end: new Date(
              Number(maxDate.split("-")[0]),
              Number(maxDate.split("-")[1]) - 1,
              Number(maxDate.split("-")[2])
            ),
          });
        },
        error: (e) => {},
      });
    }
  }
  preventFocus(event) {
    if (event.relatedTarget) {
      // Revert focus back to previous blurring element
      event.relatedTarget.focus();
    } else {
      // No previous focus target, blur instead
      // Alternatively: event.currentTarget.blur();
    }
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
