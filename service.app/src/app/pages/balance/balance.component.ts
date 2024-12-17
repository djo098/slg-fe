import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  QueryList,
  AfterViewInit,
  HostListener,
} from "@angular/core";
import * as moment from "moment";
import { DatePipe, formatNumber } from "@angular/common";
import { ngAutoCancelable } from "ng-auto-cancelable";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { map, catchError, filter, takeWhile } from "rxjs/operators";

import { BalanceZoneService } from "../../@core/services/balanceZone.service";
import { BalanceService } from "../../@core/services/balance.service";
import { LegalEntityService } from "../../@core/services/legalEntity.service";
import {
  FormGroup,
  FormBuilder,
  Validators,
  Form,
  FormControl,
  ValidatorFn,
  NumberValueAccessor,
} from "@angular/forms";
import { CountryService } from "../../@core/services/country.service";
import { RevoGrid } from "@revolist/angular-datagrid";
/* import * as export from '@revolist/revogrid/dist/types/plugins/export/export.plugin' */
import { ExcelService } from "../../@core/services/sharedServices/excel.service";
import {
  NbNativeDateService,
  NbTabComponent,
  NbTabsetComponent,
  NbDateService,
} from "@nebular/theme";
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable";
import { type } from "os";
import { defaultMaxListeners } from "events";
import { messageService } from "../../@core/utils/messages";
//import { ComponentCanDeactivate } from '../pending-changes.guard';
import { Observable, Subscription } from "rxjs";

import { MatSelect } from "@angular/material/select";
import { ReplaySubject, Subject } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import "@angular/common/locales/global/en";
import { NbAccessChecker } from "@nebular/security";
import { HeaderComponent } from "../../@theme/components";
import { DarkModeService } from "../../@core/services/sharedServices/darkMode.service";
import { ThirdPartyContractsService } from "../../@core/services/thirdPartyContracts.service";

@Component({
  selector: "ngx-balance",
  templateUrl: "./balance.component.html",
  styleUrls: ["./balance.component.scss"],
})
export class BalanceComponent implements OnInit {
  @ViewChild("tabset") tabsetEl: NbTabsetComponent;
  @ViewChild("generateBalance", { static: true }) accordion;

  status_workflow: any;
  zoneOptions: any;
  regasificationPlant: any;
  countriesOptions: any;
  entitiesOptions: any;
  layoutOptions: any;
  loading = false;
  loadingForm = false;
  loadingWarning = false;
  loading_form_array: any = [];
  data: any;
  data1: any;
  optionsss: any;
  show = false;
  neededArray = [];
  balanceForm!: FormGroup;
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
  start_date: any;
  end_date: any;
  layout: any;
  eventTimes = [];
  numeral = NumberColumnType.getNumeralInstance();
  readonly: boolean;
  create: boolean;
  min: Date;
  max: Date;
  validateRevogrid: boolean;
  validateRevogrid_array = [];
  compareStockTSO: boolean = false;
  label_compare: string = "Compare Stock";
  componentActive = true;
  revogridTheme;
  protected subscriptions: Subscription[] = [];
  array_warnings: any = [];
  eventTimes1 = [];
  array_warnings1:  any = [];
  loading_warnings_array: any =[];
  constructor(
    private messageService: messageService,
    private apiBalanceZone: BalanceZoneService,
    private apiBalance: BalanceService,
    private elRef: ElementRef,
    private formBuilder: FormBuilder,
    private apiCountry: CountryService,
    private apiLegalEntity: LegalEntityService,
    private apiThirdPartyContract: ThirdPartyContractsService,
    private excelService: ExcelService,
    public datepipe: DatePipe,
    protected dateService: NbDateService<Date>,
    public accessChecker: NbAccessChecker,
    private darkModeService: DarkModeService
  ) {}
  cancelAllRequests() {
    if (!this.subscriptions) {
      return;
    }

    this.subscriptions.forEach((s) => {

      s.unsubscribe();
    });
    this.subscriptions = [];
  }
  ngOnInit() {
    this.status_workflow = '';
    this.darkModeService.isDarkMode == true
      ? (this.revogridTheme = "darkMaterial")
      : (this.revogridTheme = "material");
    this.darkModeService.darkModeChange.subscribe((value) => {
      value == true
        ? (this.revogridTheme = "darkMaterial")
        : (this.revogridTheme = "material");
    });

    this.accessChecker
      .isGranted("create", "balance")
      .subscribe((granted) => (this.readonly = !granted));

    this.getcountries();
    this.min = new Date("2010-01-01");
    this.max = new Date("2022-01-01");
    this.getLegalEntities();
    this.dateService.getFirstDayOfWeek();
    this.accordion.toggle();
    this.numeral.locale("es");
    this.balanceForm = this.formBuilder.group({
      date: new FormControl("", [Validators.required, this.dateRangeValidator]),
      balancing_zone: new FormControl("", [Validators.required]),
      legal_entity: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      layout: new FormControl("", [Validators.required]),
    });
    this.layout = null;
    this.country = localStorage.getItem("country_ba");
    this.balanceZone = localStorage.getItem("balance_zone_ba");
    this.entity = localStorage.getItem("entity_ba");
    this.currentTab = localStorage.getItem("currenTab_ba");
    this.start_date = localStorage.getItem("start_date_ba");
    this.end_date = localStorage.getItem("end_date_ba");

    this.layout = localStorage.getItem("layout_ba");

    this.balanceForm.controls["layout"].setValue(Number(this.layout));

    if (
      this.country &&
      this.balanceZone &&
      this.entity &&
      this.start_date &&
      this.end_date &&
      this.layout
    ) {
      this.getbalanceZones(this.country);
      this.getLayouts(this.balanceZone);
      this.balanceForm.controls["country_code"].setValue(this.country);
      this.balanceForm.controls["balancing_zone"].setValue(
        Number(this.balanceZone)
      );
      this.balanceForm.controls["legal_entity"].setValue(Number(this.entity));
      this.balanceForm.controls["date"].setValue({
        start: new Date(
          this.start_date.split("-")[0],
          this.start_date.split("-")[1] - 1,
          this.start_date.split("-")[2]
        ),
        end: new Date(
          this.end_date.split("-")[0],
          this.end_date.split("-")[1] - 1,
          this.end_date.split("-")[2]
        ),
      });
    } else {
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object = JSON.parse(localStorage.getItem("settings_parameters"));
        this.balanceForm.get("country_code").setValue(object["country_code"]);
        this.getbalanceZones(object["country_code"]);
        this.balanceForm
          .get("balancing_zone")
          .setValue(object["balancing_zone"]);
        this.getLayouts(object["balancing_zone"]);
      }
    }

    if (
      this.country &&
      this.balanceZone &&
      this.entity &&
      this.start_date &&
      this.end_date
    ) {
      this.calculate(this.currentTab);
      this.getStatusWorkflow();
    }

  }

  private dateRangeValidator: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date = this.balanceForm && this.balanceForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.balanceForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.balanceForm.get("date").value.end,
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
      this.errorDate = true;
    } else {
      this.errorDate = false;
    }

    return invalid ? { invalidRange: {} } : null;
  };


  getStatusWorkflow(){
    this.apiBalance.getWorkflowNomiantionMode(this.balanceForm.get("balancing_zone").value, this.balanceForm.get("legal_entity").value)
    .subscribe({
      next: (res) => {
        this.status_workflow=res["mode"];

      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting workflow status (automatic/manual)"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    })
    .add(() => {
      this.loading = false;
    });


  }

  getBalance(
    balancing_zone,
    start_date,
    end_date,
    legal_entity,
    currenTab?,
    layout?
  ) {
    const subscription = this.apiBalance
      .getBalance(balancing_zone, start_date, end_date, legal_entity, layout)
      .pipe(
        map((data) => {
          localStorage.setItem(
            "rgRow_ba_new",
            localStorage.getItem("rgRow_ba")
          );
          localStorage.setItem(
            "rgCol_ba_new",
            localStorage.getItem("rgCol_ba")
          );
          var exist_currentTab = false;
          return data.map((x, index) => {
            currenTab !== undefined && currenTab !== null
              ? x["name"] == currenTab
                ? ((x["isActive"] = true), (exist_currentTab = true))
                : ((x["isActive"] = false),
                  exist_currentTab == true
                    ? index == 0
                      ? (x["isActive"] = true)
                      : (x["isActive"] = false)
                    : "")
              : index == 0
              ? (x["isActive"] = true)
              : (x["isActive"] = false);
            (currenTab === undefined || currenTab == null) && index == 0
              ? (this.currentTab = x["name"].replace(" ", "_").toLowerCase())
              : "";
            (currenTab === undefined || currenTab == null) && index == 0
              ? (this.currentTabOriginal = x["name"])
              : "";
            localStorage.setItem("currenTab_ba", this.currentTabOriginal);

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
              "Internal server error while getting balance"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
    this.subscriptions.push(subscription);
    subscription.add(() => {
      setTimeout(() => {
        document
          .querySelectorAll("revo-grid")
          .forEach((element) => (element.resize = true));
        document
          .querySelectorAll("revo-grid")
          .forEach((element) => (element.autoSizeColumn = true));
        document.querySelectorAll("revo-grid").forEach((element) => {});
        if (
          isNaN(Number(localStorage.getItem("rgCol_ba_new"))) == false &&
          isNaN(Number(localStorage.getItem("rgRow_ba_new"))) == false
        ) {
          document.querySelectorAll("revo-grid").forEach((element) =>
            element.scrollToCoordinate({
              x: Number(localStorage.getItem("rgCol_ba_new")),
              y: Number(localStorage.getItem("rgRow_ba_new")),
            })
          );
        }
      }, 100);
      this.loading = false;
    });
  }
  getBalanceTSO(
    balancing_zone,
    start_date,
    end_date,
    legal_entity,
    currenTab?,
    layout?
  ) {
    this.loading = true;
    this.apiBalance
      .getBalanceTSO(balancing_zone, start_date, end_date, legal_entity, layout)
      .pipe(
        map((data) => {
          return data.map((x, index) => {
            index == 0 ? (x["isActive"] = true) : (x["isActive"] = false);

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
          this.compareStockTSO = false;
          this.label_compare = "Compare Stock";
          this.data = null;

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
        setTimeout(() => {
          document
            .querySelectorAll("revo-grid")
            .forEach((element) => (element.resize = true));
          document
            .querySelectorAll("revo-grid")
            .forEach((element) => (element.autoSizeColumn = true));
          document.querySelectorAll("revo-grid").forEach((element) => {});

          if (
            isNaN(Number(localStorage.getItem("rgCol_ba_new"))) == false &&
            isNaN(Number(localStorage.getItem("rgRow_ba_new"))) == false
          ) {
            document.querySelectorAll("revo-grid").forEach((element) =>
              element.scrollToCoordinate({
                x: Number(localStorage.getItem("rgCol_ba_new")),
                y: Number(localStorage.getItem("rgRow_ba_new")),
              })
            );
          }
        }, 100);
        this.loading = false;
      });
  }
  calculate(currenTab?, first?) {
    if (this.subscriptions.length > 0) {
      this.cancelAllRequests();
    }
    this.label_compare = "Compare Stock";
    this.loading = true;
    this.validateRevogrid = true;
    this.compareStockTSO = false;
    if (first) {
      localStorage.setItem("rgRow_ba", "");
      localStorage.setItem("rgRow_ba_new", "");
      localStorage.setItem("rgCol_ba", "");
      localStorage.setItem("rgCol_ba_new", "");
      localStorage.setItem("currenTab_ba", "");
      this.currentTab = null;
    }

    this.country = this.balanceForm.get("country_code").value;
    this.balanceZone = this.balanceForm.get("balancing_zone").value;
    this.entity = this.balanceForm.get("legal_entity").value;
    this.layout = this.balanceForm.get("layout").value;
    if (isNaN(this.layout)) {
      this.messageService.showToast(
        "danger",
        "Error",
        "The layout must be selected"
      );
      this.loading = false;
    } else {
      if (this.layout == 0) {
        localStorage.setItem("layout_ba", this.layout);
        this.layout = null;
      } else {
        localStorage.setItem("layout_ba", this.layout);
      }

      this.start_date = this.datepipe.transform(
        this.balanceForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      this.end_date = this.datepipe.transform(
        this.balanceForm.get("date").value.end,
        "yyyy-MM-dd"
      );
      this.getBalance(
        this.balanceForm.get("balancing_zone").value,
        this.datepipe.transform(
          this.balanceForm.get("date").value.start,
          "yyyy-MM-dd"
        ),
        this.datepipe.transform(
          this.balanceForm.get("date").value.end,
          "yyyy-MM-dd"
        ),
        this.balanceForm.get("legal_entity").value,
        currenTab,
        this.layout
      );
      if (
        this.balanceForm.get("date").value.start <
        new Date(new Date().setHours(0, 0, 0, 0))
      ) {
        this.getWarnings(
          this.balanceForm.get("balancing_zone").value,
          this.datepipe.transform(
            this.balanceForm.get("date").value.start,
            "yyyy-MM-dd"
          ),

          this.balanceForm.get("date").value.end >=
            new Date(new Date().setHours(0, 0, 0, 0))
            ? this.datepipe.transform(
                new Date(new Date().setHours(0, 0, 0, 0)).setDate(
                  new Date(new Date().setHours(0, 0, 0, 0)).getDate() - 1
                ),
                "yyyy-MM-dd"
              )
            : this.datepipe.transform(
                this.balanceForm.get("date").value.end,
                "yyyy-MM-dd"
              ),
          this.balanceForm.get("legal_entity").value
        );
      } else {
        this.array_warnings = [];
      }

      localStorage.setItem("country_ba", this.country);
      localStorage.setItem("balance_zone_ba", this.balanceZone);
      localStorage.setItem("entity_ba", this.entity);
      localStorage.setItem("start_date_ba", this.start_date);
      localStorage.setItem("end_date_ba", this.end_date);
    }
  }

  getcountries() {
    this.loadingForm = true;
    this.loading_form_array[0] = true;
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
        this.loading_form_array[0] = false;
        if (this.loading_form_array.includes(true) == false) {
          this.loadingForm = false;
          this.loading_form_array = [];
        }
      });
  }
  getLegalEntities() {
    this.loadingForm = true;
    this.loading_form_array[1] = true;
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
        this.loading_form_array[1] = false;
        if (this.loading_form_array.includes(true) == false) {
          this.loadingForm = false;
          this.loading_form_array = [];
        }
      });
  }
  getbalanceZones(country) {
    this.loadingForm = true;
    this.loading_form_array[2] = true;
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
        this.loading_form_array[2] = false;
        if (this.loading_form_array.includes(true) == false) {
          this.loadingForm = false;
          this.loading_form_array = [];
        }
      });
  }
  getLayouts(zone) {
    this.loadingForm = true;
    this.loading_form_array[3] = true;
    this.apiBalance
      .getBalanceLayoutConfiguration()
      .subscribe({
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
      })
      .add(() => {
        this.loading_form_array[3] = false;
        if (this.loading_form_array.includes(true) == false) {
          this.loadingForm = false;
          this.loading_form_array = [];
        }
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
                  this.currentTab + "_" + this.start_date + "_" + this.end_date,
              });
            }
          });
        });
      }
    });
  }

  onChangeCountry($event) {
    this.balanceForm.controls["balancing_zone"].setValue("");

    this.balanceForm.controls["layout"].setValue("");
    this.getbalanceZones(this.balanceForm.get("country_code").value);
  }
  onChangeZone($event) {
    this.getLayouts($event);
  }

  onChangeTab($event) {
    if (this.compareStockTSO == false) {
      setTimeout(() => {
        document
          .querySelectorAll("revo-grid")
          .forEach((element) => (element.resize = true));
        document
          .querySelectorAll("revo-grid")
          .forEach((element) => (element.autoSizeColumn = true));
        document.querySelectorAll("revo-grid").forEach((element) => {});
      }, 1);

      this.currentTabOriginal = $event.tabTitle;
      this.currentTab = $event.tabTitle.replace(" ", "_").toLowerCase();
      localStorage.setItem("currenTab_ba", this.currentTabOriginal);
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
          object["layout"] = this.layout;
          
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
          this.apiBalance
            .addBalanceOperations(this.balanceZone, this.entity, arrayObject)
            .subscribe({
              next: (res) => {
                this.loading = true;
                this.getBalance(
                  this.balanceZone,
                  this.start_date,
                  this.end_date,
                  this.entity,
                  this.currentTabOriginal,
                  this.layout
                );
                this.messageService.showToast(
                  "success",
                  "Success",
                  "Balance updated successfully!"
                );
                //setTimeout(() => this.loading = false, 3000);
              },
              error: (e) => {
                if (e.error.title == "Internal Server Error") {
                  this.messageService.showToast(
                    "danger",
                    "Error",
                    "Internal server error while updating balance"
                  );
                } else {
                  this.messageService.showToast("danger", "Error", e.error);
                }
                this.getBalance(
                  this.balanceZone,
                  this.start_date,
                  this.end_date,
                  this.entity,
                  this.currentTabOriginal,
                  this.layout
                );
              },
            });
        } else if (
          detail.models !== undefined &&
          Object.values(detail.data).length > 0
        ) {
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
          this.apiBalance
            .addBalanceOperations(this.balanceZone, this.entity, arrayObject)
            .subscribe({
              next: (res) => {
                this.loading = true;
                this.getBalance(
                  this.balanceZone,
                  this.start_date,
                  this.end_date,
                  this.entity,
                  this.currentTabOriginal,
                  this.layout
                );
                this.messageService.showToast(
                  "success",
                  "Success",
                  "Balance updated successfully!"
                );
              },
              error: (e) => {
                if (e.error.title == "Internal Server Error") {
                  this.messageService.showToast(
                    "danger",
                    "Error",
                    "Internal server error while updating balance"
                  );
                } else {
                  this.messageService.showToast("danger", "Error", e.error);
                }
                this.getBalance(
                  this.balanceZone,
                  this.start_date,
                  this.end_date,
                  this.entity,
                  this.currentTabOriginal,
                  this.layout
                );
              },
            });
        }
      }
    } else {
      this.eventTimes = [];
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
      } else {
        detail.val = this.numeral(
          Number(detail.val.toString().replace(/\./g, "").replace(",", "."))
        ).format("0,0.[0000000000]");
      }
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
                  ).format("0,0.[0000000000]");
                }
              }
            }
          }
        }
      }
    }
  }
  reset() {
    this.balanceForm.controls["country_code"].setValue("");
    this.balanceForm.controls["balancing_zone"].setValue("");
    this.balanceForm.controls["legal_entity"].setValue("");
    this.balanceForm.controls["layout"].setValue("");
    this.balanceForm.controls["date"].setValue("");
    this.zoneOptions = [];

    localStorage.setItem("country_ba", "");
    localStorage.setItem("balance_zone_ba", "");
    localStorage.setItem("entity_ba", "");
    localStorage.setItem("start_date_ba", "");
    localStorage.setItem("end_date_ba", "");
    this.data = null;

    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.balanceForm.get("country_code").setValue(object["country_code"]);
      this.balanceForm.get("balancing_zone").setValue(object["balancing_zone"]);
      this.getbalanceZones(object["country_code"]);
      this.getLayouts(object["balancing_zone"]);
    }
  }
  exportAsXLSX() {
    this.excelService.exportAsExcelFileWithMultipleSheets(
      this.data,
      "balance_" + this.start_date + "_" + this.end_date
    );
  }
  OnViewPortScroll({ detail }) {
    if (this.compareStockTSO == false) {
      if (detail.dimension == "rgRow") {
        localStorage.setItem("rgRow_ba", detail.coordinate);
      }
      if (detail.dimension == "rgCol") {
        localStorage.setItem("rgCol_ba", detail.coordinate);
      }
    }
  }

  refresh() {
    var country = localStorage.getItem("country_ba");
    var legalEntity = localStorage.getItem("entity_ba");
    var balanceZone = localStorage.getItem("balance_zone_ba");

    var start_date = this.datepipe.transform(
      localStorage.getItem("start_date_ba"),
      "yyyy-MM-dd"
    );
    var end_date = this.datepipe.transform(
      localStorage.getItem("end_date_ba"),
      "yyyy-MM-dd"
    );
    var currentTab = localStorage.getItem("currenTab_ba");
    var layout = localStorage.getItem("layout_ba");
    
    if (country && balanceZone && legalEntity && start_date && end_date) {
      this.loading = true;
      this.getBalance(
        balanceZone,
        start_date,
        end_date,
        legalEntity,
        currentTab,
        layout
      );
      this.getStatusWorkflow();
    }
  }

  compareStock() {
    this.compareStockTSO = !this.compareStockTSO;

    if (this.compareStockTSO == true) {
      if (
        this.balanceForm.get("date").value.start <
        new Date(new Date().setHours(0, 0, 0, 0))
      ) {
        this.loading = true;
        this.label_compare = "Back to Edit";
        this.getBalanceTSO(
          this.balanceZone,
          this.start_date,
          this.balanceForm.get("date").value.end >=
            new Date(new Date().setHours(0, 0, 0, 0))
            ? this.datepipe.transform(
                new Date(new Date().setHours(0, 0, 0, 0)).setDate(
                  new Date(new Date().setHours(0, 0, 0, 0)).getDate() - 1
                ),
                "yyyy-MM-dd"
              )
            : this.datepipe.transform(
                this.balanceForm.get("date").value.end,
                "yyyy-MM-dd"
              ),
          this.entity,
          this.currentTabOriginal
        );
      } else {
        this.messageService.showToast(
          "danger",
          "Error",
          "The specified start date must be earlier than today's date in order to compare the stock."
        );
      }
    } else {
      this.loading = true;
      this.label_compare = "Compare Stock";
      this.getBalance(
        this.balanceZone,
        this.start_date,
        this.end_date,
        this.entity,
        this.currentTabOriginal
        //this.layout
      );
    }
  }
  getWarnings(balancing_zone, start_date, end_date, legal_entity) {
    this.loadingWarning = true;
    this.loading_warnings_array[0] = true;
    this.loading_warnings_array[1] = true;
    this.apiBalance
      .getBalanceTSO(balancing_zone, start_date, end_date, legal_entity)
      .subscribe({
        next: (res) => {
          this.array_warnings = [];
          res.map((x) => {
            var object = { name: x["name"], dates: "" };
            var dates = [];
            x.rows.map((j) => {
              if (j["STOCK_COMPARISON"] != 0) {
                dates.push(j["DATE"]);
              }
            });
            object.dates = dates.toString().replaceAll(",", ", ");
            dates.length > 0 ? this.array_warnings.push(object) : "";
          });
        },
        error: (e) => {
          this.array_warnings = [];
    
        },
      })
      .add(() => {
        this.loading_warnings_array[0] = false;
        if (this.loading_warnings_array.includes(true) == false) {
          this.loadingWarning = false;
          this.loading_warnings_array = [];
        }
  
      });
      this.apiThirdPartyContract
      .getExchangeNotificationsTSO(balancing_zone, start_date, end_date, legal_entity) .subscribe({
        next: (res) => {

           this.array_warnings1 = [];
          res.map((x) => {
            var object = { name: x["name"], dates: "" };
            var dates = [];
            x.rows.map((j) => {
              if (j["STOCK_COMPARISON"] != 0) {
                dates.push(j["DATE"]);
              }
            });
            object.dates = dates.toString().replaceAll(",", ", ");
            dates.length > 0 ? this.array_warnings1.push(object) : "";
          }); 
        },
        error: (e) => {
           this.array_warnings1 = [];
      

        },
      })
      .add(() => {
        this.loading_warnings_array[1] = false;
        if (this.loading_warnings_array.includes(true) == false) {
          this.loadingWarning = false;
          this.loading_warnings_array = [];
        }
      });
  }
  ngOnDestroy() {
    this.cancelAllRequests();
  }
}
