import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  QueryList,
  AfterViewInit,
  HostListener,
  Input,
} from "@angular/core";

import * as moment from "moment";
import { DatePipe, formatNumber } from "@angular/common";

import NumberColumnType from "@revolist/revogrid-column-numeral";
import { map, catchError, filter } from "rxjs/operators";

import { BalanceZoneService } from "../../../@core/services/balanceZone.service";
import { BalanceService } from "../../../@core/services/balance.service";
import { LegalEntityService } from "../../../@core/services/legalEntity.service";
import {
  FormGroup,
  FormBuilder,
  Validators,
  Form,
  FormControl,
  ValidatorFn,
  NumberValueAccessor,
} from "@angular/forms";
import { CountryService } from "../../../@core/services/country.service";
import { RevoGrid } from "@revolist/angular-datagrid";
/* import * as export from '@revolist/revogrid/dist/types/plugins/export/export.plugin' */
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";
import {
  NbNativeDateService,
  NbTabComponent,
  NbTabsetComponent,
  NbDateService,
  NbDialogRef,
} from "@nebular/theme";
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable";
import { type } from "os";
import { defaultMaxListeners } from "events";
import { messageService } from "../../../@core/utils/messages";
//import { ComponentCanDeactivate } from '../pending-changes.guard';
import { Observable } from "rxjs";
import "@angular/common/locales/global/en";
import { time } from "console";
import { HttpHeaders } from "@angular/common/http";
import { NbAccessChecker } from "@nebular/security";
import { DarkModeService } from "../../../@core/services/sharedServices/darkMode.service";

@Component({
  selector: "ngx-list-simulation",
  templateUrl: "./list-simulation.component.html",
  styleUrls: ["./list-simulation.component.scss"],
})
export class ListSimulationComponent implements OnInit {
  @ViewChild("tabset") tabsetEl: NbTabsetComponent;
  @ViewChild("generateSimulation", { static: true }) accordion;



  @Input() id: number;
  @Input() start_date: string;
  @Input() end_date: string;
  @Input() label: string;
  last_synch: string;

  zoneOptions: any;
  regasificationPlant: any;
  countriesOptions: any;
  entitiesOptions: any;
  layoutOptions: any;
  loading = false;
  data: any;
  data1: any;
  optionsss: any;
  neededArray = [];
  grid: any;
  currentTab: string;
  currentTabOriginal: string;
  errorBalanceZone: any;
  errorLegalEntity: any;
  errorDate = false;
  errorLayout: any;
  indexRow: any;
  plugin: any;
  country: any;
  entity: any;
  balanceZone: any;
  label_compare = "Compare";
  layout: any;
  eventTimes = [];
  numeral = NumberColumnType.getNumeralInstance();
  arrayOperations = [];
  compare_simulation = false;
  min: Date;
  max: Date;
  validateRevogrid: boolean;
  validateRevogrid_array = [];
  validColumns: boolean;
  readonly: boolean;
  revogridTheme: string;
  eventTimes1 = [];
  constructor(
    private messageService: messageService,
    private apiBalanceZone: BalanceZoneService,
    private apiSimulation: BalanceService,
    private elRef: ElementRef,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<ListSimulationComponent>,
    private apiCountry: CountryService,
    private apiLegalEntity: LegalEntityService,
    private excelService: ExcelService,
    public datepipe: DatePipe,
    protected dateService: NbDateService<Date>,
    public accessChecker: NbAccessChecker,
    private darkModeService: DarkModeService
  ) {
    this.getcountries();
    this.getTimeStamp();
    this.min = new Date("2010-01-01");
    this.max = new Date("2022-01-01");
  }

  ngOnInit(): void {
    this.darkModeService.isDarkMode == true
      ? (this.revogridTheme = "darkMaterial")
      : (this.revogridTheme = "material");


    this.darkModeService.darkModeChange.subscribe((value) => {
      value == true
        ? (this.revogridTheme = "darkMaterial")
        : (this.revogridTheme = "material");
    });

    this.currentTab = localStorage.getItem("currenTab_sim");
    this.accessChecker
      .isGranted("create", "balance")
      .subscribe((granted) => (this.readonly = !granted));
    this.numeral.locale("es");

    this.calculate(this.currentTab);
  }

  getSimulation(id, currenTab?) {
    this.apiSimulation
      .getBalanceSimulation(id)
      .pipe(
        map((data) => {
          localStorage.setItem(
            "rgRow_sim_new",
            localStorage.getItem("rgRow_sim")
          );
          localStorage.setItem(
            "rgCol_sim_new",
            localStorage.getItem("rgCol_sim")
          );

          return data.map((x, index) => {
            currenTab !== undefined && currenTab !== null
              ? x["name"] == currenTab
                ? (x["isActive"] = true)
                : (x["isActive"] = false)
              : index == 0
              ? (x["isActive"] = true)
              : (x["isActive"] = false);
            (currenTab === undefined || currenTab == null) && index == 0
              ? (this.currentTab = x["name"].replace(" ", "_").toLowerCase())
              : "";
            (currenTab === undefined || currenTab == null) && index == 0
              ? (this.currentTabOriginal = x["name"])
              : "";
            localStorage.setItem("currenTab_sim", this.currentTabOriginal);

            x.columns?.map((j) => {
              if (j["flow_type"] !== undefined && j["flow_type"] != null) {
                if (j["flow_type"].toString().toLowerCase() == "input") {
                  j["columnTemplate"] = (createElement, column) => {
                    return createElement(
                      "span",
                      {
                        class: {
                          "column-input": true,
                        },
                      },
                      column.name
                    );
                  };
                } else if (
                  j["flow_type"].toString().toLowerCase() == "output"
                ) {
                  j["columnTemplate"] = (createElement, column) => {
                    return createElement(
                      "span",
                      {
                        class: {
                          "column-output": true,
                        },
                      },
                      column.name
                    );
                  };
                } else {
                  j["columnTemplate"] = (createElement, column) => {
                    return createElement(
                      "span",
                      {
                        class: {
                          "column-both": true,
                        },
                      },
                      column.name
                    );
                  };
                }
              } else if (j["prop"] == "STOCK" || j["prop"] == "TOTAL_STOCK") {
                j["columnTemplate"] = (createElement, column) => {
                  return createElement(
                    "span",
                    {
                      class: {
                        "column-stock": true,
                      },
                    },
                    column.name
                  );
                };
              } else {
                j["columnTemplate"] = (createElement, column) => {
                  return createElement(
                    "span",
                    {
                      class: {
                        "column-both": true,
                      },
                    },
                    column.name
                  );
                };
              }

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

              /* x.rules?.map((k) => {
                if (j["prop"] == k["prop"]) {
                  j["cellTemplate"] = (createElement, props) => {
                    for (const n of k.row_index) {
                      if (props.data.indexOf(props.model) == n) {
                        return createElement(
                          "div",
                          {
                            style: {
                              background: "#e32c2c",
                              color: "white",
                            },
                            class: {
                              bubble: true,
                            },
                          },
                          props.model[props.prop]
                        );
                      }
                    }
                  };
            
                }
              }); */

              x.changes?.map((k) => {
                if (j["prop"] == k["prop"]) {
                  j["cellTemplate"] = (createElement, props) => {
                    for (const n of k.row_index) {
                      if (props.data.indexOf(props.model) == n) {
                        return createElement(
                          "div",
                          {
                            style: {
                              background: "#212e3e",
                              color: "white",
                            },
                            class: {
                              bubble: true,
                            },
                          },
                          props.model[props.prop]
                        );
                      }
                    }
                  };
                }
              });
              /*        j["readonly"] = ({ prop, model, data, column, rowIndex}) => {
                var isReadonly: boolean = false;
                if(rowIndex == 1)[
                  isReadonly = true
                ]
            
                // your logic
                return isReadonly
             } */
              j["autoSize"] = true;

              j.children?.map((c) => {
                c["columnTemplate"] = (createElement, column) => {
                  return createElement(
                    "span",
                    {
                      class: {
                        "column-both": true,
                      },
                    },
                    column.name
                  );
                };
                if (c["flow_type"] !== undefined || c["flow_type"] != null) {
                  if (c["flow_type"].toString().toLowerCase() == "input") {
                    c["columnTemplate"] = (createElement, column) => {
                      return createElement(
                        "span",
                        {
                          class: {
                            "column-input": true,
                          },
                        },
                        column.name
                      );
                    };
                  } else if (
                    c["flow_type"].toString().toLowerCase() == "output"
                  ) {
                    c["columnTemplate"] = (createElement, column) => {
                      return createElement(
                        "span",
                        {
                          class: {
                            "column-output": true,
                          },
                        },
                        column.name
                      );
                    };
                  } else {
                    c["columnTemplate"] = (createElement, column) => {
                      return createElement(
                        "span",
                        {
                          class: {
                            "column-both": true,
                          },
                        },
                        column.name
                      );
                    };
                  }
                } else if (c["prop"] == "STOCK" || c["prop"] == "TOTAL_STOCK") {
                  c["columnTemplate"] = (createElement, column) => {
                    return createElement(
                      "span",
                      {
                        class: {
                          "column-stock": true,
                        },
                      },
                      column.name
                    );
                  };
                } else {
                  c["columnTemplate"] = (createElement, column) => {
                    return createElement(
                      "span",
                      {
                        class: {
                          "column-both": true,
                        },
                      },
                      column.name
                    );
                  };
                }

                c["sortable"] = true;
                c["size"] = 100 + Number(c["name"].length) * 3;
                c["autoSize"] = true;
                if (c["name"] == "Date") {
                  c["pin"] = "colPinStart";
                } else if (c["filter"] == "string") {
                  c["columnType"] = "string";
                  c["cellTemplate"] = (createElement, props) => {
                    if (props.model[props.prop] == true) {
                      return createElement(
                        "div",
                        {
                          style: {
                            background: "#088e47",
                            color: "white",
                          },
                          class: {
                            bubble: true,
                          },
                        },
                        "TRUE"
                      );
                    } else if (props.model[props.prop] == false) {
                      return createElement(
                        "div",
                        {
                          style: {
                            background: "#E32C2C",
                            color: "white",
                          },
                          class: {
                            bubble: true,
                          },
                        },
                        "FALSE"
                      );
                    }
                  };
                  /*     c["columnTemplate"] = (createElement, column) => {
                    return createElement(
                      "span",
                      {
                        style: {
                          color: "#263CC8",
                        },
                      },
                      column.name
                    );
                  }; */
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
                if (c["prop"] == "STOCK" || c["prop"] == "TOTAL_STOCK") {
                  c["columnTemplate"] = (createElement, column) => {
                    return createElement(
                      "span",
                      {
                        class: {
                          "column-stock": true,
                        },
                      },
                      column.name
                    );
                  };
                }
                /*    x.rules?.map((k) => {
                  if (c["prop"] == k["prop"]) {
                    c["columnType"] = "numeric";
                    c["cellTemplate"] = (createElement, props) => {
                      for (const n of k.row_index) {
                        if (props.data.indexOf(props.model) == n) {
                          return createElement(
                            "div",
                            {
                              style: {
                                background: "#E32C2C",
                                color: "white",
                              },
                              class: {
                                bubble: true,
                              },
                            },
                            props.model[props.prop]
                          );
                        }
                      }
                    };
               
                  }
                }); */
                x.changes?.map((k) => {
                  if (c["prop"] == k["prop"]) {
                    c["cellTemplate"] = (createElement, props) => {
                      for (const n of k.row_index) {
                        if (props.data.indexOf(props.model) == n) {
                          return createElement(
                            "div",
                            {
                              style: {
                                background: "#212e3e",
                                color: "white",
                              },
                              class: {
                                bubble: true,
                              },
                            },
                            props.model[props.prop]
                          );
                        }
                      }
                    };
                  }
                });
              });
            });
            return x;
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.data = res;
        },
        error: (e) => {
          this.data = null;

          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting simulation"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        setTimeout(() => {
          document
            .querySelectorAll("revo-grid")
            .forEach((element) => (element.resize = true));
          document
            .querySelectorAll("revo-grid")
            .forEach((element) => (element.autoSizeColumn = true));
          document.querySelectorAll("revo-grid").forEach((element) => {});
          if (
            isNaN(Number(localStorage.getItem("rgCol_sim_new"))) == false &&
            isNaN(Number(localStorage.getItem("rgRow_sim_new"))) == false
          ) {
            document.querySelectorAll("revo-grid").forEach((element) =>
              element.scrollToCoordinate({
                x: Number(localStorage.getItem("rgCol_sim_new")),
                y: Number(localStorage.getItem("rgRow_sim_new")),
              })
            );
          }
        }, 100);
        this.loading = false;
      });
  }

  calculate(currenTab?) {
    this.loading = true;
    this.validateRevogrid = true;

    localStorage.setItem("rgRow_sim", "");
    localStorage.setItem("rgRow_sim_new", "");
    localStorage.setItem("rgCol_sim", "");
    localStorage.setItem("rgCol_sim_new", "");
    localStorage.setItem("currenTab_sim", "");
    this.currentTab = null;

    this.getSimulation(this.id);
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
  getLegalEntities(country) {
    this.apiLegalEntity
      .getAllLegalEntitiesByCountry(country, "Internal")
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
  getBalanceZones(country) {
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
            "Internal server error while getting simulation"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  getSimulations(zone) {
    this.apiSimulation.getBalanceLayoutConfiguration().subscribe({
      next: (res) => {
        this.layoutOptions = res;

        this.layoutOptions = this.layoutOptions.filter((item) => {
          return item["balance_zone_id"] == zone;
        });
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting list of columns"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }

  exportAsCSV() {
    (document.querySelectorAll("revo-grid") as any).forEach((element) => {
      if (element.id == this.currentTab) {
        element.getPlugins().then((plugins) => {
          plugins.forEach((p) => {
            if (p.exportFile) {
              const exportPlugin = p;
              exportPlugin.exportFile({
                filename:
                  "simulation_" +
                  this.currentTab +
                  "_" +
                  this.start_date +
                  "_" +
                  this.end_date,
              });
            }
          });
        });
      }
    });
  }

  onChangeTab($event) {
    setTimeout(() => {
      document
        .querySelectorAll("revo-grid")
        .forEach((element) => (element.resize = true));
      document
        .querySelectorAll("revo-grid")
        .forEach((element) => (element.autoSizeColumn = true));
      document.querySelectorAll("revo-grid").forEach((element) => {});
    }, 1);
    if (this.compare_simulation == false) {
      this.currentTabOriginal = $event.tabTitle;
      this.currentTab = $event.tabTitle.replace(" ", "_").toLowerCase();
      localStorage.setItem("currenTab_sim", this.currentTabOriginal);
    }
  }

  onAfterEdit({ detail }) {
    this.eventTimes.push("Called");
    if (this.eventTimes.length == 1) {
      if (this.validateRevogrid == true) {
        if (detail.model !== undefined) {
          const arrayObject = [];
          const object = {};
          object["col_prop"] = detail.prop;
          (object["op_date"] = detail.model.DATE), "yyyy-MM-dd";
          //toString().replace(/\./g, '').replace(',', '.')
          object["op_value"] = Number(
            detail.val.toString().replace(/\./g, "").replace(",", ".")
          );
          object["sheet_name"] = this.currentTabOriginal;
          this.data.map((x) => {
            x.columns.map((j) => {
              if (
                j["prop"] == detail.prop &&
                x["name"] == this.currentTabOriginal
              ) {
                object["element_id"] = j["element_id"];
                object["action_type"] = j["action_type"];
                object["op_type"] = j["op_type"];
              }
              j.children?.map((c) => {
                if (
                  c["prop"] == detail.prop &&
                  x["name"] == this.currentTabOriginal
                ) {
                  object["element_id"] = c["element_id"];
                  object["action_type"] = c["action_type"];
                  object["op_type"] = c["op_type"];
                }
              });
            });
          });
          arrayObject.push(object);
          this.apiSimulation
            .addBalanceSimulationOperations(this.id, arrayObject)
            .subscribe({
              next: (res) => {
                this.loading = true;
                this.getSimulation(this.id, this.currentTabOriginal);
                this.messageService.showToast(
                  "success",
                  "Success",
                  "Simulation updated successfully!"
                );
                //setTimeout(() => this.loading = false, 3000);
              },
              error: (e) => {
                if (e.error.title == "Internal Server Error") {
                  this.messageService.showToast(
                    "danger",
                    "Error",
                    "Internal server error while updating simulation"
                  );
                } else {
                  this.messageService.showToast("danger", "Error", e.error);
                }
                this.getSimulation(this.id);
              },
            });
        } else if (detail.models !== undefined) {
          const arrayObject = [];
          for (const data in detail.data) {
            for (const prop in Object.keys(detail.data[data])) {
              const object = {};
              object["col_prop"] = Object.keys(detail.data[data])[prop];
              object["op_value"] = Number(
                Object.values(detail.data[data])
                  [prop].toString()
                  .replace(/\./g, "")
                  .replace(",", ".")
              );
              (object["op_date"] = detail.models[data].DATE), "yyyy-MM-dd";
              object["sheet_name"] = this.currentTabOriginal;
              this.data.map((x) => {
                x.columns.map((j) => {
                  if (
                    j["prop"] == Object.keys(detail.data[data])[prop] &&
                    x["name"] == this.currentTabOriginal
                  ) {
                    object["element_id"] = j["element_id"];
                    object["action_type"] = j["action_type"];
                    object["op_type"] = j["op_type"];
                  }
                  j.children?.map((c) => {
                    if (
                      c["prop"] == Object.keys(detail.data[data])[prop] &&
                      x["name"] == this.currentTabOriginal
                    ) {
                      object["element_id"] = c["element_id"];
                      object["action_type"] = c["action_type"];
                      object["op_type"] = c["op_type"];
                    }
                  });
                });
              });
              arrayObject.push(object);
            }
          }
          this.apiSimulation
            .addBalanceSimulationOperations(this.id, arrayObject)
            .subscribe({
              next: (res) => {
                this.loading = true;
                this.getSimulation(this.id, this.currentTabOriginal);
                this.messageService.showToast(
                  "success",
                  "Success",
                  "Simulation updated successfully!"
                );
              },
              error: (e) => {
                if (e.error.title == "Internal Server Error") {
                  this.messageService.showToast(
                    "danger",
                    "Error",
                    "Internal server error while updating simulation"
                  );
                } else {
                  this.messageService.showToast("danger", "Error", e.error);
                }
                this.getSimulation(this.id);
              },
            });
        }
      }
    } else {
      this.eventTimes = [];
    }
  }
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

    this.eventTimes = [];
    if (detail.model !== undefined) {
      if (
        /^[+]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/.test(
          detail.val
        ) == false
      ) {
        this.validateRevogrid = false;
        e.preventDefault();
      }else {
        detail.val = this.numeral(
          Number(detail.val.toString().replace(/\./g, "").replace(",", "."))
        ).format("0,0.[0000000000]");
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

  exportAsXLSX() {
    this.excelService.exportAsExcelFileWithMultipleSheets(
      this.data,
      "simulation_" + this.start_date + "_" + this.end_date
    );
  }
  OnViewPortScroll({ detail }) {
    if (this.compare_simulation == false) {
      if (detail.dimension == "rgRow") {
        localStorage.setItem("rgRow_sim", detail.coordinate);
      }
      if (detail.dimension == "rgCol") {
        localStorage.setItem("rgCol_sim", detail.coordinate);
      }
    }
  }
  synchronize() {
    this.loading = true;
    this.apiSimulation
      .syncBalanceSimulation(this.id)
      .subscribe({
        next: (res) => {
          this.getSimulation(this.id, this.currentTabOriginal);
          this.messageService.showToast(
            "success",
            "Success",
            "Simulation synchronized successfully!"
          );
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while synchronizing simulation"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
          this.loading = false;
        },
      })
      .add(() => {
        this.getTimeStamp();
      });
  }
  cancel() {
    this.ref.close();
  }
  compare() {
    var currenTab = this.currentTabOriginal;
    this.compare_simulation = !this.compare_simulation;
    if (this.compare_simulation == true) {
      this.validColumns = true;
      this.label_compare = "Back to edit mode";
      this.loading = true;
      this.apiSimulation
        .getBalanceSimulationComparison(this.id)
        .pipe(
          map((data) => {
            return data.map((x, index) => {
              currenTab !== undefined && currenTab !== null
                ? x["name"] == currenTab
                  ? (x["isActive"] = true)
                  : (x["isActive"] = false)
                : index == 0
                ? (x["isActive"] = true)
                : (x["isActive"] = false);
              (currenTab === undefined || currenTab == null) && index == 0
                ? (this.currentTab = x["name"].replace(" ", "_").toLowerCase())
                : "";
              (currenTab === undefined || currenTab == null) && index == 0
                ? (this.currentTabOriginal = x["name"])
                : "";

              x.columns?.map((j) => {
                if (j["flow_type"] !== undefined && j["flow_type"] != null) {
                  if (j["flow_type"].toString().toLowerCase() == "input") {
                    j["columnTemplate"] = (createElement, column) => {
                      return createElement(
                        "span",
                        {
                          style: {
                            color: "#43767d",
                          },
                        },
                        column.name
                      );
                    };
                  } else if (
                    j["flow_type"].toString().toLowerCase() == "output"
                  ) {
                    j["columnTemplate"] = (createElement, column) => {
                      return createElement(
                        "span",
                        {
                          style: {
                            color: "#6d32ff",
                          },
                        },
                        column.name
                      );
                    };
                  } else if (
                    j["flow_type"].toString().toLowerCase() == "input_output"
                  ) {
                    j["columnTemplate"] = (createElement, column) => {
                      return createElement(
                        "span",
                        {
                          style: {
                            color: "#C4A700",
                          },
                        },
                        column.name
                      );
                    };
                  }
                }

                j["sortable"] = true;
                j["size"] = 120;

                if (j["name"] == "Date") {
                  j["pin"] = "colPinStart";
                  j["size"] = 130;
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
                /*     x.rules?.map((k) => {
                  if (j["prop"] == k["prop"]) {
                    j["cellTemplate"] = (createElement, props) => {
                      for (const n of k.row_index) {
                        if (props.data.indexOf(props.model) == n) {
                          return createElement(
                            "div",
                            {
                              style: {
                                background: "#e32c2c",
                                color: "white",
                              },
                              class: {
                                bubble: true,
                              },
                            },
                            props.model[props.prop]
                          );
                        }
                      }
                    };
                  }
                }); */
                x.changes?.map((k) => {
                  if (j["prop"] == k["prop"]) {
                    j["cellTemplate"] = (createElement, props) => {
                      for (const n of k.row_index) {
                        if (props.data.indexOf(props.model) == n) {
                          return createElement(
                            "div",
                            {
                              style: {
                                background: "#212e3e",
                                color: "white",
                              },
                              class: {
                                bubble: true,
                              },
                            },
                            props.model[props.prop]
                          );
                        }
                      }
                    };
                  }
                });

                j.children?.map((c) => {
                  if (c["flow_type"] !== undefined || c["flow_type"] != null) {
                    if (c["flow_type"].toString().toLowerCase() == "input") {
                      c["columnTemplate"] = (createElement, column) => {
                        return createElement(
                          "span",
                          {
                            style: {
                              color: "#43767d",
                            },
                          },
                          column.name
                        );
                      };
                    } else if (
                      c["flow_type"].toString().toLowerCase() == "output"
                    ) {
                      c["columnTemplate"] = (createElement, column) => {
                        return createElement(
                          "span",
                          {
                            style: {
                              color: "#6d32ff",
                            },
                          },
                          column.name
                        );
                      };
                    } else if (
                      c["flow_type"].toString().toLowerCase() == "input_output"
                    ) {
                      c["columnTemplate"] = (createElement, column) => {
                        return createElement(
                          "span",
                          {
                            style: {
                              color: "#C4A700",
                            },
                          },
                          column.name
                        );
                      };
                    }
                  }

                  c["sortable"] = true;
                  c["size"] = 120;
                  if (c["name"] == "Date") {
                    c["pin"] = "colPinStart";
                    c["size"] = 130;
                  } else if (c["filter"] == "string") {
                    c["columnType"] = "string";
                    c["cellTemplate"] = (createElement, props) => {
                      if (props.model[props.prop] == true) {
                        return createElement(
                          "div",
                          {
                            style: {
                              background: "#088e47",
                              color: "white",
                            },
                            class: {
                              bubble: true,
                            },
                          },
                          "TRUE"
                        );
                      } else if (props.model[props.prop] == false) {
                        return createElement(
                          "div",
                          {
                            style: {
                              background: "#E32C2C",
                              color: "white",
                            },
                            class: {
                              bubble: true,
                            },
                          },
                          "FALSE"
                        );
                      }
                    };
                    /*     c["columnTemplate"] = (createElement, column) => {
                    return createElement(
                      "span",
                      {
                        style: {
                          color: "#263CC8",
                        },
                      },
                      column.name
                    );
                  }; */
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
                  /*   x.rules?.map((k) => {
                    if (c["prop"] == k["prop"]) {
                      c["columnType"] = "numeric";
                      c["cellTemplate"] = (createElement, props) => {
                        for (const n of k.row_index) {
                          if (props.data.indexOf(props.model) == n) {
                            return createElement(
                              "div",
                              {
                                style: {
                                  background: "#E32C2C",
                                  color: "white",
                                },
                                class: {
                                  bubble: true,
                                },
                              },
                              props.model[props.prop]
                            );
                          }
                        }
                      };
                    }
                  }); */
                  x.changes?.map((k) => {
                    if (c["prop"] == k["prop"]) {
                      c["cellTemplate"] = (createElement, props) => {
                        for (const n of k.row_index) {
                          if (props.data.indexOf(props.model) == n) {
                            return createElement(
                              "div",
                              {
                                style: {
                                  background: "#212e3e",
                                  color: "white",
                                },
                                class: {
                                  bubble: true,
                                },
                              },
                              props.model[props.prop]
                            );
                          }
                        }
                      };
                    }
                  });
                  c.children?.map((l) => {
                    if (l["prop"].includes("REAL_BALANCE")) {
                      var rows_index = [];
                      x["rows"]?.map((e, index) => {
                        if (
                          e[
                            l["prop"]
                              .replaceAll("_REAL_BALANCE", "")
                              .replaceAll("_SIM_BALANCE", "") + "_REAL_BALANCE"
                          ] !== undefined &&
                          e[
                            l["prop"]
                              .replaceAll("_REAL_BALANCE", "")
                              .replaceAll("_SIM_BALANCE", "") + "_SIM_BALANCE"
                          ] !== undefined
                        ) {
                          if (
                            Number(
                              e[
                                l["prop"]
                                  .replaceAll("_REAL_BALANCE", "")
                                  .replaceAll("_SIM_BALANCE", "") +
                                  "_REAL_BALANCE"
                              ]
                                .toString()
                                .replace(/\./g, "")
                                .replace(",", ".")
                            ) !=
                            Number(
                              e[
                                l["prop"]
                                  .replaceAll("_REAL_BALANCE", "")
                                  .replaceAll("_SIM_BALANCE", "") +
                                  "_SIM_BALANCE"
                              ]
                                .toString()
                                .replace(/\./g, "")
                                .replace(",", ".")
                            )
                          ) {
                            rows_index.push(index);
                          }
                        } else {
                          this.validColumns = false;
                          this.messageService.showToast(
                            "danger",
                            "Error",
                            "The number of columns of the real balance and the simulation does not match. Please synchronize the simulation with the real balance."
                          );
                        }
                      });
                      l["cellTemplate"] = (createElement, props) => {
                        for (const n of rows_index) {
                          if (props.data.indexOf(props.model) == n) {
                            return createElement(
                              "div",
                              {
                                style: {
                                  background: "#ffc600",
                                  color: "black",
                                },
                                class: {
                                  bubble: true,
                                },
                              },
                              props.model[props.prop]
                            );
                          }
                        }
                      };
                    }

                    /*         if (l["prop"].includes('REAL_BALANCE')) {
                      
                      l["cellTemplate"] = (createElement, props) => {
;
;
;
                      };
                    } */

                    l["sortable"] = true;
                    l["size"] = 120;
                    if (l["name"] == "Date") {
                      l["pin"] = "colPinStart";
                      l["size"] = 130;
                    } else if (l["filter"] == "string") {
                      l["columnType"] = "string";
                      l["cellTemplate"] = (createElement, props) => {
                        if (props.model[props.prop] == true) {
                          return createElement(
                            "div",
                            {
                              style: {
                                background: "#088e47",
                                color: "white",
                              },
                              class: {
                                bubble: true,
                              },
                            },
                            "TRUE"
                          );
                        } else if (props.model[props.prop] == false) {
                          return createElement(
                            "div",
                            {
                              style: {
                                background: "#E32C2C",
                                color: "white",
                              },
                              class: {
                                bubble: true,
                              },
                            },
                            "FALSE"
                          );
                        }
                      };
                      /*     c["columnTemplate"] = (createElement, column) => {
                    return createElement(
                      "span",
                      {
                        style: {
                          color: "#263CC8",
                        },
                      },
                      column.name
                    );
                  }; */
                    } else if (l["filter"] == "number") {
                      x["rows"]?.map((e, index) => {
                        e[l["prop"]] = this.numeral(
                          Number(e[l["prop"]].toFixed(2))
                        ).format("0,0.[0000]");
                      });
                      l["cellProperties"] = ({ prop, model, data, column }) => {
                        return {
                          class: {
                            numeric: true,
                          },
                        };
                      };
                    }
                    /*      x.rules?.map((k) => {
                      if (l["prop"] == k["prop"]) {
                        l["columnType"] = "numeric";
                        l["cellTemplate"] = (createElement, props) => {
                          for (const n of k.row_index) {
                            if (props.data.indexOf(props.model) == n) {
                              return createElement(
                                "div",
                                {
                                  style: {
                                    background: "#E32C2C",
                                    color: "white",
                                  },
                                  class: {
                                    bubble: true,
                                  },
                                },
                                props.model[props.prop]
                              );
                            }
                          }
                        };
                      }
                    }); */
                    x.changes?.map((k) => {
                      if (l["prop"] == k["prop"]) {
                        l["cellTemplate"] = (createElement, props) => {
                          for (const n of k.row_index) {
                            if (props.data.indexOf(props.model) == n) {
                              return createElement(
                                "div",
                                {
                                  style: {
                                    background: "rgb(33 46 62 / 60%)",
                                    color: "white",
                                  },
                                  class: {
                                    bubble: true,
                                  },
                                },
                                props.model[props.prop]
                              );
                            }
                          }
                        };
                      }
                    });
                  });
                });
              });
              return x;
            });
          })
        )
        .subscribe({
          next: (res) => {
            this.data = res;
          },
          error: (e) => {
            this.data = null;

            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while getting list of columns"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        })
        .add(() => {
          this.loading = false;
          if (this.validColumns == false) {
            this.label_compare = "Compare";
            this.loading = true;
            this.getSimulation(this.id, this.currentTabOriginal);
          }
        });
    } else if (this.compare_simulation == false) {
      this.label_compare = "Compare";
      this.loading = true;
      this.getSimulation(this.id, this.currentTabOriginal);
    }
  }
  refresh() {
    this.loading = true;
    this.getSimulation(this.id, this.currentTabOriginal);
  }
  getTimeStamp() {
    var simulations = [];
    this.apiSimulation
      .getAllBalanceSimulations()
      .subscribe({
        next: (res) => {
          simulations = res;
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
        var timeStamp = simulations.filter((item) => {
          return item.id == this.id;
        })[0].timestamp;
        this.last_synch = timeStamp
          ? this.datepipe.transform(
              new Date(
                timeStamp.split("-")[0],
                timeStamp.split("-")[1] - 1,
                timeStamp.split("-")[2].split("T")[0],
                timeStamp.split("-")[2].split("T")[1].split(":")[0],
                timeStamp.split("-")[2].split("T")[1].split(":")[1],
                timeStamp
                  .split("-")[2]
                  .split("T")[1]
                  .split(":")[2]
                  .replace("Z", "")
              ),
              "yyyy-MM-dd HH:mm"
            )
          : null;
      });
  }
}
