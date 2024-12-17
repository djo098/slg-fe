import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { NbDialogRef } from "@nebular/theme";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { BalanceZoneService } from "../../../@core/services/balanceZone.service";
import { CountryService } from "../../../@core/services/country.service";
import { messageService } from "../../../@core/utils/messages";
import { LegalEntityService } from "../../../@core/services/legalEntity.service";
import * as moment from "moment";
import { DatePipe, formatNumber } from "@angular/common";
import { BalanceService } from "../../../@core/services/balance.service";
import { DarkModeService } from "../../../@core/services/sharedServices/darkMode.service";
import { LogisticElementService } from "../../../@core/services/logisticElement.service";
import { OptimizationService } from "../../../@core/services/optimization.service";
import { map } from "rxjs/operators";
import { MarketDataService } from "../../../@core/services/marketData.service";

@Component({
  selector: "slg-dialog-optimization",
  templateUrl: "./dialog-optimization.component.html",
  styleUrls: ["./dialog-optimization.component.scss"],
})
export class DialogOptimizationComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() id: number;
  @Input() label: string;
  @Input() country: string;
  @Input() balancing_zone_id: number;
  @Input() legal_entity_id: number;
  @Input() start_date: string;
  @Input() end_date: string;
  @Input() simulation_id: number;
  @Input() curves_ids: any;
  numeral = NumberColumnType.getNumeralInstance();
  optimizationForm!: FormGroup;
  columns: any;
  rows: any = [];
  columns1: any;
  rows1: any = [];
  errorBalanceZone = false;
  errorDateRange = false;
  errorLegalEntity = false;
  zoneOptions: any;
  countriesOptions: any;
  entitiesOptions: any;
  loading = false;
  simulationOptions: any;
  errorSimulation = false;
  revogridTheme: string;
  validateRevogrid: boolean;
  validateRevogrid1: boolean;
  loadingBalanceRules = false;
  loadingRestrictions = false;
  logisticElementOptions: any = [];
  eventTimes1 = [];
  eventTimes = [];
  eventTimes2 = [];
  eventTimes3 = [];
  dataRestrictions = [];
  loading_array = [];
  curves: any;
  errorCurve = false;
  columnsRestrictions: any = [];
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
    this.optimizationForm = this.formBuilder.group({
      id: new FormControl("", [Validators.required]),
      label: new FormControl("", [Validators.required]),
      entity_id: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      balance_zone_id: new FormControl("", [Validators.required]),
      date: new FormControl("", [Validators.required, this.dateRangeValidator]),
      simulation_id: new FormControl("", [Validators.required]),
      curve: new FormControl([]),
    });
    this.columns = [
      {
        prop: "element",
        name: "Element",
        size: 100 + Number(String("Element").length) * 3,
        readonly: true,
      },
      {
        prop: "min",
        name: "Min (Kwh)",
        size: 100 + Number(String("Min (Kwh)").length) * 3,
        cellProperties: ({ prop, model, data, column }) => {
          return {
            class: {
              numeric: true,
            },
          };
        },
      },
      {
        prop: "max",
        name: "Max (Kwh)",
        size: 100 + Number(String("Max (Kwh)").length) * 3,
        cellProperties: ({ prop, model, data, column }) => {
          return {
            class: {
              numeric: true,
            },
          };
        },
      },
    ];

    setTimeout(() => {
      document
        .querySelectorAll("revo-grid")
        .forEach((element) => (element.resize = true));
      document
        .querySelectorAll("revo-grid")
        .forEach((element) => (element.autoSizeColumn = true));
    }, 100);
    if (this.action == "Update") {
      this.getSimulations(this.balancing_zone_id);
      this.optimizationForm.get("id").setValue(this.id);
      this.optimizationForm.get("label").setValue(this.label);
      this.optimizationForm
        .get("entity_id")
        .setValue(Number(this.legal_entity_id));
      this.getbalanceZones(this.country);
      this.optimizationForm.get("country_code").setValue(this.country);
      this.optimizationForm
        .get("balance_zone_id")
        .setValue(Number(this.balancing_zone_id));
      this.optimizationForm
        .get("simulation_id")
        .setValue(Number(this.simulation_id));
      this.optimizationForm.get("date").setValue({
        start: new Date(
          Number(this.start_date.split("-")[0]),
          Number(this.start_date.split("-")[1]) - 1,
          Number(this.start_date.split("-")[2])
        ),
        end: new Date(
          Number(this.end_date.split("-")[0]),
          Number(this.end_date.split("-")[1]) - 1,
          Number(this.end_date.split("-")[2])
        ),
      });
      var curves_temp = [];
      this.curves_ids.map((x) => {
        curves_temp.push(x["id"]);
      });
      this.optimizationForm.get("curve").setValue(curves_temp);
      this.getBalanceRules(this.id);
      this.getCurves(this.balancing_zone_id);
      this.getOperationsRestrictions(
        null,
        null,
        null,
        this.id
      );
      this.optimizationForm.disable();
      this.optimizationForm.get("curve").enable();
    } else if (this.action == "Add") {
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object = JSON.parse(localStorage.getItem("settings_parameters"));
        this.optimizationForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.getbalanceZones(object["country_code"]);
        this.optimizationForm
          .get("balance_zone_id")
          .setValue(object["balancing_zone"]);
        this.getLogisticElements(object["balancing_zone"]);
        this.getSimulations(object["balancing_zone"]);
        this.getCurves(object["balancing_zone"]);
      }
    }
    this.optimizationForm.controls["id"].disable();
  }

  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogOptimizationComponent>,
    private apiBalanceZone: BalanceZoneService,
    private apiCountry: CountryService,
    private apiOptimization: OptimizationService,
    private apiMarketData: MarketDataService,
    private apiLegalEntity: LegalEntityService,
    public datepipe: DatePipe,
    private apiBalance: BalanceService,
    private apiLogisticElement: LogisticElementService,
    private darkModeService: DarkModeService
  ) {
    this.getCountries();
    this.getLegalEntities();
  }

  cancel() {
    this.ref.close();
  }
  private dateRangeValidator: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date =
      this.optimizationForm && this.optimizationForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.optimizationForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.optimizationForm.get("date").value.end,
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
  add() {
    if (this.optimizationForm.valid) {
      this.loading = true;
      var object = {
        id: this.optimizationForm.get("id").value
          ? this.optimizationForm.get("id").value
          : null,
        start_date: this.datepipe.transform(
          this.optimizationForm.get("date").value.start,
          "yyyy-MM-dd"
        ),
        end_date: this.datepipe.transform(
          this.optimizationForm.get("date").value.end,
          "yyyy-MM-dd"
        ),
        label: this.optimizationForm.get("label").value,
        balance_zone_id: this.optimizationForm.get("balance_zone_id").value,
        legal_entity_id: this.optimizationForm.get("entity_id").value,
        simulation_id: this.optimizationForm.get("simulation_id").value,
        curve_id: this.optimizationForm.get("curve").value
          ? this.optimizationForm.get("curve").value
          : null,
      };
      if (this.action == "Add") {
        this.loading = true;
        this.apiOptimization
          .createOptimizationScenario(this.clean(object))
          .subscribe({
            next: (res) => {
              this.messageService.showToast(
                "success",
                "Success",
                "Optimization scenario added successfully!"
              );
              document.querySelectorAll("revo-grid").forEach((element) => {
                if (element.id == "operation_restrictions") {
                  element.getSource().then((value) => {
                    if (value.length != 0) {
                      value.map((x, index) => {
                        for (let item1 in Object.keys(x)) {
                          if (Object.keys(x)[item1] != "DATE") {
                            x[Object.keys(x)[item1]] = Number(
                              x[Object.keys(x)[item1]]
                                .toString()
                                .replace(/\./g, "")
                                .replace(",", ".")
                            );
                          }
                        }

                        return x;
                      });

                      this.addOperationRestrictions(res.id, value);
                    } else {
                      this.addOperationRestrictions(res.id, []);
                    }
                  });
                } else if (element.id == "balance_rules") {
                  element.getSource().then((value) => {
                    if (value.length != 0) {
                      value.map((x, index) => {
                        if (x["min"] != null) {
                          x["min"] = Number(
                            x["min"]
                              .toString()
                              .replace(/\./g, "")
                              .replace(",", ".")
                          );
                        }
                        if (x["max"] != null) {
                          x["max"] = Number(
                            x["max"]
                              .toString()
                              .replace(/\./g, "")
                              .replace(",", ".")
                          );
                        }

                        return x;
                      });
                      this.addBalanceRules(res.id, value);
                    } else {
                      this.addBalanceRules(res.id, []);
                    }
                  });
                }
              });
              /*    this.optimizationForm.reset();
              this.ref.close("save"); */
            },
            error: (e) => {
              this.loading = false;
              if (e.error.title == "Internal Server Error") {
                this.messageService.showToast(
                  "danger",
                  "Error",
                  "Internal server error while adding optimization scenario"
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
    this.loading = true;
    this.apiOptimization
      .updateOptimizationScenario(this.clean(object))
      .subscribe({
        next: (res) => {
          this.messageService.showToast(
            "success",
            "Success",
            "Optimization scenario updated successfully!"
          );
          document.querySelectorAll("revo-grid").forEach((element) => {
            if (element.id == "operation_restrictions") {
              element.getSource().then((value) => {
                if (value.length != 0) {
                  value.map((x, index) => {
                    for (let item1 in Object.keys(x)) {
                      if (Object.keys(x)[item1] != "DATE") {
                        x[Object.keys(x)[item1]] = Number(
                          x[Object.keys(x)[item1]]
                            .toString()
                            .replace(/\./g, "")
                            .replace(",", ".")
                        );
                      }
                    }

                    return x;
                  });
                  this.addOperationRestrictions(res.id, value);
                } else {
                  this.addOperationRestrictions(res.id, []);
                }
              });
            } else if (element.id == "balance_rules") {
              element.getSource().then((value) => {
                if (value.length != 0) {
                  value.map((x, index) => {
                    if (x["min"] != null) {
                      x["min"] = Number(
                        x["min"].toString().replace(/\./g, "").replace(",", ".")
                      );
                    }
                    if (x["max"] != null) {
                      x["max"] = Number(
                        x["max"].toString().replace(/\./g, "").replace(",", ".")
                      );
                    }

                    return x;
                  });
                  this.addBalanceRules(res.id, value);
                } else {
                  this.addBalanceRules(res.id, []);
                }
              });
            }
          });
        },
        error: (e) => {
          this.loading = false;
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while updating optimization scenario"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }
  getbalanceZones(country) {
    this.loading = true;
    this.loading_array[0] = true;
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
              "Internal server error while getting balance zones"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.loading_array[0] = false;
        if (this.loading_array.includes(true) == false) {
          this.loading = false;
        }
      });
  }
  getCountries() {
    this.loading = true;
    this.loading_array[1] = true;
    this.apiCountry
      .getcountries()
      .subscribe({
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
      })
      .add(() => {
        this.loading_array[1] = false;
        if (this.loading_array.includes(true) == false) {
          this.loading = false;
        }
      });
  }
  getLegalEntities() {
    this.loading = true;
    this.loading_array[2] = true;
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
      })
      .add(() => {
        this.loading_array[2] = false;
        if (this.loading_array.includes(true) == false) {
          this.loading = false;
        }
      });
  }
  onChangeCountry($event) {
    this.optimizationForm.controls["balance_zone_id"].setValue("");
    this.getbalanceZones(this.optimizationForm.get("country_code").value);
  }
  onChangeZone($event) {
    this.getSimulations($event);
    this.optimizationForm.controls["simulation_id"].setValue("");
    this.getLogisticElements($event);
    this.getCurves($event);
    if (this.optimizationForm.get("date").value) {
      this.getOperationsRestrictions(
        $event,
        this.datepipe.transform(
          this.optimizationForm.get("date").value.start,
          "yyyy-MM-dd"
        ),
        this.datepipe.transform(
          this.optimizationForm.get("date").value.end,
          "yyyy-MM-dd"
        ),
        null
      );
    }
  }
  getSimulations(zone) {
    this.loading = true;
    this.loading_array[3] = true;
    this.apiBalance
      .getAllBalanceSimulations()
      .subscribe({
        next: (res) => {
          this.simulationOptions = res;

          this.simulationOptions = this.simulationOptions.filter((item) => {
            return item["balance_zone_id"] == zone;
          });
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting simulations"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.loading_array[3] = false;
        if (this.loading_array.includes(true) == false) {
          this.loading = false;
        }
      });
  }
  getLogisticElements(zone) {
    this.loading = true;
    this.loading_array[4] = true;
    this.apiLogisticElement
      .getLogisticElementByTypeBalanceZone(zone)
      .subscribe({
        next: (res) => {
          this.logisticElementOptions = res;
          this.logisticElementOptions = this.logisticElementOptions.filter(
            (item) => {
              return (
                item["balance_zone_id"] == zone &&
                (item["type"] == "virtual_balancing_point" ||
                  item["type"] == "underground_storage" ||
                  item["type"] == "tank")
              );
            }
          );
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting logistic elements"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.rows = [];
        for (let element in this.logisticElementOptions) {
          this.rows.push({
            element_id: this.logisticElementOptions[element]["id"],
            element: this.logisticElementOptions[element]["name"],
            min: 0,
            max: 0,
          });
        }
        document.querySelectorAll("revo-grid").forEach((element) => {
          if (element.id == "balance_rules") {
            element.source = [];
            element.source = this.rows;
          }
        });
        if (this.optimizationForm.get("date").value) {
          this.dateChange(this.optimizationForm.get("date").value);
        }
        this.loading_array[4] = false;
        if (this.loading_array.includes(true) == false) {
          this.loading = false;
        }
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
  onAfterEdit({ detail }) {}
  onBeforeEdit(e, { detail }) {
    this.validateRevogrid = true;

    this.eventTimes = [];
    if (detail.model !== undefined) {
      if (
        /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/.test(
          detail.val
        ) == false
      ) {
        this.validateRevogrid = false;
        e.preventDefault();
      } else {
        detail.val = this.numeral(
          Number(detail.val.toString().replace(/\./g, "").replace(",", "."))
        ).format("0,0.[000000000000]");
      }
    }
  }
  onBeforeEditStart(e, { detail }) {
    this.eventTimes1.push("Called");
    if (this.eventTimes1.length == 1) {
      if (detail.val == "") {
        detail.val = detail.model[detail.prop].toString().replace(/\./g, "");
      } else {
        detail.val = detail.val;
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
            /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/.test(
              value
            ) == false
          ) {
            this.validateRevogrid = false;
            e.preventDefault();
          } else {
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
                  ).format("0,0.[000000000000]");
                }
              }
            }
          }
        }
      }
    }
  }
  onAfterEdit1({ detail }) {}
  onBeforeEdit1(e, { detail }) {
    this.validateRevogrid1 = true;

    this.eventTimes2 = [];
    if (detail.model !== undefined) {
      if (
        /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/.test(
          detail.val
        ) == false
      ) {
        this.validateRevogrid = false;
        e.preventDefault();
      } else {
        detail.val = this.numeral(
          Number(detail.val.toString().replace(/\./g, "").replace(",", "."))
        ).format("0,0.[000000000000]");
      }
    }
  }
  onBeforeEditStart1(e, { detail }) {
    this.eventTimes3.push("Called");
    if (this.eventTimes3.length == 1) {
      if (detail.val == "") {
        detail.val = detail.model[detail.prop].toString().replace(/\./g, "");
      } else {
        detail.val = detail.val;
      }
    }
  }
  onBeforeRangeEdit1(e, { detail }) {
    this.validateRevogrid1 = true;

    if (detail.models !== undefined) {
      for (const data in detail.data) {
        for (const prop in Object.keys(detail.data[data])) {
          var value = Object.values(detail.data[data])[prop].toString();
          if (
            /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/.test(
              value
            ) == false
          ) {
            this.validateRevogrid = false;
            e.preventDefault();
          } else {
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
                  ).format("0,0.[000000000000]");
                }
              }
            }
          }
        }
      }
    }
  }


  dateChange($event) {
    if (
      $event.start != null &&
      $event.start != undefined &&
      $event.end != null &&
      $event.end != undefined &&
      this.optimizationForm.get("balance_zone_id").value
    ) {
      this.dataRestrictions = [];
      this.getOperationsRestrictions(
        this.optimizationForm.get("balance_zone_id").value,
        this.datepipe.transform($event.start, "yyyy-MM-dd"),
        this.datepipe.transform($event.end, "yyyy-MM-dd"),
        null
      );
    }
  }
  getBalanceRules(id) {
    this.loading = true;
    this.loading_array[5] = true;
    this.apiOptimization
      .getStockRulesOptimizationScenario(null,id)
      .pipe(
        map((data) => {
          return data.map((x, index) => {
            if (x["min"] != null) {
              this.numeral(Number(x["min"].toFixed(2))).format("0,0.[0000]");
            }
            if (x["max"] != null) {
              x["max"] = this.numeral(Number(x["max"].toFixed(2))).format(
                "0,0.[0000]"
              );
            }

            return x;
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.rows = res;
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting balance rules"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        document.querySelectorAll("revo-grid").forEach((element) => {
          if (element.id == "balance_rules") {
            element.source = [];
            element.source = this.rows;
          }
        });
        this.loading_array[5] = false;
        if (this.loading_array.includes(true) == false) {
          this.loading = false;
        }
      });
  }
  getOperationsRestrictions(zone, start_date, end_date,id) {
    this.loading = true;
    this.loading_array[6] = true;
    this.apiOptimization
      .getOperationRestrictionsOptimizationScenario(zone, start_date, end_date,id)
      .pipe(
        map((data) => {
          return data.map((x, index) => {
            this.columnsRestrictions = x["columns"];
            index == 0 ? (x["isActive"] = true) : (x["isActive"] = false);
            x["columns"]?.map((j) => {
              j["sortable"] = true;

              j["size"] = 100 + Number(j["name"].length) * 3;

              if (j["name"] == "Date") {
                j["pin"] = "colPinStart";
              } else if (j["filter"] == "string") {
                j["columnType"] = "string";
              } else if (j["filter"] == "number") {
                x["rows"]?.map((e, index) => {
                  e[j["prop"]] = this.numeral(
                    Number(e[j["prop"]].toFixed(2))
                  ).format("0,0.[0000]");
                });
                j["columnType"] = "numeric";
                j["cellProperties"] = ({ prop, model, data, column }) => {
                  return {
                    class: {
                      numeric: true,
                    },
                  };
                };
              }

              if (j["name"] == "Purchases/Sales") {
                j["columnTemplate"] = (createElement, column) => {
                  return createElement(
                    "span",
                    {
                      class: {
                        "column-ps": true,
                      },
                    },
                    column.name
                  );
                };
                j.children?.map((c) => {
                  c["columnTemplate"] = (createElement, column) => {
                    return createElement(
                      "span",
                      {
                        class: {
                          "column-ps": true,
                        },
                      },
                      column.name
                    );
                  };
                });
              } else if (j["name"] == "Logistic Operations") {
                j["columnTemplate"] = (createElement, column) => {
                  return createElement(
                    "span",
                    {
                      class: {
                        "column-lgso": true,
                      },
                    },
                    column.name
                  );
                };
                j.children?.map((c) => {
                  c["columnTemplate"] = (createElement, column) => {
                    return createElement(
                      "span",
                      {
                        class: {
                          "column-lgso": true,
                        },
                      },
                      column.name
                    );
                  };
                });
              } else if (j["name"] == "Swaps") {
                j["columnTemplate"] = (createElement, column) => {
                  return createElement(
                    "span",
                    {
                      class: {
                        "column-swaps": true,
                      },
                    },
                    column.name
                  );
                };
                j.children?.map((c) => {
                  c["columnTemplate"] = (createElement, column) => {
                    return createElement(
                      "span",
                      {
                        class: {
                          "column-swaps": true,
                        },
                      },
                      column.name
                    );
                  };
                });
              }
              j.children?.map((c) => {
                c["sortable"] = true;
                c["size"] = 100 + Number(c["name"].length) * 3;
                c["autoSize"] = true;
                if (c["name"] == "Date") {
                  c["pin"] = "colPinStart";
                } else if (c["filter"] == "number") {
                  x["rows"]?.map((e, index) => {
                    e[c["prop"]] = this.numeral(
                      Number(e[c["prop"]].toFixed(2))
                    ).format("0,0.[0000]");
                  });
                  c["cellProperties"] = ({ prop, model, data, column }) => {
                    return {
                      class: {
                        numeric: true,
                      },
                    };
                  };
                }
              });
            });

            return x;
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.dataRestrictions = res;
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting operation restrictions"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.loading_array[6] = false;
        if (this.loading_array.includes(true) == false) {
          this.loading = false;
        }
      });
  }
  addOperationRestrictions(id, array) {
    this.loading = true;
    this.loading_array[7] = true;
    this.apiOptimization
      .addOperationRestrictionsOptimizationScenario(id, array)
      .subscribe({
        next: (res) => {
          this.messageService.showToast(
            "success",
            "Success",
            "Operation restrictions added successfully!"
          );
        },
        error: (e) => {
          this.loading = false;
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while adding operation restrictions"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.loading_array[7] = false;
        if (this.loading_array.includes(true) == false) {
          this.ref.close("save");
          this.loading = false;
        }
      });
  }
  addBalanceRules(id, array) {
    this.loading = true;
    this.loading_array[8] = true;
    this.apiOptimization
      .addStockParametrizationOptimizationScenario(array, id)
      .subscribe({
        next: (res) => {
          this.messageService.showToast(
            "success",
            "Success",
            "Optimization balance rules added successfully!"
          );
        },
        error: (e) => {
          this.loading = false;
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while adding balance rules"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.loading_array[8] = false;
        if (this.loading_array.includes(true) == false) {
          this.loading = false;
          this.ref.close("save");
        }
      });
  }
  getCurves(zone) {
    this.apiMarketData.getPurchaseSalePricesLabels(zone).subscribe({
      next: (res) => {
        this.curves = res;
        if (this.curves.length == 0) {
          this.errorCurve = true;
        } else {
          this.errorCurve = false;
        }
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting curves"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  isFormValid(): boolean {
    return this.optimizationForm.disabled ? true : this.optimizationForm.valid;
  }
}
