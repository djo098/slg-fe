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
import { LogisticElementService } from "../../../@core/services/logisticElement.service";
import { TankerTrucksService } from "../../../@core/services/tankerTrucks.service";
import { BalanceZoneService } from "../../../@core/services/balanceZone.service";
import { CountryService } from "../../../@core/services/country.service";
import { ConnectionPointService } from "../../../@core/services/connectionPoint.service";
import { NominationsService } from "../../../@core/services/nominations.service";

@Component({
  selector: "ngx-dialog-request-single-client-scheduling",
  templateUrl: "./dialog-request-single-client-scheduling.component.html",
  styleUrls: ["./dialog-request-single-client-scheduling.component.scss"],
})
export class DialogRequestSingleClientSchedulingComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  operationScheduleForm!: FormGroup;
  errorDateRange = false;
  entitiesOptions: any;
  entitiesOptions2: any;
  entitiesOptions3: any;
  errorLegalEntity = false;
  errorLegalEntity2 = false;
  errorLegalEntity3 = false;
  regasificationPlantOptions: any;
  errorRegasificationPlant = false;
  zoneOptions: any;
  errorBalanceZone = false;
  operationContractsOptions: any;
  filteredControlOptions$: Observable<string[]>;
  options: string[];
  filteredOptions$: Observable<string[]>;
  start_date: any;
  end_date: any;
  code: any;
  countriesOptions: any;
  balanceZone: any;
  legalEntity: any;
  connection_point: any;

  @ViewChild("autoInput") input;
  constructor(
    private formBuilder: FormBuilder,
    private apiLegalEntity: LegalEntityService,
    private messageService: messageService,
    public datepipe: DatePipe,
    protected ref: NbDialogRef<DialogRequestSingleClientSchedulingComponent>,
    private apiThirdPartyContract: ThirdPartyContractsService,
    private excelService: ExcelService,
    private apiLogisticElement: LogisticElementService,
    private apiTankerTruck: TankerTrucksService,
    private apiBalanceZone: BalanceZoneService,
    private apiCountry: CountryService,
    private apiConnectionPoint: ConnectionPointService,
    private apiNominations: NominationsService
  ) {
    this.getCountries();
    this.getLegalEntities();
  }
  ngOnInit(): void {
    this.operationScheduleForm = this.formBuilder.group({
      date: new FormControl("", [Validators.required, this.dateRangeValidator]),
      legal_entity: new FormControl("", Validators.required),
      country_code: new FormControl("", Validators.required),
      balancing_zone: new FormControl("", Validators.required),
      regasification_plant: new FormControl("", Validators.required),
    });
    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.operationScheduleForm
        .get("country_code")
        .setValue(object["country_code"]);
      this.operationScheduleForm
        .get("balancing_zone")
        .setValue(object["balancing_zone"]);
      this.getbalanceZones(object["country_code"]);

      this.getRegasificationPlants(
        object["balancing_zone"],
        "tanker_truck_connection"
      );
    }
  }
  private dateRangeValidator: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date =
      this.operationScheduleForm &&
      this.operationScheduleForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.operationScheduleForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.operationScheduleForm.get("date").value.end,
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
          this.entitiesOptions = res.sort((a, b) => (a.name > b.name) ? 1 : -1);
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
      .getAllLegalEntitiesByCountry(null, "Internal")
      .subscribe({
        next: (res) => {
          this.entitiesOptions2 = res.sort((a, b) => (a.name > b.name) ? 1 : -1);
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
  getRegasificationPlants(zone, type) {
    this.apiConnectionPoint
      .getConnectionPointByTypeBalanceZone(zone, type)
      .subscribe({
        next: (res) => {
          this.regasificationPlantOptions = res;
          if (this.regasificationPlantOptions.length == 0) {
            this.errorRegasificationPlant = true;
          } else {
            this.errorRegasificationPlant = false;
          }
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting regasifications plants"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
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
            "Internal server error while getting balance zones"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
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
  onChangeZone($event) {
    this.getRegasificationPlants(
      this.operationScheduleForm.get("balancing_zone").value,
      "tanker_truck_connection"
    );
    this.operationScheduleForm.controls["regasification_plant"].setValue("");
  }
  onChangeCountry($event) {
    this.getbalanceZones(this.operationScheduleForm.get("country_code").value);
    this.operationScheduleForm.controls["balancing_zone"].setValue("");

    this.operationScheduleForm.controls["regasification_plant"].setValue("");
    this.regasificationPlantOptions = [];
  }
  exportAsXLSX() {
    this.start_date = this.datepipe.transform(
      this.operationScheduleForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.operationScheduleForm.get("date").value.end,
      "yyyy-MM-dd"
    );
    this.balanceZone = this.operationScheduleForm.get("balancing_zone").value;
    this.legalEntity = this.operationScheduleForm.get("legal_entity").value;
    this.connection_point = this.operationScheduleForm.get(
      "regasification_plant"
    ).value;
    this.apiNominations
      .getFileNominationsTSO(
        this.balanceZone,
        this.legalEntity,
        this.connection_point,
        this.start_date,
        this.end_date,
        "XLS",
        11,
        "daily"
      )
      .subscribe({
        next: (res) => {
          this.excelService.exportAsExcelFileWithMultipleSheetsOld(
            res,
            "tanker_truck_scheduling_" + this.start_date + "_" + this.end_date
          );
          /*      this.excelService.exportAsExcelFileWithMultipleSheets(
            res,
            "tanker_truck_scheduling_" + this.start_date + "_" + this.end_date
          ); */
        },
        error: (e) => {
          if (e.error?.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while export operation scheduling to XML"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }

  exportAsXML() {
    this.start_date = this.datepipe.transform(
      this.operationScheduleForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.operationScheduleForm.get("date").value.end,
      "yyyy-MM-dd"
    );
    this.balanceZone = this.operationScheduleForm.get("balancing_zone").value;
    this.legalEntity = this.operationScheduleForm.get("legal_entity").value;
    this.connection_point = this.operationScheduleForm.get(
      "regasification_plant"
    ).value;
    this.apiNominations
      .getFileNominationsTSO(
        this.balanceZone,
        this.legalEntity,
        this.connection_point,
        this.start_date,
        this.end_date,
        "XML",
        11,
        "daily"
      )
      .subscribe({
        next: (res) => {
          var xmltext = res.toString();
          var filename =
            "tanker_truck_scheduling_" +
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
      this.operationScheduleForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.operationScheduleForm.get("date").value.end,
      "yyyy-MM-dd"
    );
    this.balanceZone = this.operationScheduleForm.get("balancing_zone").value;
    this.legalEntity = this.operationScheduleForm.get("legal_entity").value;
    this.connection_point = this.operationScheduleForm.get(
      "regasification_plant"
    ).value;

    this.apiNominations
      .submitNominationsToTSO(
        this.balanceZone,
        this.legalEntity,
        this.connection_point,
        this.start_date,
        this.end_date,
        11,
        "daily"
      )
      .subscribe({
        next: (res) => {
          this.ref.close("submit");
          this.messageService.showToast(
            "primary",
            "Message from TSO",
            res["msg"]
          );
        },
        error: (e) => {
          if (e.error?.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while submit operations scheduling"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }
}
