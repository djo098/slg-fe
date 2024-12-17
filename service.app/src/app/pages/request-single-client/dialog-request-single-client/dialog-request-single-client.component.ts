import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { CountryService } from "../../../@core/services/country.service";
import { LegalEntityService } from "../../../@core/services/legalEntity.service";
import { messageService } from "../../../@core/utils/messages";
import { BalanceZoneService } from "../../../@core/services/balanceZone.service";
import { DatePipe } from "@angular/common";
import * as moment from "moment";

import { NbDialogRef } from "@nebular/theme";
import { LogisticElementService } from "../../../@core/services/logisticElement.service";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { LogisticElementType } from "../../../@core/schemas/logisticElementType";
import { ContractsService } from "../../../@core/services/contracts.service";
import { TankerTrucksService } from "../../../@core/services/tankerTrucks.service";
import { ConnectionPointService } from "../../../@core/services/connectionPoint.service";
import { NominationsService } from "../../../@core/services/nominations.service";
import { DarkModeService } from "../../../@core/services/sharedServices/darkMode.service";

@Component({
  selector: "ngx-dialog-request-single-client",
  templateUrl: "./dialog-request-single-client.component.html",
  styleUrls: ["./dialog-request-single-client.component.scss"],
})
export class DialogRequestSingleClientComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() operation_type: string;
  @Input() id: number;
  @Input() balance_zone_id: number;
  @Input() country_code: string;
  @Input() request_code: string;
  @Input() request_code_tso: string;
  @Input() delivery_date: string;
  @Input() operation_date: string;
  @Input() carrier_id: number;
  @Input() total_size: number;
  @Input() owner_id: number;
  @Input() load_connection_id: number;
  @Input() logistic_contract_id: number;
  @Input() logistic_contract_label: string;
  @Input() comment: string;
  @Input() client_type: string;
  deliveryForm!: FormGroup;
  operationForm!: FormGroup;
  columns: any;
  rows = [];
  validateRevogrid = true;
  errorSatelital = false;
  satelitalOptions: any;
  labelSatelital: any;
  logisticContractsOptions: any;
  regasificationPlantOptions: any;
  errorRegasificationPlant = false;
  entitiesOptions: any;
  entitiesOptions2: any;
  errorLegalEntity = false;
  errorLegalEntity2 = false;
  zoneOptions: any;
  errorBalanceZone = false;
  countriesOptions: any;
  errorLogisticContract = false;
  loading = false;
  selectedLogisticContracts: any;
  numeral = NumberColumnType.getNumeralInstance();
  isDuplicate = false;
  start_date: any;
  end_date: any;
  balanceZone: any;
  legalEntity: any;
  connection_point: any;
  settings = {
    singleSelection: true,
    text: "",
    enableSearchFilter: true,
    badgeShowLimit: 2,
  };
  revogridTheme: string;
  eventTimes1 = [];
  constructor(
    private formBuilder: FormBuilder,
    private apiLegalEntity: LegalEntityService,
    private messageService: messageService,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
    public datepipe: DatePipe,
    protected ref: NbDialogRef<DialogRequestSingleClientComponent>,
    private apiContract: ContractsService,
    private apiLogisticElement: LogisticElementService,
    private apiConnectionPoint: ConnectionPointService,
    private apiTankerTruck: TankerTrucksService,
    private apiNominations: NominationsService,
    private darkModeService: DarkModeService
  ) {
    this.getCountries();
    this.getLegalEntities();
  }

  ngOnInit(): void {
    this.numeral.locale("es");
    this.darkModeService.isDarkMode == true
      ? (this.revogridTheme = "darkMaterial")
      : (this.revogridTheme = "material");
    this.darkModeService.darkModeChange.subscribe((value) => {
      value == true
        ? (this.revogridTheme = "darkMaterial")
        : (this.revogridTheme = "material");
    });
    this.operationForm = this.formBuilder.group({
      id: new FormControl(""),
      country_code: new FormControl("", Validators.required),
      balancing_zone: new FormControl("", Validators.required),
      carrier_id: new FormControl(""),
      owner_id: new FormControl("", Validators.required),
      load_connection_id: new FormControl("", Validators.required),
      logistic_contract_id: new FormControl("", Validators.required),
      delivery_date: new FormControl("", Validators.required),
      operation_date: new FormControl("", Validators.required),
      total_size: new FormControl("", [
        Validators.required,
        Validators.pattern(
          /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/
        ),
        Validators.min(0),
      ]),
      request_code: new FormControl(""),
      request_code_tso: new FormControl(""),
      comment: new FormControl(""),
      client_type: new FormControl(""),
    });
    this.deliveryForm = this.formBuilder.group({
      satelital: new FormControl("", Validators.required),
    });
    this.columns = [
      {
        prop: "delivery_point",
        name: "Satelital Plant",
        size: 300,
        readonly: true,
      },
      {
        prop: "value",
        name: "Energy (Kwh)",
        size: 130,
        cellProperties: ({ prop, model, data, column }) => {
          return {
            class: {
              numeric: true,
            },
          };
        },
      },
      {
        readonly: true,
        size: 50,
        cellTemplate: (createElement, props) => {
          return createElement(
            "button",
            {
              onClick: () => this.doDelete(props.rowIndex),
              class: {
                "btn-delete": true,
              },
            },
            "DELETE"
          ); /* h(
          "button",
          {
            onClick: () => this.doDelete(props.rowIndex),
           
          },
          "delete"
        ); */
        },
      },
    ];
    if (this.action == "Add") {
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object = JSON.parse(localStorage.getItem("settings_parameters"));
        this.operationForm.get("country_code").setValue(object["country_code"]);
        this.operationForm
          .get("balancing_zone")
          .setValue(object["balancing_zone"]);
        this.getbalanceZones(object["country_code"]);

        this.getRegasificationPlants(
          object["balancing_zone"],
          "tanker_truck_connection"
        );
        this.getSatellitePlants(object["balancing_zone"], "satellite_plant");
      }
    } else if (this.action == "Update") {
      this.loading = true;
      this.getDeliveries(this.id);
      this.operationForm.get("id").setValue(this.id);
      this.operationForm.get("country_code").setValue(this.country_code);
      this.operationForm.get("balancing_zone").setValue(this.balance_zone_id);
      this.operationForm.get("carrier_id").setValue(this.carrier_id);
      this.operationForm.get("owner_id").setValue(this.owner_id);
      this.operationForm.get("comment").setValue(this.comment);
      this.operationForm
        .get("logistic_contract_id")
        .setValue([this.logistic_contract_id]);

      this.operationForm
        .get("load_connection_id")
        .setValue(this.load_connection_id);
      if (this.delivery_date) {
        this.operationForm
          .get("delivery_date")
          .setValue(
            new Date(
              Number(this.delivery_date.split("-")[0]),
              Number(this.delivery_date.split("-")[1]) - 1,
              Number(this.delivery_date.split("-")[2])
            )
          );
      }
      if (this.operation_date) {
        this.operationForm
          .get("operation_date")
          .setValue(
            new Date(
              Number(this.operation_date.split("-")[0]),
              Number(this.operation_date.split("-")[1]) - 1,
              Number(this.operation_date.split("-")[2])
            )
          );
      }

      this.operationForm
        .get("total_size")
        .setValue(this.numeral(this.total_size).format("0,0.[0000000000]"));
      this.operationForm.get("request_code").setValue(this.request_code);
      this.operationForm
        .get("request_code_tso")
        .setValue(this.request_code_tso);
      this.operationForm.get("request_code").disable();
      this.operationForm.get("request_code_tso").disable();
      this.getbalanceZones(this.country_code);

      this.getRegasificationPlants(
        this.balance_zone_id,
        "tanker_truck_connection"
      );
      this.getLogisticContracts(this.owner_id, this.load_connection_id);
      this.getSatellitePlants(this.balance_zone_id, "satellite_plant");
    } else if (this.action == "View") {
      this.loading = true;
      this.getDeliveries(this.id);
      this.operationForm.get("id").setValue(this.id);
      this.operationForm.get("country_code").setValue(this.country_code);
      this.operationForm.get("balancing_zone").setValue(this.balance_zone_id);
      this.operationForm.get("carrier_id").setValue(this.carrier_id);
      this.operationForm.get("owner_id").setValue(this.owner_id);
      this.operationForm.get("client_type").setValue(this.client_type);
      this.operationForm
        .get("logistic_contract_id")
        .setValue(this.logistic_contract_id);
      this.operationForm
        .get("load_connection_id")
        .setValue(this.load_connection_id);
      if (this.delivery_date) {
        this.operationForm
          .get("delivery_date")
          .setValue(
            new Date(
              Number(this.delivery_date.split("-")[0]),
              Number(this.delivery_date.split("-")[1]) - 1,
              Number(this.delivery_date.split("-")[2])
            )
          );
      }
      if (this.operation_date) {
        this.operationForm
          .get("operation_date")
          .setValue(
            new Date(
              Number(this.operation_date.split("-")[0]),
              Number(this.operation_date.split("-")[1]) - 1,
              Number(this.operation_date.split("-")[2])
            )
          );
      }
      this.operationForm
        .get("total_size")
        .setValue(this.numeral(this.total_size).format("0,0.[0000000000]"));
      this.operationForm.get("request_code").setValue(this.request_code);
      this.operationForm
        .get("request_code_tso")
        .setValue(this.request_code_tso);
      this.getbalanceZones(this.country_code);

      this.getRegasificationPlants(
        this.balance_zone_id,
        "tanker_truck_connection"
      );
      this.getLogisticContracts(this.owner_id, this.load_connection_id);
      this.getSatellitePlants(this.balance_zone_id, "satellite_plant");
      this.operationForm.disable();
      this.columns = [
        {
          prop: "delivery_point",
          name: "Satelital Plant",
          size: 300,
          readonly: true,
        },
        {
          prop: "value",
          name: "Energy (Kwh)",
          size: 100,
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
      this.settings = Object.assign({ disabled: true }, this.settings);
    }
  }
  onAfterEdit($event) {}
  onBeforeEditStart(e, { detail }) {
    this.eventTimes1.push("Called");
    if (this.eventTimes1.length == 1) {

     if(detail.val == ''){
      detail.val = detail.model[detail.prop].toString().replace(/\./g, "");
     } else {
      detail.val=detail.val
     }

    }
  }
  onBeforeEdit(e, { detail }) {
    this.validateRevogrid = true;

    if (detail.model !== undefined) {
      if (
        /^[+]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/.test(
          detail.val
        ) == false
      ) {
        this.validateRevogrid = false;
        e.preventDefault();
      }
    }
  }
  onBeforeRangeEdit(e, { detail }) {
    this.validateRevogrid = true;

    if (detail.models !== undefined) {
      for (const data in detail.data) {
        for (const prop in Object.keys(detail.data[data])) {
          var value = Object.values(detail.data[data])[prop].toString();

          if (
            /^[+]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/.test(
              value
            ) == false
          ) {
            this.validateRevogrid = false;
            e.preventDefault();
          }else {
            for (const key in detail.data) {
              if (detail.data.hasOwnProperty(key)) {
                for (const key1 in detail.data[key]) {
                  detail.data[key][key1] = this.numeral(
                    Number(
                      detail.data[key][key1]
                        .toString()
                        .replace(/\./g, "")
                        .replace(",", ".")
                    )
                  ).format("0,0.[0000000000]");
                }
              }
            }
          }
        }
      }
    }
  }
  onChangeSatelital($event) {
    let selectedValue = this.satelitalOptions.find(
      (item) => item.id === $event
    );

    this.labelSatelital = selectedValue.name;
  }
  onChangeZone($event) {
    this.operationForm.get("logistic_contract_id").setValue("");
    this.logisticContractsOptions = [];
    this.getRegasificationPlants(
      this.operationForm.get("balancing_zone").value,
      "tanker_truck_connection"
    );
    this.operationForm.controls["load_connection_id"].setValue("");
    this.getSatellitePlants(
      this.operationForm.get("balancing_zone").value,
      "satellite_plant"
    );
    this.deliveryForm.controls["satelital"].setValue("");
  }
  onChangeCountry($event) {
    this.operationForm.get("logistic_contract_id").setValue("");
    this.logisticContractsOptions = [];
    this.getbalanceZones(this.operationForm.get("country_code").value);
    this.operationForm.controls["balancing_zone"].setValue("");

    this.operationForm.controls["carrier_id"].setValue("");
    this.operationForm.controls["load_connection_id"].setValue("");
    this.regasificationPlantOptions = [];
  }
  onChangeOwner($event) {
    this.operationForm.get("logistic_contract_id").setValue("");
    this.logisticContractsOptions = [];
    if (this.operationForm.get("load_connection_id").value) {
      this.getLogisticContracts(
        this.operationForm.get("owner_id").value,
        this.operationForm.get("load_connection_id").value,
        true
      );
    }
    /*     this.getLogisticContracts();
    this.operationForm.get("logistric_contract_id").setValue("");
    this.selectedLogisticContracts = []; */
  }
  onChangeRegasificationPlant($event) {
    this.operationForm.get("logistic_contract_id").setValue("");
    this.logisticContractsOptions = [];
    if (this.operationForm.get("owner_id").value) {
      this.getLogisticContracts(
        this.operationForm.get("owner_id").value,
        this.operationForm.get("load_connection_id").value,
        true
      );
    }
    /*   this.getLogisticContracts();
    this.operationForm.get("logistric_contract_id").setValue("");
    this.selectedLogisticContracts = []; */
  }
  cancel() {
    this.ref.close();
  }
  addRow() {
    this.rows.push({
      delivery_point_id: this.deliveryForm.get("satelital").value,
      delivery_point: this.labelSatelital,
      value: 0,
    });

    document.querySelector("revo-grid").source = [];
    document.querySelector("revo-grid").source = this.rows;
    document
      .querySelector("revo-grid")
      .getSource()
      .then((value) => {
        var valueArr = value.map(function (item) {
          return item.delivery_point_id;
        });
        this.isDuplicate = valueArr.some(function (item, idx) {
          return valueArr.indexOf(item) != idx;
        });
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
  getLegalEntities() {
    this.apiLegalEntity.getAllLegalEntitiesByCountry().subscribe({
      next: (res) => {
        this.entitiesOptions2 = res.sort((a, b) => (a.name > b.name ? 1 : -1));
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
  getLogisticContracts(owner_id, connection_point, change?) {
    this.apiContract
      .getLogisticContractLabels(owner_id, null, connection_point)
      .subscribe({
        next: (res) => {
          this.logisticContractsOptions = res;
          if (this.logisticContractsOptions.length == 0) {
            this.errorLogisticContract = true;
          } else {
            this.errorLogisticContract = false;
          }
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting logistic contracts"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        var options;

        var options_temp = [];
        options = this.logisticContractsOptions;
        /*    options = this.logisticContractsOptions.filter((item) => {
          if (this.operationForm.get("owner_id").value) {
            return item.owner_id == this.operationForm.get("owner_id").value;
          } else {
            return item;
          }
        });
        options = this.logisticContractsOptions.filter((item) => {
          if (this.operationForm.get("load_connection_id").value) {
            return item.connection_point_id == this.operationForm.get("load_connection_id").value;
          } else {
            return item;
          }
        });
; */
        options.map((x) => {
          options_temp.push({ itemName: x["label"], id: x["id"] });
          return x;
        });
        this.logisticContractsOptions = [];
        this.logisticContractsOptions = options_temp;
        if (this.logisticContractsOptions.length == 0) {
          this.errorLogisticContract = true;
        } else {
          this.errorLogisticContract = false;
        }
        this.selectedLogisticContracts = [
          {
            id: this.logistic_contract_id,
            itemName: this.logistic_contract_label,
          },
        ];
        if (change) {
          this.selectedLogisticContracts = [];
        }
        this.loading = false;
      });
  }
  getSatellitePlants(zone, type) {
    this.apiLogisticElement
      .getLogisticElementByTypeBalanceZone(zone, type)
      .subscribe({
        next: (res) => {
          this.satelitalOptions = res;
          if (this.satelitalOptions.length == 0) {
            this.errorSatelital = true;
          } else {
            this.errorSatelital = false;
          }
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting satellite plants"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        var options = this.satelitalOptions.filter((item) => {
          return item.retail == false;
        });
        this.satelitalOptions = options;
      });
  }
  getDeliveries(id) {
    this.apiTankerTruck
      .getTankerTruckDeliveries(id, this.operation_type)
      .subscribe({
        next: (res) => {
          this.rows = res;
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
      })
      .add(() => {
        document.querySelector("revo-grid").source = [];
        document.querySelector("revo-grid").source = this.rows;
      });
  }
  add() {
    if (this.operationForm.valid) {
      var logistic_contract_id;
      this.operationForm.get("logistic_contract_id").value.map((x) => {
        logistic_contract_id = x["id"];
      });
      var object = {
        id: this.operationForm.get("id").value
          ? this.operationForm.get("id").value
          : null,
        carrier_id: this.operationForm.get("carrier_id").value,
        owner_id: this.operationForm.get("owner_id").value,
        load_connection_id: this.operationForm.get("load_connection_id").value,
        logistic_contract_id: logistic_contract_id,
        delivery_date: this.datepipe.transform(
          this.operationForm.get("delivery_date").value,
          "yyyy-MM-dd"
        ),
        operation_date: this.datepipe.transform(
          this.operationForm.get("operation_date").value,
          "yyyy-MM-dd"
        ),
        total_size: Number(
          this.operationForm
            .get("total_size")
            .value.toString()
            .replace(/\./g, "")
            .replace(",", ".")
        ),
        request_code: this.operationForm.get("request_code").value
          ? Number(
              this.operationForm
                .get("request_code")
                .value.toString()
                .replace(/\./g, "")
                .replace(",", ".")
            )
          : null,
        request_code_tso: this.operationForm.get("request_code_tso").value
          ? this.operationForm.get("request_code_tso").value
          : null,
        client_type: "SINGLE_CLIENT_TANKERS",
        comment: this.operationForm.get("comment").value
          ? this.operationForm.get("comment").value
          : null,
      };
      if (this.action == "Add") {
        this.apiTankerTruck
          .addTankerTruckOperation(this.clean(object))
          .subscribe({
            next: (res) => {
              document
                .querySelector("revo-grid")
                .getSource()
                .then((value) => {
                  value.map((x, index) => {
                    x["value"] = Number(
                      x["value"].toString().replace(/\./g, "").replace(",", ".")
                    );
                  });
                  var valuesWithoutZero = value.filter(
                    (item) => item["value"] != 0
                  );
                  if (valuesWithoutZero) {
                    this.apiTankerTruck
                      .setTankerTruckDeliveries(
                        res.id,
                        this.operation_type,
                        valuesWithoutZero
                      )
                      .subscribe({
                        next: (res) => {
                          this.ref.close("save");
                          this.messageService.showToast(
                            "success",
                            "Success",
                            "Request single client updated successfully!"
                          );
                        },
                        error: (e) => {
                          if (e.error.title == "Internal Server Error") {
                            this.messageService.showToast(
                              "danger",
                              "Error",
                              "Internal server error while getting regasifications plants"
                            );
                          } else {
                            this.messageService.showToast(
                              "danger",
                              "Error",
                              e.error
                            );
                          }
                        },
                      });
                  }
                });
            },
            error: (e) => {
              if (e.error.title == "Internal Server Error") {
                this.messageService.showToast(
                  "danger",
                  "Error",
                  "Internal server error while adding tanker truck request"
                );
              } else {
                this.messageService.showToast("danger", "Error", e.error);
              }
            },
          });
      } else if (this.action == "Update") {
        this.update(object);
      }
    }
  }
  update(object) {
    this.apiTankerTruck
      .updateTankerTruckOperation(this.clean(object))
      .subscribe({
        next: (res) => {
          document
            .querySelector("revo-grid")
            .getSource()
            .then((value) => {
              value.map((x, index) => {
                x["value"] = Number(
                  x["value"].toString().replace(/\./g, "").replace(",", ".")
                );
              });
              var valuesWithoutZero = value.filter(
                (item) => item["value"] != 0
              );
              if (valuesWithoutZero) {
                this.apiTankerTruck
                  .setTankerTruckDeliveries(
                    this.id,
                    this.operation_type,
                    valuesWithoutZero
                  )
                  .subscribe({
                    next: (res) => {
                      this.ref.close("update");
                      this.messageService.showToast(
                        "success",
                        "Success",
                        "Request single client updated successfully!"
                      );
                    },
                    error: (e) => {
                      if (e.error.title == "Internal Server Error") {
                        this.messageService.showToast(
                          "danger",
                          "Error",
                          "Internal server error while getting regasifications plants"
                        );
                      } else {
                        this.messageService.showToast(
                          "danger",
                          "Error",
                          e.error
                        );
                      }
                    },
                  });
              }
            });
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while adding tanker truck request"
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
  doDelete(rowIndex) {
    this.rows.splice(rowIndex, 1);
    document.querySelector("revo-grid").source = [];
    document.querySelector("revo-grid").source = this.rows;
    document
      .querySelector("revo-grid")
      .getSource()
      .then((value) => {
        var valueArr = value.map(function (item) {
          return item.delivery_point_id;
        });
        this.isDuplicate = valueArr.some(function (item, idx) {
          return valueArr.indexOf(item) != idx;
        });
      });
  }
  submit() {
    this.start_date = this.datepipe.transform(
      this.operationForm.get("operation_date").value,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.operationForm.get("operation_date").value,
      "yyyy-MM-dd"
    );
    this.balanceZone = this.operationForm.get("balancing_zone").value;
    this.legalEntity = this.operationForm.get("owner_id").value;
    this.connection_point = this.operationForm.get("load_connection_id").value;

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
