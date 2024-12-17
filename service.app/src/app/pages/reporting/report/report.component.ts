import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { CountryService } from "../../../@core/services/country.service";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";
import { messageService } from "../../../@core/utils/messages";
import * as moment from "moment";

import { DatePipe } from "@angular/common";
import { LegalEntityService } from "../../../@core/services/legalEntity.service";
import { ReportingService } from "../../../@core/services/reporting.service";
import { map } from "rxjs/operators";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { BalanceZoneService } from "../../../@core/services/balanceZone.service";
import { Subject } from "rxjs";
import { DarkModeService } from "../../../@core/services/sharedServices/darkMode.service";

@Component({
  selector: "ngx-gas-exchanges-report",
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.scss"],
})
export class ReportComponent implements OnInit {
  @ViewChild("generateReport", { static: true }) accordion;
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  filterFn: any;
  defaultRowPerPage = 10;
  dataExport: any[];
  reportForm!: FormGroup;
  errorDate = false;
  errorMonth = false;
  errorMonth1 = false;
  errorDate1 = false;
  countriesOptions: any;
  entitiesOptions: any;
  errorLegalEntity = false;
  columns: any;
  rows = null;
  loading = false;
  start_date: any;
  end_date: any;
  start_date1: any;
  end_date1: any;
  entity: any;
  country: any;
  report: any;
  optionsPager: any;
  selected: any;
  numeral = NumberColumnType.getNumeralInstance();
  dataView: any;
  dateView1: any;
  dateView3: any = false;
  balancing_zone: any;
  zoneOptions: any;
  errorBalanceZone: any;
  dateView = true;
  balanceZoneView = true;
  currentTabOriginal: any;
  currentTab: any;
  reportDate: any;
  loadingForm=false;
  revogridTheme: string;

  // urlsReport=[{title: 'PRUEBA', URL: 'https://app.powerbi.com/reportEmbed?reportId=49b1c4eb-1a3f-472e-8e58-397bd59bd50f&autoAuth=true&ctid=a6bf56db-1844-4fb0-89f3-ad07c1f40c8b'}]
  /*   plugin: any =  { 'numeric': new NumberColumnType('0,0') }; */
  ngOnInit(): void {
    this.darkModeService.isDarkMode == true
    ? (this.revogridTheme = "darkMaterial")
    : (this.revogridTheme = "material");
  this.darkModeService.darkModeChange.subscribe((value) => {
    value == true
      ? (this.revogridTheme = "darkMaterial")
      : (this.revogridTheme = "material");
  });

    this.numeral.locale("es");
    this.optionsPager = [
      { value: 10 },
      { value: 20 },
      { value: 50 },
      { value: 100 },
    ];
    this.selected = this.optionsPager[0];
    this.accordion.toggle();
    this.reportForm = this.formBuilder.group({
      date: new FormControl("", [
        Validators.required,
        this.dateRangeValidator,
        this.dateRangeMonthValidator,
      ]),
      date1: new FormControl("", [
        Validators.required,
        this.dateRangeValidator1,
      ]),
      date3: new FormControl("", [Validators.required]),
      legal_entity: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      report: new FormControl("", [Validators.required]),
      balancing_zone: new FormControl("", [Validators.required]),
    });
    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.reportForm.get("country_code").setValue(object["country_code"]);
      this.getbalanceZones(object["country_code"]);
      this.reportForm.get("balancing_zone").setValue(object["balancing_zone"]);
    }
  }
  settings = {
    mode: "external",
    actions: {
      add: false,
      edit: false,
      delete: false,
    },

    columns: {},
    pager: {
      display: true,
      perPage: this.defaultRowPerPage,
    },
    attr: {
      class: "table",
    },
  };

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private messageService: messageService,
    private dialogService: NbDialogService,
    private excelService: ExcelService,
    private apiCountry: CountryService,
    private formBuilder: FormBuilder,
    public datepipe: DatePipe,
    private apiLegalEntity: LegalEntityService,
    private apiReporting: ReportingService,
    private apiBalanceZone: BalanceZoneService,
    private darkModeService: DarkModeService
  ) {
    this.getCountries();
    this.getLegalEntities();
  }

  getReport(
    start_date,
    end_date,
    owner_id,
    report,
    balancing_zone?,
    start_date1?,
    end_date1?,
    reportDate?
  ) {
    this.columns = {};
    this.rows = [];
    if (report == "gas_swaps") {
      this.apiReporting
        .getPhysicalGasSwapsReport(start_date, end_date, owner_id,balancing_zone)
        .pipe(
          map((data) => {
            return data["data"].map((x, index) => {
              index == 0 ? (x["isActive"] = true) : (x["isActive"] = false);
              this.columns = x.columns.map((j) => {
                return j;
              });
              this.rows = x.rows.map((c) => {
                return c;
              });
              x.columns.map((j) => {
                j["sortable"] = true;
                j["size"] = 200;
                if (j["prop"] == "date") {
                  j["size"] = 160;
                }
                if (j["filter"] == "number") {
                  /*   j['columnType']= 'numeric'; */
                  j["cellProperties"] = ({ prop, model, data, column }) => {
                    return {
                      class: {
                        numeric: true,
                      },
                    };
                  };
                  x["rows"]?.map((e, index) => {
                    if (e[j["prop"]] != null) {
                      e[j["prop"]] = this.numeral(Number(e[j["prop"]])).format(
                        "0,0.[000000000000]"
                      );
                    } else {
                      e[j["prop"]] = "";
                    }
                    return e;
                  });
                }

                j.children?.map((c) => {
                  c["sortable"] = true;
                  c["size"] = 200;
                  if (c["prop"] == "date") {
                    c["pin"] = "colPinStart";
                    c["size"] = 160;
                  }
                  if (c["filter"] == "number") {
                    c["cellProperties"] = ({ prop, model, data, column }) => {
                      return {
                        class: {
                          numeric: true,
                        },
                      };
                    };
                    x["rows"]?.map((e, index) => {
                      if (e[c["prop"]] != null) {
                        e[c["prop"]] = this.numeral(
                          Number(e[c["prop"]])
                        ).format("0,0.[000000000000]");
                      } else {
                        e[c["prop"]] = "";
                      }

                      return e;
                    });
                  }
                });
              });

              return x;
            });
          })
        )
        .subscribe({
          next: (res) => {
            this.dataView = res;
          },
          error: (e) => {
            this.rows = null;
            this.dataView = null;
            this.columns = null;
            this.loading = false;

            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while getting report"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        })
        .add(() => {
          this.settings.columns = this.columns;
          this.settings = Object.assign({}, this.settings);
          this.loading = false;
          setTimeout(() => {
            document
              .querySelectorAll("revo-grid")
              .forEach((element) => (element.resize = true));
            document
              .querySelectorAll("revo-grid")
              .forEach((element) => (element.autoSizeColumn = true));
          }, 100);
        });
    } else if (report == "gas_purchases_and_sales") {
      this.apiReporting
        .getPhysicalPurchasesSalesReport(start_date, end_date, owner_id,balancing_zone)
        .pipe(
          map((data) => {

            return data["data"].map((x, index) => {
              index == 0 ? (x["isActive"] = true) : (x["isActive"] = false);
              this.columns = x.columns.map((j) => {
                return j;
              });
              this.rows = x.rows.map((c) => {
                return c;
              });
              x.columns.map((j) => {
                j["sortable"] = true;
                j["size"] = 200;
                if (j["prop"] == "date") {
                  j["pin"] = "colPinStart";
                  j["size"] = 160;
                }
                if (j["filter"] == "number") {
                  /*   j['columnType']= 'numeric'; */
                  j["cellProperties"] = ({ prop, model, data, column }) => {
                    return {
                      class: {
                        numeric: true,
                      },
                    };
                  };
                  x["rows"]?.map((e, index) => {
                    e[j["prop"]] = this.numeral(
                      Number(e[j["prop"]].toFixed(2))
                    ).format("0,0.[000000000000]");
                    return e;
                  });
                }

                j.children?.map((c) => {
                  c["sortable"] = true;
                  c["size"] = 200;
                  if (c["prop"] == "date") {
                    c["pin"] = "colPinStart";
                    c["size"] = 160;
                  }
                  if (c["filter"] == "number") {
                    c["cellProperties"] = ({ prop, model, data, column }) => {
                      return {
                        class: {
                          numeric: true,
                        },
                      };
                    };
                    x["rows"]?.map((e, index) => {
                      e[c["prop"]] = this.numeral(
                        Number(e[c["prop"]].toFixed(2))
                      ).format("0,0.[000000000000]");
                      return e;
                    });
                  }
                });
              });

              return x;
            });
          })
        )
        .subscribe({
          next: (res) => {
            this.dataView = res;
          },
          error: (e) => {
            this.rows = null;
            this.dataView = null;
            this.columns = null;
            this.loading = false;

            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while getting report"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        })
        .add(() => {
          this.settings.columns = this.columns;
          this.settings = Object.assign({}, this.settings);
          this.loading = false;
          setTimeout(() => {
            document
              .querySelectorAll("revo-grid")
              .forEach((element) => (element.resize = true));
            document
              .querySelectorAll("revo-grid")
              .forEach((element) => (element.autoSizeColumn = true));
          }, 100);
        });
    } else if (report == "daily_balance") {
      this.apiReporting
        .getDailyBalanceReport(balancing_zone, owner_id)
        .pipe(
          map((data) => {
            return data.map((x, index) => {
              index == 0 ? (x["isActive"] = true) : (x["isActive"] = false);
              x.columns?.map((j) => {
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
                }

                j["sortable"] = true;
                j["size"] = 197;

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
          /*       x.rules?.map((k) => {
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
                  }

                  c["sortable"] = true;
                  c["size"] = 197;
                  c["readonly"] = true;
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
                });
              });
              return x;
            });
          })
        )
        .subscribe({
          next: (res) => {
            this.dataView = res;
          },
          error: (e) => {
            this.rows = null;
            this.dataView = null;
            this.columns = null;
            this.loading = false;

            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while getting report"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        })
        .add(() => {
          this.settings.columns = this.columns;
          this.settings = Object.assign({}, this.settings);
          this.loading = false;
          setTimeout(() => {
            document
              .querySelectorAll("revo-grid")
              .forEach((element) => (element.resize = true));
            document
              .querySelectorAll("revo-grid")
              .forEach((element) => (element.autoSizeColumn = true));
          }, 100);
        });
    } else if (report == "aggregated_balance") {
      this.apiReporting
        .getAggregatedBalanceReport(
          balancing_zone,
          owner_id,
          start_date,
          end_date
        )
        .pipe(
          map((data) => {
            return data.map((x, index) => {
              index == 0 ? (x["isActive"] = true) : (x["isActive"] = false);
              x.columns?.map((j) => {
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
                }

                j["sortable"] = true;
                j["size"] = 197;

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
               /*  x.rules?.map((k) => {
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
                  }

                  c["sortable"] = true;
                  c["readonly"] = true;
                  c["size"] = 197;
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
            /*       x.rules?.map((k) => {
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
            this.dataView = res;
          },
          error: (e) => {
            this.rows = null;
            this.dataView = null;
            this.columns = null;
            this.loading = false;

            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while getting report"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        })
        .add(() => {
          this.settings.columns = this.columns;
          this.settings = Object.assign({}, this.settings);
          this.loading = false;
          setTimeout(() => {
            document
              .querySelectorAll("revo-grid")
              .forEach((element) => (element.resize = true));
            document
              .querySelectorAll("revo-grid")
              .forEach((element) => (element.autoSizeColumn = true));
          }, 100);
        });
    } else if (report == "aggregated_balance_comparison") {
      this.apiReporting
        .getComparisonAggregatedBalanceReport(
          balancing_zone,
          owner_id,
          start_date,
          end_date,
          start_date1,
          end_date1
        )
        .pipe(
          map((data) => {
            return data.map((x, index) => {
              index == 0 ? (x["isActive"] = true) : (x["isActive"] = false);
              x.columns?.map((j) => {
                j["sortable"] = true;

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
              /*   x.rules?.map((k) => {
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

                j.children?.map((c) => {
                  c["sortable"] = true;

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
           /*        x.rules?.map((k) => {
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
                  c.children?.map((l) => {
                    l["sortable"] = true;
                    l["size"] = 130;
                    l["readonly"] = true;
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
                  });
                });
              });
              return x;
            });
          })
        )
        .subscribe({
          next: (res) => {
            this.dataView = res;
          },
          error: (e) => {
            this.rows = null;
            this.dataView = null;
            this.columns = null;
            this.loading = false;

            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while getting report"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        })
        .add(() => {
          this.settings.columns = this.columns;
          this.settings = Object.assign({}, this.settings);
          this.loading = false;
          setTimeout(() => {
            document
              .querySelectorAll("revo-grid")
              .forEach((element) => (element.resize = true));
            document
              .querySelectorAll("revo-grid")
              .forEach((element) => (element.autoSizeColumn = true));
          }, 100);
        });
    } else if (report == "cores") {
      this.apiReporting
        .getStrategicalReservesReport(balancing_zone, owner_id, reportDate)
        .pipe(
          map((data) => {

            return data.map((x, index) => {
              index == 0 ? (x["isActive"] = true) : (x["isActive"] = false);
              this.columns = x.columns.map((j) => {
                return j;
              });
              this.rows = x.rows.map((c) => {
                return c;
              });
              x.columns.map((j) => {
                j["sortable"] = true;
                j["size"] = 200;
                if (j["prop"] == "date") {
                  j["size"] = 160;
                }
                if (j["filter"] == "number") {
                  /*   j['columnType']= 'numeric'; */
                  j["cellProperties"] = ({ prop, model, data, column }) => {
                    return {
                      class: {
                        numeric: true,
                      },
                    };
                  };

                  x["rows"]?.map((e, index) => {
                    if (e[j["prop"]] != null) {
                      e[j["prop"]] = this.numeral(
                        Number(e[j["prop"]].toFixed(2))
                      ).format("0,0.[0000]");
                    } else {
                      e[j["prop"]] = "";
                    }
                    return e;
                  });
                }

                j.children?.map((c) => {
                  c["sortable"] = true;
                  c["size"] = 200;
                  if (c["prop"] == "date") {
                    c["pin"] = "colPinStart";
                    c["size"] = 160;
                  }
                  if (c["filter"] == "number") {
                    c["cellProperties"] = ({ prop, model, data, column }) => {
                      return {
                        class: {
                          numeric: true,
                        },
                      };
                    };
                    x["rows"]?.map((e, index) => {
                      if (e[c["prop"]] != null) {
                        e[c["prop"]] = this.numeral(
                          Number(e[c["prop"]].toFixed(2))
                        ).format("0,0.[0000]");
                      } else {
                        e[c["prop"]] = "";
                      }

                      return e;
                    });
                  }
                });
              });

              return x;
            });
          })
          
        )
        .subscribe({
          next: (res) => {
            this.dataView = res.filter(function (item) {
              return item.rows.length != 0;
            });
          },
          error: (e) => {
            this.rows = null;
            this.dataView = null;
            this.columns = null;
            this.loading = false;

            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while getting report"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        })
        .add(() => {
          this.settings.columns = this.columns;
          this.settings = Object.assign({}, this.settings);
          this.loading = false;
          setTimeout(() => {
            document
              .querySelectorAll("revo-grid")
              .forEach((element) => (element.resize = true));
            document
              .querySelectorAll("revo-grid")
              .forEach((element) => (element.autoSizeColumn = true));
          }, 100);
        });
    } else if (report == "risk_level") {
      this.apiReporting
        .getRiskLevelReport(balancing_zone, owner_id, reportDate)
        .pipe(
          map((data) => {
            return data["data"].map((x, index) => {
              index == 0 ? (x["isActive"] = true) : (x["isActive"] = false);
              this.columns = x.columns.map((j) => {
                return j;
              });
              this.rows = x.rows.map((c) => {
                return c;
              });
              x.columns.map((j) => {
                j["sortable"] = true;
                j["size"] = 200;
                if (j["prop"] == "date") {
                  j["size"] = 160;
                }
                if (j["filter"] == "number") {
                  /*   j['columnType']= 'numeric'; */
                  j["cellProperties"] = ({ prop, model, data, column }) => {
                    return {
                      class: {
                        numeric: true,
                      },
                    };
                  };

                  x["rows"]?.map((e, index) => {
                    if (e[j["prop"]] != null) {
                      e[j["prop"]] = this.numeral(
                        Number(e[j["prop"]].toFixed(2))
                      ).format("0,0.[0000]");
                    } else {
                      e[j["prop"]] = "";
                    }
                    return e;
                  });
                }

                j.children?.map((c) => {
                  c["sortable"] = true;
                  c["size"] = 200;
                  if (c["prop"] == "date") {
                    c["pin"] = "colPinStart";
                    c["size"] = 160;
                  }
                  if (c["filter"] == "number") {
                    c["cellProperties"] = ({ prop, model, data, column }) => {
                      return {
                        class: {
                          numeric: true,
                        },
                      };
                    };
                    x["rows"]?.map((e, index) => {
                      if (e[c["prop"]] != null) {
                        e[c["prop"]] = this.numeral(
                          Number(e[c["prop"]].toFixed(2))
                        ).format("0,0.[0000]");
                      } else {
                        e[c["prop"]] = "";
                      }

                      return e;
                    });
                  }
                });
              });

              return x;
            });
          })
        )
        .subscribe({
          next: (res) => {
            this.dataView = res.filter(function (item) {
              return item.rows.length != 0;
            });
          },
          error: (e) => {
            this.rows = null;
            this.dataView = null;
            this.columns = null;
            this.loading = false;

            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while getting report"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        })
        .add(() => {
          this.settings.columns = this.columns;
          this.settings = Object.assign({}, this.settings);
          this.loading = false;
          setTimeout(() => {
            document
              .querySelectorAll("revo-grid")
              .forEach((element) => (element.resize = true));
            document
              .querySelectorAll("revo-grid")
              .forEach((element) => (element.autoSizeColumn = true));
          }, 100);
        });
    } else if (report == "detailed_balance") {
      this.apiReporting
        .getDetailedBalanceReport(
          balancing_zone,
          owner_id,
          start_date,
          end_date
        )
        .pipe(
          map((data) => {
            return data.map((x, index) => {
              index == 0 ? (x["isActive"] = true) : (x["isActive"] = false);
              x.columns?.map((j) => {
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
                }

                j["sortable"] = true;
                j["size"] = 197;

                if (j["name"] == "Date") {
                  j["pin"] = "colPinStart";
                  j["size"] = 130;
                } else if (j["filter"] == "string") {
                  j["columnType"] = "string";
                } else if (j["filter"] == "number") {
                  x["rows"]?.map((e, index) => {
                    e[j["prop"]] = this.numeral(
                      Number(e[j["prop"]].toFixed(6))
                    ).format("0,0.[000000]");
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
           /*      x.rules?.map((k) => {
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
                  }

                  c["sortable"] = true;
                  c["readonly"] = true;
                  c["size"] = 197;
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
                  } else if (c["filter"] == "number") {
                    x["rows"]?.map((e, index) => {
                      e[c["prop"]] = this.numeral(
                        Number(e[c["prop"]].toFixed(6))
                      ).format("0,0.[000000]");
                    });
                    c["cellProperties"] = ({ prop, model, data, column }) => {
                      return {
                        class: {
                          numeric: true,
                        },
                      };
                    };
                  }
           /*        x.rules?.map((k) => {
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
            this.dataView = res;
          },
          error: (e) => {
            this.rows = null;
            this.dataView = null;
            this.columns = null;
            this.loading = false;

            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while getting report"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        })
        .add(() => {
          this.settings.columns = this.columns;
          this.settings = Object.assign({}, this.settings);
          this.loading = false;
          setTimeout(() => {
            document
              .querySelectorAll("revo-grid")
              .forEach((element) => (element.resize = true));
            document
              .querySelectorAll("revo-grid")
              .forEach((element) => (element.autoSizeColumn = true));
          }, 100);
        });
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
  }
  onChange($event) {
    this.reportForm.controls["balancing_zone"].setValue("");
    this.getbalanceZones(this.reportForm.get("country_code").value);
  }
  onChangeReport($event) {
    if ($event == "daily_balance") {
      this.dateView = false;
      this.dateView1 = false;
      this.dateView3 = false;
      this.balanceZoneView = true;
      this.reportForm.get("balancing_zone").setValidators(Validators.required);
      this.reportForm.get("balancing_zone").updateValueAndValidity();
      this.reportForm.get("date").clearValidators();
      this.reportForm.get("date").setValue({
        start: new Date(),
        end: new Date(),
      });
      this.reportForm.get("date").updateValueAndValidity();
      this.reportForm.get("date1").clearValidators();
      this.reportForm.get("date1").updateValueAndValidity();
      this.reportForm.get("date3").clearValidators();
      this.reportForm.get("date3").updateValueAndValidity();
    } else if ($event == "aggregated_balance") {
      this.dateView = true;
      this.dateView1 = false;
      this.dateView3 = false;
      this.balanceZoneView = true;
      this.reportForm.get("balancing_zone").setValidators(Validators.required);
      this.reportForm.get("balancing_zone").updateValueAndValidity();
      this.reportForm
        .get("date")
        .setValidators([Validators.required, this.dateRangeValidator]);
      this.reportForm.get("date").updateValueAndValidity();
      this.reportForm.get("date1").clearValidators();
      this.reportForm.get("date1").updateValueAndValidity();
      this.reportForm.get("date3").clearValidators();
      this.reportForm.get("date3").updateValueAndValidity();
    } else if ($event == "aggregated_balance_comparison") {
      this.dateView = true;
      this.dateView1 = true;
      this.dateView3 = false;
      this.balanceZoneView = true;
      this.reportForm.get("balancing_zone").setValidators(Validators.required);
      this.reportForm.get("balancing_zone").updateValueAndValidity();
      this.reportForm
        .get("date")
        .setValidators([
          Validators.required,
          this.dateRangeValidator,
          this.dateRangeMonthValidator,
        ]);
      this.reportForm.get("date").updateValueAndValidity();
      this.reportForm
        .get("date1")
        .setValidators([
          Validators.required,
          this.dateRangeValidator1,
          this.dateRangeMonthValidator1,
        ]);
      this.reportForm.get("date1").updateValueAndValidity();
      this.reportForm.get("date3").clearValidators();
      this.reportForm.get("date3").updateValueAndValidity();
    } else if ($event == "cores") {
      this.filterFn = (date) => date.getDate() === 1 && date < this.firstDay;
      this.dateView = false;
      this.dateView1 = false;
      this.dateView3 = true;
      this.balanceZoneView = true;
      this.reportForm.get("balancing_zone").setValidators(Validators.required);
      this.reportForm.get("balancing_zone").updateValueAndValidity();
      this.reportForm.get("date").clearValidators();
      this.reportForm.get("date").updateValueAndValidity();
      this.reportForm.get("date1").clearValidators();
      this.reportForm.get("date1").updateValueAndValidity();
      this.reportForm.get("date3").setValidators(Validators.required);
      this.reportForm.get("date3").updateValueAndValidity();
    } else if ($event == "risk_level") {
      this.filterFn = (date) => date <= new Date();
      this.dateView = false;
      this.dateView1 = false;
      this.dateView3 = true;
      this.balanceZoneView = true;

      this.reportForm.get("balancing_zone").setValidators(Validators.required);
      this.reportForm.get("balancing_zone").updateValueAndValidity();
      this.reportForm.get("date").clearValidators();
      this.reportForm.get("date").updateValueAndValidity();
      this.reportForm.get("date1").clearValidators();
      this.reportForm.get("date1").updateValueAndValidity();
      this.reportForm.get("date3").setValidators(Validators.required);
      this.reportForm.get("date3").updateValueAndValidity();
    } else if ($event == "detailed_balance") {
      this.dateView = true;
      this.dateView1 = false;
      this.dateView3 = false;
      this.balanceZoneView = true;
      this.reportForm.get("balancing_zone").setValidators(Validators.required);
      this.reportForm.get("balancing_zone").updateValueAndValidity();
      this.reportForm
        .get("date")
        .setValidators([Validators.required, this.dateRangeValidator]);
      this.reportForm.get("date").updateValueAndValidity();
      this.reportForm.get("date1").clearValidators();
      this.reportForm.get("date1").updateValueAndValidity();
      this.reportForm.get("date3").clearValidators();
      this.reportForm.get("date3").updateValueAndValidity();
    } else if ($event == "gas_swaps") {
      this.dateView = true;
      this.dateView1 = false;
      this.dateView3 = false;
      this.balanceZoneView = true;
      this.reportForm.get("balancing_zone").setValidators(Validators.required);
      this.reportForm.get("balancing_zone").updateValueAndValidity();
      this.reportForm
        .get("date")
        .setValidators([Validators.required, this.dateRangeValidator]);
      this.reportForm.get("date").updateValueAndValidity();
      this.reportForm.get("date1").clearValidators();
      this.reportForm.get("date1").updateValueAndValidity();
      this.reportForm.get("date3").clearValidators();
      this.reportForm.get("date3").updateValueAndValidity();
    } else if ($event == "gas_purchases_and_sales") {
      this.dateView = true;
      this.dateView1 = false;
      this.dateView3 = false;
      this.balanceZoneView = true;
      this.reportForm.get("balancing_zone").setValidators(Validators.required);
      this.reportForm.get("balancing_zone").updateValueAndValidity();
      this.reportForm
        .get("date")
        .setValidators([Validators.required, this.dateRangeValidator]);
      this.reportForm.get("date").updateValueAndValidity();
      this.reportForm.get("date1").clearValidators();
      this.reportForm.get("date1").updateValueAndValidity();
      this.reportForm.get("date3").clearValidators();
      this.reportForm.get("date3").updateValueAndValidity();
    } else {
      this.dateView = true;
      this.dateView1 = false;
      this.dateView3 = false;
      this.balanceZoneView = false;
      this.reportForm.get("balancing_zone").clearValidators();
      this.reportForm.get("balancing_zone").updateValueAndValidity();
      this.reportForm
        .get("date")
        .setValidators([Validators.required, this.dateRangeValidator]);
      this.reportForm.get("date").updateValueAndValidity();
      this.reportForm.get("date1").clearValidators();
      this.reportForm.get("date1").updateValueAndValidity();
      this.reportForm.get("date3").clearValidators();
      this.reportForm.get("date3").updateValueAndValidity();
    }
  }
  private dateRangeValidator: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date = this.reportForm && this.reportForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.reportForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.reportForm.get("date").value.end,
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
  private dateRangeMonthValidator: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date = this.reportForm && this.reportForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.reportForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.reportForm.get("date").value.end,
        "yyyy-MM-dd"
      );

      if (from && to) {
        if (
          (moment(from, "yyyy-MM-dd").isValid() == true ||
            moment(to, "yyyy-MM-dd").isValid() == true) &&
          this.reportForm.get("date").value.end.getMonth() -
            this.reportForm.get("date").value.start.getMonth() ==
            0
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
      this.errorMonth = true;
    } else {
      this.errorMonth = false;
    }

    return invalid ? { invalidRange: {} } : null;
  };
  private dateRangeMonthValidator1: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date = this.reportForm && this.reportForm.get("date1").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.reportForm.get("date1").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.reportForm.get("date1").value.end,
        "yyyy-MM-dd"
      );

      if (from && to) {
        if (
          (moment(from, "yyyy-MM-dd").isValid() == true ||
            moment(to, "yyyy-MM-dd").isValid() == true) &&
          this.reportForm.get("date1").value.end.getMonth() -
            this.reportForm.get("date1").value.start.getMonth() ==
            0
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
      this.errorMonth1 = true;
    } else {
      this.errorMonth1 = false;
    }

    return invalid ? { invalidRange: {} } : null;
  };
  private dateRangeValidator1: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date = this.reportForm && this.reportForm.get("date1").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.reportForm.get("date1").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.reportForm.get("date1").value.end,
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
  reset() {
    this.reportForm.controls["country_code"].setValue("");
    this.reportForm.controls["balancing_zone"].setValue("");
    this.reportForm.controls["legal_entity"].setValue("");
    this.reportForm.controls["date"].setValue("");
    this.entitiesOptions = [];
    this.source = null;
    this.dataView=null;
  }

  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  calculate() {
    this.loading = true;
    this.country = this.reportForm.get("country_code").value;
    this.balancing_zone = this.reportForm.get("balancing_zone").value;
    this.entity = this.reportForm.get("legal_entity").value;
    this.start_date = this.datepipe.transform(
      this.reportForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.reportForm.get("date").value.end,
      "yyyy-MM-dd"
    );
    this.start_date1 = this.datepipe.transform(
      this.reportForm.get("date1").value.start
        ? this.reportForm.get("date1").value.start
        : null,
      "yyyy-MM-dd"
    );
    this.end_date1 = this.datepipe.transform(
      this.reportForm.get("date1").value.end
        ? this.reportForm.get("date1").value.end
        : null,
      "yyyy-MM-dd"
    );
    this.reportDate = this.datepipe.transform(
      this.reportForm.get("date3").value
        ? this.reportForm.get("date3").value
        : null,
      "yyyy-MM-dd"
    );
    this.report = this.reportForm.get("report").value;
    this.getReport(
      this.start_date,
      this.end_date,
      this.entity,
      this.report,
      this.balancing_zone,
      this.start_date1,
      this.end_date1,
      this.reportDate
    );
  }

  exportAsXLSX() {
    if (this.report == "aggregated_balance_comparison") {
      this.excelService.exportAsExcelFileWithMultipleSheets(
        this.dataView,
        this.report +
          "_" +
          this.start_date +
          "_" +
          this.end_date +
          "_VS_" +
          this.start_date1 +
          "_" +
          this.end_date1,
        true
      );
    } else if (this.report == "cores") {
      this.excelService.exportAsExcelFileWithMultipleSheets(
        this.dataView,
        this.report +
          "_" +
          this.reportDate.split("-")[1] +
          "-" +
          this.reportDate.split("-")[0]
      );
    } else {
      this.excelService.exportAsExcelFileWithMultipleSheets(
        this.dataView,
        this.report + "_" + this.start_date + "_" + this.end_date
      );
    }

    /* const exportExcel = [];
    const exportExcelColumns = [];
    this.rows.forEach(val => exportExcel.push(Object.assign({}, val)));
    this.columns.forEach(val => exportExcelColumns.push(Object.assign({}, val)));
   exportExcel.map((x)=>{
      exportExcelColumns.map((j)=>{
        if(j['filter']=='number'){
          x[j['name']+"*"]=x[j['prop']].replaceAll('.','');
        } else {
          x[j['name']+"*"]=x[j['prop']];
        }
     
        j.children?.map((c)=>{
      
          if(c['filter']=='number'){
            x[c['prop']+"*"]= x[c['prop']].replaceAll('.','');
          } else {
            x[c['prop']+"*"]= x[c['prop']];
          }
        
        
          delete x[c['prop']];
          
        x[c['prop']]=x[c['prop']+"*"];
       delete x[c['prop']+"*"];
        })
   
        delete x[j['prop']];

        x[j['name']]=x[j['name']+"*"];
       delete x[j['name']+"*"];
        j.children?.map((c)=>{
          delete x[j['name']];
        });
      })
      return x;
    }) 

    this.excelService.exportAsExcelFile(
      exportExcel,
      this.report + "_" + this.start_date + "_" + this.end_date
    );    */
  }
  exportAsCSV() {
    if (this.report == "aggregated_balance_comparison") {
      (document.querySelectorAll("revo-grid") as any).forEach((element) => {
        if (element.id == this.currentTab) {
          element.getPlugins().then((plugins) => {
            plugins.forEach((p) => {
              if (p.exportFile) {
                const exportPlugin = p;
                exportPlugin.exportFile({
                  filename:
                    this.report +
                    "_" +
                    this.currentTab +
                    "_" +
                    this.start_date +
                    "_" +
                    this.end_date +
                    "_VS_" +
                    this.start_date1 +
                    "_" +
                    this.end_date1,
                });
              }
            });
          });
        }
      });
    } else if (this.report == "cores") {
      (document.querySelectorAll("revo-grid") as any).forEach((element) => {
        if (element.id == this.currentTab) {
          element.getPlugins().then((plugins) => {
            plugins.forEach((p) => {
              if (p.exportFile) {
                const exportPlugin = p;
                exportPlugin.exportFile({
                  filename:
                    this.report +
                    "_" +
                    this.currentTab +
                    "_" +
                    this.reportDate.split("-")[1] +
                    "-" +
                    this.reportDate.split("-")[0],
                });
              }
            });
          });
        }
      });
    } else {
    }
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

    this.currentTabOriginal = $event.tabTitle;
    this.currentTab = $event.tabTitle.replace(" ", "_").toLowerCase();
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
