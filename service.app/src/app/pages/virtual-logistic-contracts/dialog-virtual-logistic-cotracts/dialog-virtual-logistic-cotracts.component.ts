import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { NbDialogRef, NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import * as XLSX from "xlsx";
import * as moment from "moment";
import {
  FormGroup,
  FormBuilder,
  Validators,
  Form,
  FormControl,
  ValidatorFn,
} from "@angular/forms";
import { messageService } from "../../../@core/utils/messages";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";
import { DatePipe } from "@angular/common";
import { ContractsService } from "../../../@core/services/contracts.service";
import { LegalEntityService } from "../../../@core/services/legalEntity.service";
import { TollService } from "../../../@core/services/toll.service";
import { CountryService } from "../../../@core/services/country.service";
import { BalanceZoneService } from "../../../@core/services/balanceZone.service";
import { ConnectionPointService } from "../../../@core/services/connectionPoint.service";
import { LogisticElementService } from "../../../@core/services/logisticElement.service";
import { MeasurementUnit } from "../../../@core/schemas/measurementUnit";
import { ContractCapacityType } from "../../../@core/schemas/contractCapacityType";
import { ContractDurationType } from "../../../@core/schemas/contractDurationType";
import { ContractStatusType } from "../../../@core/schemas/contractStatusType";
import { LogisticElementType } from "../../../@core/schemas/logisticElementType";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { map } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { JobsService } from "../../../@core/services/jobs.service";
import { DialogConfirmationComponent } from "../../../@theme/components/confirmation-dialog/dialog-confirmation-delete.component";

@Component({
  selector: 'ngx-dialog-virtual-logistic-cotracts',
  templateUrl: './dialog-virtual-logistic-cotracts.component.html',
  styleUrls: ['./dialog-virtual-logistic-cotracts.component.scss']
})
export class DialogVirtualLogisticCotractsComponent implements OnInit {

  @Input() action: string;
  @Input() title: string;
  @Input() id: number;

  contractForm!: FormGroup;
  utilForm!: FormGroup;
  additionalForm!: FormGroup;
  entitiesOptions: any;
  entitiesOptions2: any;
  entitiesOptions3: any;
  logisticElementOptions: any;
  countriesOptions: any;
  errorLegalEntity = false;
  errorLegalEntity2 = false;
  errorLegalEntity3 = false;
  errorBalanceZone = false;
  errorLogisticElement = false;
  errorDateRange = false;
  errorToll = false;
  logisticElementsTypeOptions: any;
  infrastructureTypeOptions: any;
  durationTypeOptions: any;
  zoneOptions: any;
  measureUnitOptions: any;
  capacityOptions: any;
  statusOptions: any;
  tollOptions: any;
  serviceOptions: any;
  start_time: any;
  start_time_hour: any;
  dateInput = "";
  loading = false;
  intradaily = false;
  durationObligatory: string;
  errorTimeGas = false;
  numeral = NumberColumnType.getNumeralInstance();
  options: string[];
  filteredOptions$: Observable<string[]>;
  contractLabels = [];
  columns: any;
  rows: any;
  dependencies: any;
  settings = {
    singleSelection: true,
    text: "",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    enableSearchFilter: true,
    position:'bottom',
    autoPosition: false,
  };
  selectedItems : any;
  @ViewChild("autoInput") input;
  operator_id: any;
  operator_label: any;
  constructor(
    protected ref: NbDialogRef<DialogVirtualLogisticCotractsComponent>,
    private formBuilder: FormBuilder,
    private apiContract: ContractsService,
    private messageService: messageService,
    private apiLegalEntity: LegalEntityService,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
    private apiLogisticElement: LogisticElementService,
    private apiToll: TollService,
    private apiConnectionPoint: ConnectionPointService,
    public datepipe: DatePipe,
    private cdRef: ChangeDetectorRef,
    private apiJobs: JobsService,
    private dialogService: NbDialogService,
  ) {
    this.getcountries();
    this.measureUnitOptions = Object.values(MeasurementUnit);
    this.capacityOptions = Object.values(ContractCapacityType);
    this.durationTypeOptions = Object.values(ContractDurationType);
    this.statusOptions = Object.values(ContractStatusType);
    this.getLegalEntitiesInternal();
    this.getLegalEntities();

  }
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.numeral.locale('es')
    this.columns = [
      {
        name: "Date",
        prop: "date",
        size: 250,
        readonly: true,
      },
      {
        name: "Volume",
        prop: "volume",
        size: 270,
        readonly: true,
        cellProperties: ({ prop, model, data, column }) => {
          return {
            class: {
              numeric: true,
            },
          };
        },
      },
    ];

    this.contractForm = this.formBuilder.group({
      balancing_zone: new FormControl("", Validators.required),
      country_code: new FormControl("", Validators.required),
      id: new FormControl(""),
      label: new FormControl("", Validators.required),

      formalization_date: new FormControl("", [Validators.required]),
      request_number: new FormControl(""),
      tso: new FormControl("", Validators.required),
      owner: new FormControl("", Validators.required),
      service: new FormControl("", Validators.required),
      capacity_type: new FormControl("", Validators.required),
      distributor: new FormControl(""),
      operator: new FormControl("", Validators.required),
      infrastructure_type: new FormControl("", Validators.required),
      element_type: new FormControl("", Validators.required),
      infrastructure: new FormControl("", Validators.required),
      duration_type: new FormControl("", Validators.required),
      date: new FormControl("", [Validators.required]),
      duration_hours: new FormControl("", [
        Validators.pattern(
          /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/
        ),
        Validators.min(0),
      ]),
      total_capacity_unit: new FormControl("", Validators.required),
      total_capacity_volume: new FormControl("", [
        Validators.required,
        Validators.pattern(
          /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/
        ),
      ]),
      status: new FormControl("", Validators.required),
      toll_type: new FormControl(""),
      transaction: new FormControl(""),
      auction_code: new FormControl(""),
      offer_transaction_id: new FormControl(""),
      premium_value: new FormControl("", [
        Validators.pattern(/^\d{1,3}(.\d{3})*(\,\d+)?$/),
        Validators.min(0),
      ]),
      premium_unit: new FormControl(""),
      price_value: new FormControl("", [
        Validators.pattern(/^\d{1,3}(.\d{3})*(\,\d+)?$/),
        Validators.min(0),
      ]),
      price_unit: new FormControl(""),
      termination_date: new FormControl(""),
      comment: new FormControl(""),
      start_time: new FormControl(""),
      end_time: new FormControl(""),
      nomination_id: new FormControl(""),
    });
    if (this.action == "Update") {
      this.loading = true;
      this.contractForm.controls["id"].setValue(this.id);
      this.getLogisticContract(this.id);
    } else if (this.action == "View") {
      this.getLogisticContract(this.id);
      this.getNominationById(this.id);
      this.contractForm.disable();
      this.settings = Object.assign({ disabled: true }, this.settings);
    } else if (this.action == "Add") {
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object = JSON.parse(localStorage.getItem("settings_parameters"));
        this.contractForm.get("country_code").setValue(object["country_code"]);
        this.getbalanceZones(object["country_code"]);
        this.contractForm
          .get("balancing_zone")
          .setValue(object["balancing_zone"]);

        this.getTSO(object["balancing_zone"]);
        this.infrastructureTypeOptions = [
          { id: "logistic_element", label: "logistic_element" },
          { id: "connection_point", label: "connection_point" },
        ];
      }
    }

    this.contractForm.controls["tso"].disable();
    this.contractForm.controls["id"].disable();
  }
  cancel() {
    this.ref.close();
  }
  private dateRangeValidator: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date = this.contractForm && this.contractForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.contractForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.contractForm.get("date").value.end,
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

    return invalid ? { invalidRange: {} } : null;
  };
  getLogisticContract(id) {
    this.apiContract
      .getLogisticContractVirtual(id)
      .subscribe({
        next: (res) => {

          this.infrastructureTypeOptions = [
            { id: "logistic_element", label: "logistic_element" },
            { id: "connection_point", label: "connection_point" },
          ];
          this.contractForm.controls["label"].setValue(res["label"]);
          this.contractForm.controls["country_code"].setValue(
            res["country_code"]
          );
          this.getbalanceZones(res["country_code"]);
   

          /*   this.getConnectionPoints(
            res["infrastructure_type"],
            res["balance_zone_id"]
          ); */
          this.getTolls(res["balance_zone_id"]);
          this.getServices(res["element_type"]);
          this.contractForm.controls["balancing_zone"].setValue(
            res["balance_zone_id"]
          );
          this.contractForm.controls["capacity_type"].setValue(
            res["capacity_type"]
          );

          this.contractForm.controls["duration_type"].setValue(
            res["duration_type"]
          );

          if (res["duration_hours"]) {
            this.contractForm.controls["duration_hours"].setValue(
              this.numeral(res["duration_hours"]).format("0,0.[0000000000]")
            );
          }

          this.contractForm.controls["date"].setValue({
            start: new Date(
              res["start_date"].split("-")[0],
              res["start_date"].split("-")[1] - 1,
              res["start_date"].split("-")[2]
            ),
            end: new Date(
              res["end_date"].split("-")[0],
              res["end_date"].split("-")[1] - 1,
              res["end_date"].split("-")[2]
            ),
          });

          /*   this.contractForm.controls["date"].setValue(
          `${this.datepipe.transform(new Date(res['start_date'].split('-')[0],res['start_date'].split('-')[1]-1,res['start_date'].split('-')[2]),"dd.MM.yyyy")}-${this.datepipe.transform(new Date(res['end_date'].split('-')[0],res['end_date'].split('-')[1]-1,res['end_date'].split('-')[2]),"dd.MM.yyyy")}`
        ); */
          // this.dateInput = `${this.datepipe.transform(new Date(res['start_date'].split('-')[0],res['start_date'].split('-')[1]-1,res['start_date'].split('-')[2]),"dd.MM.yyyy")}-${this.datepipe.transform(new Date(res['end_date'].split('-')[0],res['end_date'].split('-')[1]-1,res['end_date'].split('-')[2]),"dd.MM.yyyy")}`;

          this.contractForm.controls["infrastructure_type"].setValue(
            res["infrastructure_type"]
          );
          this.getElementsTypes(res["infrastructure_type"]);
          this.getDeliveryPoint(
            res["balance_zone_id"],
            res["infrastructure_type"],
            res["element_type"]
          );

          this.contractForm.controls["element_type"].setValue(
            res["element_type"]
          );
          this.contractForm.controls["infrastructure"].setValue(
            res["infrastructure_id"]
          );
   
         if(res["operator_id"]){
          this.operator_id = res["operator_id"]
          this.operator_label = res["operator"]
   
         }

          this.contractForm.controls["distributor"].setValue(
            res["distributor_id"]
          );
          this.contractForm.controls["request_number"].setValue(
            res["request_number"]
          );
          this.contractForm.controls["service"].setValue(res["service_id"]);

          this.contractForm.controls["toll_type"].setValue(res["toll_type"]);
          this.contractForm.controls["total_capacity_unit"].setValue(
            res["total_capacity_unit"]
          );

          this.contractForm.controls["total_capacity_volume"].setValue(
            this.numeral(res["total_capacity_volume"]).format(
              "0,0.[0000000000]"
            )
          );
          this.contractForm.controls["transaction"].setValue(
            res["transaction"]
          );
          this.getTSO(res["balance_zone_id"]);

          this.contractForm.controls["status"].setValue(res["status"]);
          this.contractForm.controls["auction_code"].setValue(
            res["auction_code"]
          );
          this.contractForm.controls["offer_transaction_id"].setValue(
            res["offer_transaction_id"]
          );

          if (res["premium_value"] != null) {
            this.contractForm.controls["premium_value"].setValue(
              this.numeral(res["premium_value"]).format("0,0.[0000000000]")
            );
          }
          if (res["nomination_id"] != null) {
            this.contractForm.controls["nomination_id"].setValue(
              res["nomination_label"]
            );
          }

          this.contractForm.controls["premium_unit"].setValue(
            res["premium_unit"]
          );
          if (res["price_value"] != null) {
            this.contractForm.controls["price_value"].setValue(
              this.numeral(res["price_value"]).format("0,0.[0000000000]")
            );
          }

          this.contractForm.controls["price_unit"].setValue(res["price_unit"]);
          this.contractForm.controls["tso"].setValue(res["tso_id"]);
          this.contractForm.controls["owner"].setValue(res["owner_id"]);
          if (res["termination_date"] != null) {
            this.contractForm.controls["termination_date"].setValue(
              new Date(
                res["termination_date"].split("-")[0],
                res["termination_date"].split("-")[1] - 1,
                res["termination_date"].split("-")[2]
              )
            );
          }
          var duration_type = res["duration_type"];

          if (duration_type === "Intradaily") {
            this.intradaily = true;

            if (res["start_time"] && res["end_time"]) {
              this.contractForm.controls["start_time"].setValue(
                new Date(
                  2022,
                  1,
                  1,
                  Number(res["start_time"].toString().split(":")[0]),
                  Number(res["start_time"].toString().split(":")[1]),
                  0
                )
              );
              this.contractForm.controls["end_time"].setValue(
                new Date(
                  2022,
                  1,
                  1,
                  Number(res["end_time"].toString().split(":")[0]),
                  Number(res["end_time"].toString().split(":")[1]),
                  0
                )
              );
            }

            this.durationObligatory = "*";
            this.contractForm.controls["duration_hours"].disable();
            if (this.action == "View") {
              setTimeout(function () {
                document
                  .getElementById("start_time")
                  .setAttribute("disabled", "");
                document
                  .getElementById("end_time")
                  .setAttribute("disabled", "");
              }, 100);
            }
          }
     
           if (res["formalization_date"] != null) {
            this.contractForm.controls["formalization_date"].setValue(
              new Date(
                res["formalization_date"].split("-")[0],
                res["formalization_date"].split("-")[1] - 1,
                res["formalization_date"].split("-")[2].split("T")[0],
                res["formalization_date"]
                  .split("-")[2]
                  .split("T")[1]
                  .split(":")[0],
                res["formalization_date"]
                  .split("-")[2]
                  .split("T")[1]
                  .split(":")[1],
                res["formalization_date"]
                  .split("-")[2]
                  .split("T")[1]
                  .split(":")[2]
                  .replace("Z", "")
              )
            );
          } 

          this.contractForm.controls["toll_type"].setValue(res["toll_type_id"]);
          this.contractForm.controls["comment"].setValue(res["comments"]);
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting countracts"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.loading = false;
        this.validateEndtimeAndDayGas();
        if(this.operator_id !== undefined && this.operator_label !== undefined){
          this.contractForm.controls["operator"].setValue({id: this.operator_id,itemName: this.operator_label});
          this.selectedItems=[{id: this.operator_id,itemName: this.operator_label}]; 
        } 
   
      });
  }

  onChangeCountry($event) {
    this.contractForm.controls["balancing_zone"].setValue("");
    this.contractForm.controls["tso"].setValue("");
    this.logisticElementOptions = [];
    this.contractForm.controls["infrastructure"].setValue("");
    this.getbalanceZones(this.contractForm.get("country_code").value);
    this.getLegalEntities();
  }
  onChangeZone($event) {
    this.logisticElementOptions = [];
    this.logisticElementsTypeOptions = [];
    this.contractForm.controls["nomination_id"].setValue("");
    this.getTSO(this.contractForm.get("balancing_zone").value);
    this.contractForm.controls["infrastructure"].setValue("");

    this.infrastructureTypeOptions = [
      { id: "logistic_element", label: "logistic_element" },
      { id: "connection_point", label: "connection_point" },
    ];
    this.getTolls(this.contractForm.get("balancing_zone").value);
    if (
      this.contractForm.get("infrastructure_type").value &&
      this.contractForm.get("element_type").value &&
      this.contractForm.get("balancing_zone").value
    ) {
      this.getDeliveryPoint(
        this.contractForm.get("balancing_zone").value,
        this.contractForm.get("infrastructure_type").value,
        this.contractForm.get("element_type").value
      );
    }
    this.validateEndtimeAndDayGas();
  }
  onChangeElementType($event) {
    this.logisticElementOptions = [];
    this.contractForm.controls["infrastructure"].setValue("");
    this.contractForm.controls["service"].setValue("");
    if (
      this.contractForm.get("balancing_zone").value &&
      this.contractForm.get("infrastructure_type").value
    )
      this.getDeliveryPoint(
        this.contractForm.get("balancing_zone").value,
        this.contractForm.get("infrastructure_type").value,
        this.contractForm.get("element_type").value
      );

    this.getServices(this.contractForm.get("element_type").value);
  }
  onChangeInfrastructureType($event) {
    this.logisticElementOptions = [];
    this.logisticElementsTypeOptions = [];
    this.contractForm.controls["infrastructure"].setValue("");
    this.contractForm.controls["element_type"].setValue("");
    if (this.contractForm.get("balancing_zone").value) {
      this.getElementsTypes($event);
    }
  }
  getcountries() {
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
  getLegalEntitiesInternal() {
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
  }
  getLegalEntities() {
    this.apiLegalEntity
      .getAllLegalEntitiesByCountry(null, "External")
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
    this.apiLegalEntity.getAllLegalEntitiesByCountry().subscribe({
      next: (res) => {
        this.entitiesOptions3 = res.sort((a, b) => (a.name > b.name) ? 1 : -1);
        this.entitiesOptions3.map((x) => {
          x["itemName"] = x["name"];
        });
        if (this.entitiesOptions3.length == 0) {
          this.errorLegalEntity3 = true;
        } else {
          this.errorLegalEntity3 = false;
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
    }).add(()=>{
   
       if(this.operator_id !== undefined && this.operator_label !== undefined){
        this.contractForm.controls["operator"].setValue({id: this.operator_id,itemName: this.operator_label});
        this.selectedItems=[{id: this.operator_id,itemName: this.operator_label}]; 
      }  



    });
  }
  getbalanceZones(country) {
    this.apiBalanceZone
      .getAllBalanceZonesByCountry(country)
      .subscribe({
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
      })
      .add(() => {
        this.filterBalanceZones();
        this.validateEndtimeAndDayGas();
      });
  }
  getDeliveryPoint(zone, type, type1) {
    if (type == "logistic_element") {
      this.apiLogisticElement
        .getLogisticElementByTypeBalanceZone(zone, type1)
        .subscribe({
          next: (res) => {
            this.logisticElementOptions = res;
            if (this.logisticElementOptions.length == 0) {
              this.errorLogisticElement = true;
            } else {
              this.errorLogisticElement = false;
            }
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while getting delivery points"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        });
    } else if (type == "connection_point") {
      this.apiConnectionPoint
        .getConnectionPointByTypeBalanceZone(zone, type1)
        .subscribe({
          next: (res) => {
            this.logisticElementOptions = res;
            if (this.logisticElementOptions.length == 0) {
              this.errorLogisticElement = true;
            } else {
              this.errorLogisticElement = false;
            }
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while getting delivery points"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        });
    }
  }
  /* getConnectionPoints(type, zone) {
    
    this.apiConnectionPoint
      .getConnectionPointByTypeBalanceZone(zone, type)
      .subscribe({
        next: (res) => {
          this.logisticElementOptions = res;
          if (this.logisticElementOptions.length == 0) {
            this.errorLogisticElement = true;
          } else {
            this.errorLogisticElement = false;
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
  } */
  getTolls(zone) {
    this.apiToll.getTollTypes(zone).subscribe({
      next: (res) => {
        this.tollOptions = res;
        if (this.tollOptions.length == 0) {
          this.errorToll = true;
        } else {
          this.errorToll = false;
        }
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting tolls"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  getElementsTypes(type) {
    if (type == "logistic_element") {
      this.logisticElementsTypeOptions = [];
      Object.values(LogisticElementType).map((x) => {
        this.logisticElementsTypeOptions.push(x);
      });
    } else if (type == "connection_point") {
      this.apiConnectionPoint.getConnectionPointTypes().subscribe({
        next: (res) => {
          this.logisticElementsTypeOptions = res;
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting tolls"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
    }
  }

  add() {
    function pad(num) {
      num = num.toString();

      while (num.length === 1) num = "0" + num;
      return num;
    }

    if (this.contractForm.valid) {
      if (
        this.contractForm.get("start_time").value &&
        this.contractForm.get("end_time").value
      ) {
        var start_time =
          pad(
            this.contractForm
              .get("start_time")
              .value.getHours()
          ) +
          ":" +
          pad(this.contractForm
            .get("start_time")
            .value.getMinutes());


        var end_time =
          pad(
            this.contractForm
              .get("end_time")
              .value.getHours()
          ) +
          ":" +
          pad(this.contractForm
            .get("end_time")
            .value.getMinutes());

      } else {
        start_time = null;
        end_time = null;
      }
      var nomination_id;
      var result = this.contractLabels.filter(
        (item) => item["label"] == this.contractForm.get("nomination_id").value
      );
      result.map((x) => {
        nomination_id = x["id"];
      });

      var object = {
        id: this.contractForm.get("id").value
          ? this.contractForm.get("id").value
          : null,
        label: this.contractForm.get("label").value,
        auction_code: this.contractForm.get("auction_code").value
          ? this.contractForm.get("auction_code").value
          : null,
        capacity_type: this.contractForm.get("capacity_type").value,
        termination_date: this.contractForm.get("termination_date").value
          ? this.datepipe.transform(
              this.contractForm.get("termination_date").value,
              "yyyy-MM-dd"
            )
          : null,
        // balance_zone_id: this.contractForm.get("balancing_zone").value,
        distributor_id: this.contractForm.get("distributor").value
          ? this.contractForm.get("distributor").value
          : null,
        duration_type: this.contractForm.get("duration_type").value,
        start_time: this.contractForm.get("start_time").value
          ? start_time
          : null,
        end_time: this.contractForm.get("end_time").value ? end_time : null,
        duration_hours: this.contractForm.get("duration_hours").value
          ? Number(
              this.contractForm
                .get("duration_hours")
                .value.toString()
                .replace(/\./g, "")
                .replace(",", ".")
            )
          : null,
        end_date: this.datepipe.transform(
          this.contractForm.get("date").value.end,
          "yyyy-MM-dd"
        ),
        formalization_date:
          new Date(
            new Date(this.contractForm.get("formalization_date").value)
              .toString()
              .replace(/GMT.*$/, "GMT+0000")
          )
            .toISOString()
            .split(".")[0] + "Z",

        infrastructure_id: this.contractForm.get("infrastructure").value
          ? this.contractForm.get("infrastructure").value
          : null,
        element_type: this.contractForm.get("element_type").value
          ? this.contractForm.get("element_type").value
          : null,
        offer_transaction_id: this.contractForm.get("offer_transaction_id")
          .value
          ? this.contractForm.get("offer_transaction_id").value
          : null,
        operator_id: this.contractForm.get("operator").value[0]['id'],
        owner_id: this.contractForm.get("owner").value,
        request_number: this.contractForm.get("request_number").value
          ? this.contractForm.get("request_number").value
          : null,
        service_id: this.contractForm.get("service").value,
        start_date: this.datepipe.transform(
          this.contractForm.get("date").value.start,
          "yyyy-MM-dd"
        ),
        status: this.contractForm.get("status").value,
        tso_id: this.contractForm.get("tso").value,
        toll_type_id: this.contractForm.get("toll_type").value
          ? this.contractForm.get("toll_type").value
          : null,
        transaction: this.contractForm.get("transaction").value
          ? this.contractForm.get("transaction").value
          : null,
        total_capacity_unit: this.contractForm.get("total_capacity_unit").value,
        premium_unit: this.contractForm.get("premium_unit").value
          ? this.contractForm.get("premium_unit").value
          : null,
        price_unit: this.contractForm.get("price_unit").value
          ? this.contractForm.get("price_unit").value
          : null,
        premium_value:
          this.contractForm.get("premium_value").value ||
          this.contractForm.get("price_value").value !== ""
            ? Number(
                this.contractForm
                  .get("premium_value")
                  .value.toString()
                  .replace(/\./g, "")
                  .replace(",", ".")
              )
            : null,
        price_value:
          this.contractForm.get("price_value").value ||
          this.contractForm.get("price_value").value !== ""
            ? Number(
                this.contractForm
                  .get("price_value")
                  .value.toString()
                  .replace(/\./g, "")
                  .replace(",", ".")
              )
            : null,
        total_capacity_volume: Number(
          this.contractForm
            .get("total_capacity_volume")
            .value.toString()
            .replace(/\./g, "")
            .replace(",", ".")
        ),
        comments: this.contractForm.get("comment").value
          ? this.contractForm.get("comment").value
          : null,
        nomination_id: this.contractForm.get("nomination_id").value
          ? nomination_id
          : null,
      };

      if (this.action == "Add") {
        this.apiContract.addLogisticContractVirtual(this.clean(object)).subscribe({
          next: (res) => {
        
            this.ref.close('save');
            this.messageService.showToast(
              "success",
              "Success",
              "Virtual Logistic Contract added successfully!"
            );
  
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while adding Virtual Logistic Contract"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
            this.ref.close();
          },
        });
      } else if (this.action == "Update") {
        this.update(object);
      }
    }
  }
  update(object) {

    this.apiContract.updateLogisticContractVirtual(this.clean(object)).subscribe({
      next: (res) => {
     
        this.ref.close('update');
        this.messageService.showToast(
          "success",
          "Success",
          "Virtual Logistic Contract updated successfully!"
        );


      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while updating Virtual Logistic Contract"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
        this.ref.close();
      },
    });
  }
  getServices(connection_type?) {
    this.apiConnectionPoint.getLogisticServices(connection_type).subscribe({
      next: (res) => {
        this.serviceOptions = res;
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting tolls"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  clean(obj) {
    for (var propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      }
    }
    return obj;
  }
  getTSO(zone) {
    this.apiLegalEntity
      .getTSO(zone)
      .subscribe({
        next: (res) => {
          this.contractForm.controls["tso"].setValue(res["id"]);
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
      })
      .add(() => {
        var tso = this.contractForm.get("tso").value;
        var owner = this.contractForm.get("owner").value;
        if (owner && tso) {
          this.getContractsLabels(owner, tso);
        }
      });
  }
  onChangeDurationType($event) {
    var duration_type = this.contractForm.get("duration_type").value;

    if (duration_type === "Intradaily") {
      this.contractForm.controls["start_time"].setValue("");
      this.contractForm.controls["end_time"].setValue("");
      this.contractForm.controls["end_time"].setValidators([
        Validators.required,
      ]);
      this.contractForm.controls["start_time"].setValidators([
        Validators.required,
      ]);
      this.contractForm.controls["duration_hours"].disable();
      this.contractForm.controls["duration_hours"].clearValidators();
      this.contractForm.controls["duration_hours"].addValidators([
        Validators.required,
        Validators.pattern(
          /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/
        ),
        Validators.min(0),
      ]);
      this.contractForm.controls["start_time"].updateValueAndValidity();
      this.contractForm.controls["end_time"].updateValueAndValidity();
      this.contractForm.controls["duration_hours"].updateValueAndValidity();
      this.intradaily = true;
      this.durationObligatory = "*";
    } else {
      this.intradaily = false;
      this.durationObligatory = "";
      this.contractForm.controls["start_time"].setValue("");
      this.contractForm.controls["end_time"].setValue("");
      this.contractForm.controls["duration_hours"].setValue("");
      this.contractForm.controls["duration_hours"].enable();
      this.contractForm.controls["duration_hours"].clearValidators();
      this.contractForm.controls["duration_hours"].addValidators([
        Validators.pattern(
          /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/
        ),
        Validators.min(0),
      ]);
      this.contractForm.controls["end_time"].clearValidators();
      this.contractForm.controls["start_time"].clearValidators();
      this.contractForm.controls["start_time"].updateValueAndValidity();
      this.contractForm.controls["end_time"].updateValueAndValidity();
      this.contractForm.controls["duration_hours"].updateValueAndValidity();
    }
  }

  calculateDuration() {
    
    if (
      this.contractForm.get("start_time").value &&
      this.contractForm.get("end_time").value
    ) {
      this.validateEndtimeAndDayGas();
      var eventStartTime = new Date(this.contractForm.get("start_time").value);
      var eventStartTime2 = new Date(
        2022,
        1,
        1,
        eventStartTime.getHours(),
        eventStartTime.getMinutes()
      );

      var eventEndTime = new Date(this.contractForm.get("end_time").value);
      var eventEndTime2 = new Date(
        2022,
        1,
        1,
        eventEndTime.getHours(),
        eventEndTime.getMinutes()
      );
      var duration = (
        (eventEndTime2.valueOf() - eventStartTime2.valueOf()) *
        0.00000027777777778
      ).toFixed(2);
      if (Number(duration) < 0) {
        duration = (Number(duration) + 24).toString();

        if (eventEndTime2 > this.start_time) {
          this.errorTimeGas = true;
        }
      }
      this.contractForm.controls["duration_hours"].setValue(
        duration.toString().replace(".", ",")
      );
    }
  }
  filterBalanceZones() {
    function pad(num) {
      num = num.toString();

      while (num.length === 1) num = "0" + num;
      return num;
    }
    if (this.contractForm.get("balancing_zone").value) {
      var result = this.zoneOptions.filter(
        (item) => item["id"] == this.contractForm.get("balancing_zone").value
      );

      result.map((x) => {
        this.start_time = new Date(
          2022,
          1,
          1,
          Number(x["day_start_time"].toString().split(":")[0]),
          Number(x["day_start_time"].toString().split(":")[1]),
          0
        );
        this.start_time_hour =
          pad(this.start_time.getHours()) + ':'+ pad(this.start_time.getMinutes());
      });
    }
  }
  validateEndtimeAndDayGas() {
    if (
      this.contractForm.get("start_time").value &&
      this.contractForm.get("end_time").value
    ) {
      var eventStartTime = new Date(this.contractForm.get("start_time").value);
      var eventStartTime2 = new Date(
        2022,
        1,
        1,
        eventStartTime.getHours(),
        eventStartTime.getMinutes()
      );

      var eventEndTime = new Date(this.contractForm.get("end_time").value);
      var eventEndTime2 = new Date(
        2022,
        1,
        1,
        eventEndTime.getHours(),
        eventEndTime.getMinutes()
      );
      var duration = (
        (eventEndTime2.valueOf() - eventStartTime2.valueOf()) *
        0.00000027777777778
      ).toFixed(2);

      if (Number(duration) < 0) {
        duration = (Number(duration) + 24).toString();

        if (eventEndTime2 > this.start_time) {
          this.errorTimeGas = true;
        } else {
          this.errorTimeGas = false;
        }
      }
    }
  }

  getContractsLabels(ownerId, tsoId) {
    var array = [];
    this.apiContract
      .getLogisticContractLabels(ownerId, tsoId)
      .subscribe({
        next: (res) => {
          this.contractLabels = res;
          res.map((x) => {
            array.push(x["label"]);
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
  private filter(value: string): string[] {
    if (this.options) {
      const filterValue = value.toLowerCase();
      return this.options.filter((optionValue) =>
        optionValue.toLowerCase().includes(filterValue)
      );
    }
    return [];
  }

  getFilteredOptions(value: string): Observable<string[]> {
    return of(value).pipe(map((filterString) => this.filter(filterString)));
  }

  onChange() {
    this.filteredOptions$ = this.getFilteredOptions(
      this.input.nativeElement.value
    );
  }

  onSelectionChange($event) {
    this.filteredOptions$ = this.getFilteredOptions($event);
  }

  onChangeOwner($event) {
    this.contractForm.controls["nomination_id"].setValue("");
    var owner = this.contractForm.get("owner").value;
    var tso = this.contractForm.get("tso").value;
    if (owner && tso) {
      this.getContractsLabels(owner, tso);
    }
  }

  getNominationById(id) {
    this.apiContract.getContractNominations(id).subscribe({
      next: (res) => {
        this.rows = res;
        if (this.rows.length == 0) {
          this.rows = null;
        } else {
          this.rows = this.rows.map((x) => {
            x["volume"] = x["volume"].toFixed(2);
            return x;
          });
        }
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting nominations"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
 
}
