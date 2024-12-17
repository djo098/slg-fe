import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  QueryList,
  AfterViewInit,
  HostListener,
  Inject,
} from "@angular/core";
import "@angular/common/locales/global/en";
import * as moment from "moment";
import { DatePipe, formatNumber } from "@angular/common";

import NumberColumnType from "@revolist/revogrid-column-numeral";
import { map, catchError, filter } from "rxjs/operators";

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
  NbMenuService,
  NB_WINDOW,
  NbMenuItem,
  NbDialogService,
} from "@nebular/theme";
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable";
import { type } from "os";
import { defaultMaxListeners } from "events";
import { messageService } from "../../@core/utils/messages";
//import { ComponentCanDeactivate } from '../pending-changes.guard';
import { Observable, Subscription } from "rxjs";
import { ConnectionPointService } from "../../@core/services/connectionPoint.service";
import { NominationsService } from "../../@core/services/nominations.service";
import { IfStmt } from "@angular/compiler";
import { color } from "d3-color";
import { DialogExportSchedulingComponent } from "./dialog-export-scheduling/dialog-export-scheduling.component";
import { ContractsService } from "../../@core/services/contracts.service";
import { NbAccessChecker } from "@nebular/security";
import { DarkModeService } from "../../@core/services/sharedServices/darkMode.service";
import { subSeconds } from "date-fns";
import { JobsService } from "../../@core/services/jobs.service";
import { DialogExportServicesComponent } from "./dialog-export-services/dialog-export-services.component";
import { DialogConfirmationComponent } from "../../@theme/components/confirmation-dialog/dialog-confirmation-delete.component";
@Component({
  selector: "ngx-nomination",
  templateUrl: "./nomination.component.html",
  styleUrls: ["./nomination.component.scss"],
})
export class NominationComponent implements OnInit {
  @ViewChild("tabset") tabsetEl: NbTabsetComponent;
  @ViewChild("generateNomination", { static: true })
  accordionGenerateNomination;
  toggleNgModel = false;
  protected subscriptions: Subscription[] = [];
  zoneOptions: any;
  regasificationPlant: any;
  countriesOptions: any;
  entitiesOptions: any;
  loadingViewNomination = false;
  loadingComparisonNomination = false;
  loadingComparison = false;
  dataView: any;
  data1: any;
  optionsss: any;
  neededArray = [];
  nominationForm!: FormGroup;
  exportForm!: FormGroup;
  grid: any;
  currentTab: string;
  currentTabOriginal: string;
  errorBalanceZone: any;
  errorLegalEntity: any;
  errorDate = false;
  errorDateForward = false;
  indexRow: any;
  plugin: any;
  country: any;
  balanceZone: any;
  start_date: any;
  end_date: any;
  legalEntity: any;
  service = [];
  granularity: any;
  connection_point: any;
  connection_point_type: any;
  eventTimes = [];
  eventTimes2 = [];
  eventTimes3 = [];
  logisticElementsTypeOptions: any;
  logisticElementOptions: any;
  errorLogisticElement = false;
  serviceOptions: any;
  valAnt: any;
  validateCapacity = true;
  errorsContract = [];
  errorsString: string;
  min: Date;
  max: Date;
  validateRevogridComparison: boolean;
  validateRevogridView: boolean;
  validateRevogrid_array = [];
  compareTSO = false;
  currentTabId: any;
  selectedServices: any;
  services_tabs = [];
  services_differences: string;
  nomination_type: any;
  nominationTypeOptions: any;
  timeZone: any;
  dates = [];
  errorGranularity = false;
  start_time: any;
  numeral = NumberColumnType.getNumeralInstance();
  items = [{ title: "CSV" }, { title: "XML" }];
  granularityOptions: any;
  loadingForm = false;
  loading_form_array: any = [];
  exportOptions = [
    {
      id: "csv",
      label: "CSV",
    },
    {
      id: "xlsx",
      label: "EXCEL",
    },
    {
      id: "xml",
      label: "XML",
    },
  ];
  timestamp: string;
  current_hour_index: any[];
  disabled_index: any;
  readonly: boolean;
  revogridTheme: string;
  eventTimes1 = [];
  constructor(
    private messageService: messageService,
    private apiBalanceZone: BalanceZoneService,
    private apiNomination: NominationsService,
    private elRef: ElementRef,
    private formBuilder: FormBuilder,
    private apiCountry: CountryService,
    private apiLegalEntity: LegalEntityService,
    private excelService: ExcelService,
    public datepipe: DatePipe,
    protected dateService: NbDateService<Date>,
    private apiConnectionPoint: ConnectionPointService,
    private apiContract: ContractsService,
    private nbMenuService: NbMenuService,
    private dialogService: NbDialogService,
    public accessChecker: NbAccessChecker,
    private darkModeService: DarkModeService,
    private jobService: JobsService
  ) {
    this.getcountries();
    this.getLegalEntities();
    this.getConnectionPointsTypes();
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
    this.accessChecker
      .isGranted("create", "nomination")
      .subscribe((granted) => (this.readonly = !granted));
    this.accessChecker.isGranted("create", "nomination").subscribe((granted) =>
      granted == true
        ? (this.nominationTypeOptions = [
            { id: "intradaily", label: "Intradaily" },
            { id: "forward", label: "Forward" },
            { id: "comparison", label: "Comparison" },
          ])
        : (this.nominationTypeOptions = [
            { id: "comparison", label: "Comparison" },
          ])
    );
    this.dateService.getFirstDayOfWeek();

    this.accordionGenerateNomination.toggle();
    this.exportForm = this.formBuilder.group({
      extension: new FormControl("", [Validators.required]),
    });
    this.nominationForm = this.formBuilder.group({
      date: new FormControl("", [
        Validators.required,
        this.dateRangeValidator,
        this.dateRangeValidatorForward,
      ]),
      balancing_zone: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      connection_type: new FormControl("", [Validators.required]),
      connection_point: new FormControl(""),
      service: new FormControl([], [Validators.required]),
      legal_entity: new FormControl("", [Validators.required]),
      granularity: new FormControl("", [Validators.required]),
      nominationType: new FormControl("", [Validators.required]),
    });
    this.country = localStorage.getItem("country_no");
    this.legalEntity = localStorage.getItem("entity_no");
    this.balanceZone = localStorage.getItem("balance_zone_no");
    this.connection_point_type = localStorage.getItem(
      "connection_point_type_no"
    );
    // Watch connection_type changes
    this.nominationForm.get('connection_type')?.valueChanges.subscribe((value) => {
      const connectionPointControl = this.nominationForm.get('connection_point');
      if (value === 'conventional_consumer_connection') {
        connectionPointControl?.clearValidators(); // Not required
      } else {
        connectionPointControl?.setValidators(Validators.required); // Required
      }
      connectionPointControl?.updateValueAndValidity(); // Trigger revalidation
    });

    this.connection_point = localStorage.getItem("connection_point_no");

    if (localStorage.getItem("service_array_no")) {
      this.service = JSON.parse(localStorage.getItem("service_array_no"));
    }
    this.start_date = localStorage.getItem("start_date_no");
    this.end_date = localStorage.getItem("end_date_no");
    this.granularity = localStorage.getItem("granularity");
    this.nomination_type = localStorage.getItem("nomination_type");
    this.currentTab = localStorage.getItem("currenTab_no");

    if (
      this.country &&
      this.balanceZone &&
      this.connection_point_type &&
      this.legalEntity &&
      this.connection_point &&
      this.service.length > 0 &&
      this.granularity &&
      this.nomination_type
    ) {
      this.getbalanceZones(this.country);
      this.getConnectionPoints(this.connection_point_type, this.balanceZone);
      this.getServices(this.connection_point_type, this.balanceZone);
      this.nominationForm.controls["service"].setValue(this.service);

      this.nominationForm.controls["country_code"].setValue(this.country);
      this.nominationForm.controls["balancing_zone"].setValue(
        Number(this.balanceZone)
      );

      this.nominationForm.controls["connection_point"].setValue(
        Number(this.connection_point)
      );
      this.nominationForm.controls["connection_type"].setValue(
        this.connection_point_type
      );

      this.nominationForm.controls["legal_entity"].setValue(
        Number(this.legalEntity)
      );
      this.nominationForm.controls["nominationType"].setValue(
        this.nomination_type
      );

      this.nominationForm.controls["granularity"].setValue(this.granularity);
      this.nominationForm.controls["date"].setValue({
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

      if (this.nomination_type == "intradaily") {
        this.granularityOptions = [{ id: "hourly", label: "Hourly" }];
        this.nominationForm.get("date").disable();
        this.getTimeZone(this.balanceZone);
      } else {
        this.getGranularityByService(this.service, this.balanceZone);
      }
      if (this.nominationForm.valid) {
        this.calculate(false, this.currentTab);
      }
    } else {
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object = JSON.parse(localStorage.getItem("settings_parameters"));
        this.nominationForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.nominationForm
          .get("balancing_zone")
          .setValue(object["balancing_zone"]);
        this.getbalanceZones(object["country_code"]);
      }
    }
    this.numeral.locale("es");
  }
  cancelAllRequests() {
    if (!this.subscriptions) {
      return;
    }
    this.subscriptions.forEach(s => {

      s.unsubscribe()
    }
    );
    this.subscriptions = [];

  }

  private dateRangeValidator: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date = this.nominationForm && this.nominationForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.nominationForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.nominationForm.get("date").value.end,
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

  private dateRangeValidatorForward: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date = this.nominationForm && this.nominationForm.get("date").value;
    const nomination_type =
      this.nominationForm && this.nominationForm.get("nominationType").value;
    if (nomination_type != null) {
      if (nomination_type == "forward") {
        if (date != null) {
          const from = this.nominationForm.get("date").value.start;

          const to = this.datepipe.transform(
            this.nominationForm.get("date").value.end,
            "yyyy-MM-dd"
          );

          if (from && to) {
            const yesterdayMidnight = new Date(new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000);
            if (from.valueOf() >= yesterdayMidnight.valueOf()) {
              invalid = false;
            } else {
              invalid = true;
            }
          }
        } else {
          invalid = true;
        }

        if (invalid == true) {
          this.errorDateForward = true;
        } else {
          this.errorDateForward = false;
        }
      } else {
        invalid = false;
      }
    }

    return invalid ? { invalidRange: {} } : null;
  };

  getNomination(
    balancing_zone,
    connection_point,
    service,
    legal_entity,
    start_date,
    end_date,
    granularity,
    compare,
    nomination_type,
    currenTab?
  ) {
    if (Number.isNaN(connection_point)) {
      connection_point = -1;
    }
    
    const subscription = this.apiNomination
      .getNominations(
        balancing_zone,
        legal_entity,
        connection_point,
        service,
        start_date,
        end_date,
        granularity,
        compare,
        nomination_type
      )
      .pipe(
        map((data) => {
          this.services_tabs = [];
          this.current_hour_index = [];
          this.disabled_index = [];
          if (
            localStorage.getItem("rgRow_no") &&
            localStorage.getItem("rgCol_no")
          ) {
            localStorage.setItem(
              "rgRow_no_new",
              localStorage.getItem("rgRow_no")
            );
            localStorage.setItem(
              "rgCol_no_new",
              localStorage.getItem("rgCol_no")
            );
          }
          this.services_differences = null;
          if (data["msg"] == "") {
            this.compareTSO = false;
          } else if (data["msg"].search(/incorrectly/gi) !== -1) {
            this.messageService.showToast("danger", "Error", data["msg"]);
          } else if (data["msg"].search(/correctly/gi) !== -1) {
            this.messageService.showToast("success", "Success", data["msg"]);
          } else {
            this.compareTSO = false;

            this.messageService.showToast("danger", "Error", data["msg"]);
          }
          this.dates = [];
          return data["data"].map((x, index) => {
            this.services_tabs.push(Number(x["id"]));
            var errrosContractByService = [];
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
            (currenTab === undefined || currenTab == null) && index == 0
              ? (this.currentTabId = x["id"])
              : "";
            currenTab !== undefined && currenTab !== null
              ? x["name"] == currenTab
                ? (this.currentTabId = x["id"])
                : ""
              : "";

            localStorage.setItem("currenTab_no", this.currentTabOriginal);
            x["rows"]?.map((e) => {
              var keys = Object.keys(e);
              for (let i in keys) {
                if (keys[i] != "DATE") {
                  e[keys[i]] = this.numeral(Number(e[keys[i]].toFixed(4))).format(
                    "0,0.[0000]"
                  );
                }
              }
              if (index == 0) {
                this.dates.push(e["DATE"]);
              }
            });

            const reorderedColumns = [];

            x["columns"]?.forEach((j) => {
              j["sortable"] = true;

              if (j["name"] === "Date") {
                j["size"] = 150;
                if (this.granularity === "hourly") {
                  j["size"] = 180;
                }
                j["pin"] = "colPinStart";
                j["columnType"] = "string";

                if (this.nominationForm.get("nominationType").value === "intradaily") {
                  j["cellProperties"] = ({ prop, model, data, rowIndex }) => {
                    for (const n of Object.values(x["nomination_hours"])) {
                      if (model[prop] === n) {
                        this.current_hour_index.push(data.indexOf(model));
                      }
                    }
                    if (new Date(model[prop]) < new Date(x["nomination_hours"][0])) {
                      this.disabled_index.push(data.indexOf(model));
                    }
                  };
                } else if (
                  this.nominationForm.get("nominationType").value === "forward" &&
                  this.nominationForm.get("granularity").value === "hourly"
                ) {
                  j["cellProperties"] = ({ prop, model, data, rowIndex }) => {
                    if (new Date(model[prop]) < new Date(x["nomination_hours"][0])) {
                      this.disabled_index.push(data.indexOf(model));
                    }
                  };
                } else if (
                  this.nominationForm.get("nominationType").value === "forward" &&
                  this.nominationForm.get("granularity").value === "daily"
                ) {
                  j["cellProperties"] = ({ prop, model, data, rowIndex }) => {
                    if (connection_point === -1) {
                      this.disabled_index.push(data.indexOf(model));
                    }
                  };
                }

                // Add Date column to reordered list first
                reorderedColumns.push(j);
              } else if (j["name"] === "Total" && connection_point === -1) {
                // Add Total column to reordered list after Date
                reorderedColumns.splice(3, 0, j);
              } else {
                // Process other columns
                if (j["filter"] === "string") {
                  j["size"] = 160;
                  j["columnType"] = "string";
                } else if (j["filter"] === "number") {
                  j["size"] = 160;
                  j["columnType"] = "numeric";
                  j["cellProperties"] = ({ prop, model, data, column }) => {
                    return {
                      class: {
                        numeric: true,
                      },
                    };
                  };
                }

                // Append other columns to the reordered list
                reorderedColumns.push(j);
              }
              j["cellTemplate"] = (createElement, props) => {
                for (const n of this.current_hour_index) {
                  if (props.data.indexOf(props.model) == n) {
                    return createElement(
                      "div",
                      {
                        style: {
                          background: "#263CC8",
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

              j.children?.map((c) => {
                c["sortable"] = true;
                c["size"] = 160;
                c["columnType"] = "numeric";
                c["cellProperties"] = ({ prop, model, data, column }) => {
                  return {
                    class: {
                      numeric: true,
                    },
                  };
                };
                var contract;

                if (c["name"] == "Total Capacity") {
                  contract = c["prop"].replace("TOTAL_CAP_", "");

                  if (contract != undefined || contract != null) {
                    x["rows"]?.map((e, index) => {
                      if (
                        Number(
                          e["SCHED_CAP_" + contract]
                            .toString()
                            .replace(/\./g, "")
                            .replace(",", ".")
                        ) >
                        Number(
                          e["TOTAL_CAP_" + contract]
                            .toString()
                            .replace(/\./g, "")
                            .replace(",", ".")
                        )
                      ) {
                        errrosContractByService.push(
                          contract.split(/_(.*)/s)[1]
                        );
                      }
                    });
                  }
                }
                c["cellTemplate"] = (createElement, props) => {
                  for (const n of this.current_hour_index) {
                    if (props.data.indexOf(props.model) == n) {
                      return createElement(
                        "div",
                        {
                          style: {
                            background: "#263CC8",
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
                if (c["readonly"] == false) {
                  c["readonly"] = ({ prop, model, data, column, rowIndex }) => {
                    var isReadonly: boolean = false;
                    for (const n of this.disabled_index) {
                      if (data.indexOf(model) == n) {
                        isReadonly = true;
                      }
                    }

                    return isReadonly;
                  };
                }
              });
            });
            if (errrosContractByService.length == 0) {
            } else {
              x["errorsContracts"] = this.uniqByObject(errrosContractByService)
                .toString()
                .replaceAll(",", ", ");
            }
            x["columns"] = reorderedColumns;
            return x;
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.dataView = res;

          //this.plugin = { numeric: new NumberColumnType("0,0.0") };
        },
        error: (e) => {
          this.dataView = null;
          this.services_tabs = null;
          if (e.error?.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting nomination"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });

    this.subscriptions.push(subscription)
      subscription.add(() => {
        setTimeout(() => {
          document
            .querySelectorAll("revo-grid")
            .forEach((element) => (element.resize = true));
          document
            .querySelectorAll("revo-grid")
            .forEach((element) => (element.autoSizeColumn = true));
          if (
            isNaN(Number(localStorage.getItem("rgCol_no_new"))) == false &&
            isNaN(Number(localStorage.getItem("rgRow_no_new"))) == false
          ) {
            document.querySelectorAll("revo-grid").forEach((element) =>
              element.scrollToCoordinate({
                x: Number(localStorage.getItem("rgCol_no_new")),
                y: Number(localStorage.getItem("rgRow_no_new")),
              })
            );
          }

          if (this.services_tabs != null) {
            var services_differences_id = this.service.filter(
              (item) => this.services_tabs.indexOf(item) < 0
            );

            var services_differences_label = this.serviceOptions.filter(
              function (e) {
                return this.indexOf(e["id"]) >= 0;
              },
              services_differences_id
            );

            services_differences_label = services_differences_label.map((l) => {
              return l["label"];
            });
            this.services_differences = services_differences_label
              .toString()
              .replaceAll(",", ", ");
          } else {
            this.services_differences = null;
          }

          //  this.services_differences = services_differences_label.toString();
        }, 100);

        this.loadingViewNomination = false;
      });
  }

  calculate(compare, currenTab?, first?) {
    if(this.subscriptions.length>0){
      this.cancelAllRequests();
    }
    this.validateRevogridView = true;
    this.validateCapacity = true;
    this.loadingViewNomination = true;
    this.errorsContract = [];
    this.compareTSO = false;
    if (first) {
      localStorage.setItem("rgRow_no", "");
      localStorage.setItem("rgRow_no_new", "");
      localStorage.setItem("rgCol_no", "");
      localStorage.setItem("rgCol_no_new", "");
      localStorage.setItem("currenTab_no", "");
      this.currentTab = null;
    }

    this.country = this.nominationForm.get("country_code").value;
    this.connection_point = this.nominationForm.get("connection_point").value;
    if (this.connection_point == "") { this.connection_point = -1; }
    this.connection_point_type =
      this.nominationForm.get("connection_type").value;
    this.balanceZone = this.nominationForm.get("balancing_zone").value;
    this.legalEntity = this.nominationForm.get("legal_entity").value;
    this.start_date = this.datepipe.transform(
      this.nominationForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.nominationForm.get("date").value.end,
      "yyyy-MM-dd"
    );
    this.granularity = this.nominationForm.get("granularity").value;
    this.service = this.nominationForm.get("service").value;
    this.nomination_type = this.nominationForm.get("nominationType").value;
    this.getNomination(
      this.balanceZone,
      this.connection_point,
      this.service,
      this.legalEntity,
      this.start_date,
      this.end_date,
      this.granularity,
      compare,
      this.nomination_type,
      currenTab
    );

    localStorage.setItem("country_no", this.country);
    localStorage.setItem("balance_zone_no", this.balanceZone);
    localStorage.setItem("entity_no", this.legalEntity);
    localStorage.setItem("service_array_no", JSON.stringify(this.service));
    localStorage.setItem("connection_point_no", this.connection_point);
    localStorage.setItem("granularity", this.granularity);
    localStorage.setItem(
      "connection_point_type_no",
      this.connection_point_type
    );
    localStorage.setItem("start_date_no", this.start_date);
    localStorage.setItem("end_date_no", this.end_date);
    localStorage.setItem("nomination_type", this.nomination_type);
    // localStorage.setItem("currenTab_no", this.currentTabOriginal);
    this.timestamp = new Date(
      new Date().toString().replace(/GMT.*$/, "GMT+0000")
    )
      .toISOString()
      .replace("Z", "")
      .replace("T", " ")
      .split(".")[0];
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

  exportAsCSV() {
    (document.querySelectorAll("revo-grid") as any).forEach((element) => {
      if (element.id === this.currentTab) {
        element.getPlugins().then((plugins) => {
          plugins.forEach((p) => {
            if (p.exportFile) {
              const exportPlugin = p;
              exportPlugin.exportFile({
                filename: "Nomination_" + this.currentTab,
              });
            }
          });
        });
      }
    });

    /*     document.querySelectorAll('revo-grid').forEach((element) => {
      if (element.id == this.currentTab) {
        element
          .getSource()
          .then((value) => {
            this.excelService.exportAsExcelFile(value, this.currentTab);
          })
          .catch((err) => {
       
              this.messageService.showToast('danger','Error',err)
          
            
          });
      }
    }); */
  }
  compare(all?: string) {
    if (all == "all") {
      this.dialogService.open(DialogExportServicesComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Nominated Services",
          balanceZone: this.balanceZone,
          legalEntity: this.legalEntity,
          start_date: this.start_date,
          end_date: this.end_date
        },
        autoFocus: false,
      });
    } else {
      this.compareTSO = true;
      this.calculate(true);
    }
  }
  onChangeService($event) {
    if ($event.length > 0) {
      this.getGranularityByService(
        $event,
        this.nominationForm.get("balancing_zone").value,
        true
      );
    }
  }
  onChangeCountry($event) {
    this.nominationForm.controls["balancing_zone"].setValue("");
    this.nominationForm.controls["connection_point"].setValue("");
    this.logisticElementOptions = [];
    this.getbalanceZones(this.nominationForm.get("country_code").value);
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
    this.currentTabId = $event.tabId;

    this.currentTabOriginal = $event.tabTitle;
    this.currentTab = $event.tabTitle.replace(" ", "_").toLowerCase();
    localStorage.setItem("currenTab_no", this.currentTabOriginal);
  }
  getConnectionPointsTypes() {
    this.loadingForm = true;
    this.loading_form_array[3] = true;
    this.apiConnectionPoint
      .getConnectionPointTypes()
      .subscribe({
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
      })
      .add(() => {
        this.loading_form_array[3] = false;
        if (this.loading_form_array.includes(true) == false) {
          this.loadingForm = false;
          this.loading_form_array = [];
        }
      });
  }
  getConnectionPoints(type, zone) {
    this.loadingForm = true;
    this.loading_form_array[4] = true;
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
      })
      .add(() => {
        this.loading_form_array[4] = false;
        if (this.loading_form_array.includes(true) == false) {
          this.loadingForm = false;
          this.loading_form_array = [];
        }
      });
  }
  getServices(connection_type?, zone?, change?) {
    this.loadingForm = true;
    this.loading_form_array[5] = true;
    this.apiConnectionPoint
      .getLogisticServices(connection_type, zone)
      .subscribe({
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
      })
      .add(() => {
        this.selectedServices = this.service;
        if (change) {
          this.selectedServices = [];
        }
        this.loading_form_array[5] = false;
        if (this.loading_form_array.includes(true) == false) {
          this.loadingForm = false;
          this.loading_form_array = [];
        }
      });
  }

  onAfterEdit({ detail }) {
    let existError;
    let array;
    this.eventTimes.push("Called");
    this.validateCapacity = true;
    this.errorsContract = [];

    if (this.eventTimes.length == 1) {
      if (this.validateRevogridView == true) {
        if (detail.model !== undefined) {
          const arrayObject = [];
          const object = {};
          object["nom_contract"] = detail.prop.split("_")[2];
          // object["nom_contract"] = '0300184281';
          // object["nom_contract"] = detail.prop.replace("SCHED_CAP_",'');
          object["nom_date"] = detail.model.DATE;
          object["nom_value"] = Number(
            detail.val.toString().replace(/\./g, "").replace(",", ".")
          );
          arrayObject.push(object);

          this.apiNomination
            .addNominationOperations(
              this.balanceZone,
              this.connection_point,
              this.currentTabId,
              this.legalEntity,
              this.granularity,
              this.nomination_type,
              arrayObject
            )
            .subscribe({
              next: (res) => {
                this.getNomination(
                  this.balanceZone,
                  this.connection_point,
                  this.service,
                  this.legalEntity,
                  this.start_date,
                  this.end_date,
                  this.granularity,
                  this.compareTSO,
                  this.nomination_type,
                  this.currentTabOriginal
                );
                this.messageService.showToast(
                  "success",
                  "Success",
                  "Nomination updated successfully in the SLG!"
                );
              },
              error: (e) => {
                if (e.error.title == "Internal Server Error") {
                  this.messageService.showToast(
                    "danger",
                    "Error",
                    "Internal server error while adding operations"
                  );
                } else {
                  this.messageService.showToast("danger", "Error", e.error);
                }
              },
            });
        } else if (detail.models !== undefined) {
          const arrayObject = [];
          let exist;

          for (const data in detail.data) {
            for (const prop in Object.keys(detail.data[data])) {
              const object = {};
              object["nom_contract"] = Object.keys(detail.data[data])[
                prop
              ].split("_")[2];
              object["nom_value"] = Number(
                Object.values(detail.data[data])
                  [prop].toString()
                  .replace(/\./g, "")
                  .replace(",", ".")
              );
              (object["nom_date"] = detail.models[data].DATE), "yyyy-MM-dd";
              arrayObject.push(object);
            }
          }

          if (arrayObject.length > 0) {
            this.apiNomination
              .addNominationOperations(
                this.balanceZone,
                this.connection_point,
                this.currentTabId,
                this.legalEntity,
                this.granularity,
                this.nomination_type,
                arrayObject
              )
              .subscribe({
                next: (res) => {
                  this.getNomination(
                    this.balanceZone,
                    this.connection_point,
                    this.service,
                    this.legalEntity,
                    this.start_date,
                    this.end_date,
                    this.granularity,
                    this.compareTSO,
                    this.nomination_type,
                    this.currentTabOriginal
                  );
                  this.messageService.showToast(
                    "success",
                    "Success",
                    "Nomination updated successfully in the SLG!"
                  );
                },
                error: (e) => {
                  if (e.error.title == "Internal Server Error") {
                    this.messageService.showToast(
                      "danger",
                      "Error",
                      "Internal server error while adding operations"
                    );
                  } else {
                    this.messageService.showToast("danger", "Error", e.error);
                  }
                },
              });
          }
        }
      }
    } else {
      this.eventTimes = [];
    }
  }
  onChangeLogisticElementType($event) {
    this.selectedServices = [];
    if (this.nominationForm.get("balancing_zone").value) {
      this.getConnectionPoints(
        this.nominationForm.get("connection_type").value,
        this.nominationForm.get("balancing_zone").value
      );
    }
    this.getServices(
      this.nominationForm.get("connection_type").value,
      this.nominationForm.get("balancing_zone").value,
      "change"
    );
    this.logisticElementOptions = [];
    this.nominationForm.controls["connection_point"].setValue("");
  }
  onChangeBalanceZone($event) {
    this.logisticElementOptions = [];
    this.nominationForm.get("service").setValue([]);
    this.selectedServices = [];
    if (this.nominationForm.get("connection_type").value) {
      this.getConnectionPoints(
        this.nominationForm.get("connection_type").value,
        this.nominationForm.get("balancing_zone").value
      );
    }
    if (this.nominationForm.get("nominationType").value && this.nominationForm.get("nominationType").value=='intradaily') {
      this.getTimeZone($event);
    }
  }
  onChangeGranularity($event) {
    /*   if ($event == "hourly") {
      this.nominationTypeOptions = [
        { id: "d", label: "D" },
        { id: "d-1", label: "D-1" },
      ];
    } else {
      this.nominationTypeOptions = [{ id: "d-1", label: "D-1" }];
    } */
  }
  onChangeNominationType($event) {
    this.nominationForm.get("granularity").setValue("");
    this.errorDateForward = false;
    if ($event == "intradaily") {
      this.nominationForm.get("date").setValue({
        start: new Date(),
        end: new Date(),
      });
      this.nominationForm.get("date").disable();

      this.granularityOptions = [{ id: "hourly", label: "Hourly" }];
      if (this.nominationForm.get("balancing_zone").value) {
        this.getTimeZone(this.nominationForm.get("balancing_zone").value);
      }
    } else {
      this.nominationForm.get("date").enable();
      this.nominationForm.get("date").setValue("");
      this.granularityOptions = [
        { id: "hourly", label: "Hourly" },
        { id: "daily", label: "Daily" },
      ];
      this.getGranularityByService(
        this.nominationForm.get("service").value,
        this.nominationForm.get("balancing_zone").value,
        true
      );
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
    this.validateCapacity = true;
    this.validateRevogridView = true;
    this.errorsContract = [];
    this.eventTimes = [];
    if (detail.model !== undefined) {
     /*  var contract = detail.prop.split("SCHED_CAP_")[1].split(/_(.*)/s)[1];
      var val_capacity = Number(
        detail.model["TOTAL_CAP_" + detail.prop.split("SCHED_CAP_")[1]]
          .toString()
          .replace(/\./g, "")
          .replace(",", ".")
      ); */

      if (
        /^[+]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/.test(
          detail.val
        ) == false
      ) {
        this.validateRevogridView = false;
        e.preventDefault();
      }else {
        detail.val = this.numeral(
          Number(detail.val.toString().replace(/\./g, "").replace(",", "."))
        ).format("0,0.[0000000000]");
      }
   /*    if (Number(val_capacity) == 0) {
        // this.errorsContract = [contract];
        this.validateCapacity = false;
        e.preventDefault();
      } */
      /*  if (
        Number(detail.val.toString().replace(/\./g, "").replace(",", ".")) >
        Number(val_capacity)
      ) {
        this.errorsContract = [contract];
        this.validateCapacity = false;
       // e.preventDefault();
      }
      this.errorsString = this.errorsContract.toString(); */
    }
  }
  onBeforeRangeEdit(e, { detail }) {
    this.errorsContract = [];
    this.validateCapacity = true;
    this.validateRevogridView = true;

    if (detail.models !== undefined) {
      for (const data in detail.data) {
        for (const prop in Object.keys(detail.data[data])) {
          var value = Object.values(detail.data[data])[prop].toString();
/* 
          var contract = Object.keys(detail.data[data])
            [prop].split("SCHED_CAP_")[1]
            .split(/_(.*)/s)[1]; */
      /*     var contract_label = Object.keys(detail.data[data])[prop].split(
            "SCHED_CAP_"
          )[1]; */

      /*     var value2 = Number(
            detail.models[data]["TOTAL_CAP_" + contract_label]
              .toString()
              .replace(/\./g, "")
              .replace(",", ".")
          ); */

          if (
            /^[+]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/.test(
              value
            ) == false
          ) {
            this.validateRevogridView = false;
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

          /*   if (value > value2) {
            this.validateCapacity = false;
           // e.preventDefault();
            this.errorsContract.push(contract);
          } */
        }
      }
      /* this.uniqByObject(this.errorsContract);
      this.errorsContract = this.uniqByObject(this.errorsContract);
      this.errorsString = this.errorsContract.toString().replace(",", ", ");*/
    }
  }
  uniqByObject<T>(array: T[]) {
    const result: T[] = [];
    for (const item of array) {
      if (!result.includes(item)) {
        result.push(item);
      }
    }
    return result;
  }
  reset() {
    this.cancelAllRequests();
    this.nominationForm.controls["country_code"].setValue("");
    this.nominationForm.controls["connection_point"].setValue("");
    this.nominationForm.controls["connection_type"].setValue("");
    this.nominationForm.controls["balancing_zone"].setValue("");
    this.nominationForm.controls["legal_entity"].setValue("");
    this.nominationForm.controls["service"].setValue([]);
    this.nominationForm.controls["date"].setValue("");
    this.nominationForm.controls["granularity"].setValue("");
    this.nominationForm.controls["nominationType"].setValue("");
    this.zoneOptions = [];
    this.serviceOptions = [];
    this.logisticElementOptions = [];
    localStorage.setItem("country_no", "");
    localStorage.setItem("balance_zone_no", "");
    localStorage.setItem("entity_no", "");
    localStorage.setItem("service_array_no", "");
    localStorage.setItem("connection_point_no", "");
    localStorage.setItem("connection_point_type_no", "");
    localStorage.setItem("start_date_no", "");
    localStorage.setItem("end_date_no", "");
    localStorage.setItem("granularity", "");
    localStorage.setItem("nomination_type", "");
    this.selectedServices = [];
    this.dataView = null;
    this.currentTabId = null;
    this.services_differences = null;
    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.nominationForm.get("country_code").setValue(object["country_code"]);
      this.nominationForm
        .get("balancing_zone")
        .setValue(object["balancing_zone"]);
      this.getbalanceZones(object["country_code"]);
    }
  }
  exportAsXML() {
    if (this.nomination_type == "intradaily" && this.granularity == "hourly") {
      this.dialogService.open(DialogExportSchedulingComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Export to XML",
          balanceZone: this.balanceZone,
          legalEntity: this.legalEntity,
          connection_point: this.connection_point,
          start_date: this.start_date,
          end_date: this.end_date,
          service: this.currentTabId,
          granularity: "daily",
          dates: this.dates,
        },
        autoFocus: false,
      });
    } else {
      this.apiNomination
        .getFileNominationsTSO(
          this.balanceZone,
          this.legalEntity,
          this.connection_point,
          this.start_date,
          this.end_date,
          "XML",
          this.currentTabId,
          this.granularity
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
  }
  exportAsXLSX(option) {
    if (this.nomination_type == "intradaily" && this.granularity == "hourly") {
      this.dialogService.open(DialogExportSchedulingComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Export to XLS",
          balanceZone: this.balanceZone,
          legalEntity: this.legalEntity,
          connection_point: this.connection_point,
          start_date: this.start_date,
          end_date: this.end_date,
          service: this.currentTabId,
          granularity: "daily",
          option: option,
          dates: this.dates,
        },
        autoFocus: false,
      });
    } else {
      if (option == "current") {
        this.apiNomination
          .getFileNominationsTSO(
            this.balanceZone,
            this.legalEntity,
            this.connection_point,
            this.start_date,
            this.end_date,
            "XLS",
            this.currentTabId,
            this.granularity
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
      } else if (option == "all") {
        this.apiNomination
          .getFileNominationsTSO(
            this.balanceZone,
            this.legalEntity,
            this.connection_point,
            this.start_date,
            this.end_date,
            "XLS",
            null,
            this.granularity
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
  }
  submit(option) {
    const titleMessage = option === 'all' 
    ? `Submitting ${option} service` 
    : `Submitting ${option} services`;
    this.dialogService
      .open(DialogConfirmationComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          body: "Are you sure you want to proceed?",
          title: titleMessage,
          button: "Submit",
          status_cancel: "basic",
          status_confirm: "success",
        },
        autoFocus: false,
      })
      .onClose.subscribe((confirmed) => {
      if (confirmed) {
        if (this.nomination_type == "intradaily" && this.granularity == "hourly") {
          this.dialogService.open(DialogExportSchedulingComponent, {
            closeOnEsc: false,
            closeOnBackdropClick: false,
            context: {
              title: "Submit to TSO",
              balanceZone: this.balanceZone,
              legalEntity: this.legalEntity,
              connection_point: this.connection_point,
              start_date: this.start_date,
              end_date: this.end_date,
              service: this.currentTabId,
              granularity: "daily",
              dates: this.dates,
            },
            autoFocus: false,
          });
        } else {
          if (option == "current") {
            this.loadingViewNomination = true;
            this.apiNomination
              .submitNominationsToTSO(
                this.balanceZone,
                this.legalEntity,
                this.connection_point,
                this.start_date,
                this.end_date,
                this.currentTabId,
                "daily"
              )
              .subscribe({
                next: (res) => {
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
                      "Internal server error while export submit nominations"
                    );
                  } else {
                    this.messageService.showToast("danger", "Error", e.error);
                  }
                },
              }).add(()=>{
                this.loadingViewNomination=false;
              });;
          } else if (option == "all") {
            this.loadingViewNomination = true;
            this.apiNomination
              .submitNominationsToTSO(
                this.balanceZone,
                this.legalEntity,
                this.connection_point,
                this.start_date,
                this.end_date,
                null,
                "daily"
              )
              .subscribe({
                next: (res) => {
                  this.messageService.showToast(
                    "primary",
                    "Message from TSO",
                    res["msg"]
                  );
                  this.loadingViewNomination = false;
                },
                error: (e) => {
                  this.loadingViewNomination = false;
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
              }).add(()=>{
                this.loadingViewNomination=false;
              });;
          }
        }
      }
    });
  }

  OnViewPortScroll({ detail }) {
    if (detail.dimension == "rgRow") {
      localStorage.setItem("rgRow_no", detail.coordinate);
    }
    if (detail.dimension == "rgCol") {
      localStorage.setItem("rgCol_no", detail.coordinate);
    }
  }
  getTimeZone(zone) {
    this.apiBalanceZone
      .getBalanceZone(zone)
      .subscribe({
        next: (res) => {
          this.timeZone = res.timezone;
          this.start_time = res.day_start_time;
        },
        error: (e) => {
          this.loadingViewNomination = false;
          if (e.error?.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting time zone"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        var day_balance_zone = new Date(
          new Date().toLocaleString("en-US", { timeZone: this.timeZone })
        );
        var end_day_balance_zone = this.datepipe.transform(
          day_balance_zone,
          "yyyy-MM-dd"
        );
        var previous_day_balance_zone = new Date(
          day_balance_zone.getTime()
        ).setDate(day_balance_zone.getDate() - 1);
        var end_day_balance_zone_temp = new Date(
          Number(end_day_balance_zone.split("-")[0]),
          Number(end_day_balance_zone.split("-")[1]) - 1,
          Number(end_day_balance_zone.split("-")[2]),
          Number(this.start_time.split(":")[0]),
          Number(this.start_time.split(":")[1])
        );

        if (day_balance_zone.valueOf() < end_day_balance_zone_temp.valueOf()) {
          this.nominationForm.get("date").setValue({
            start: previous_day_balance_zone,
            end: previous_day_balance_zone,
          });
        } else {
          this.nominationForm.get("date").setValue({
            start: day_balance_zone,
            end: day_balance_zone,
          });
        }
      });
  }
  getGranularityByService(services, balanceZone, change?) {
    if (
      (this.nominationForm.get("nominationType").value == "forward" ||
        this.nominationForm.get("nominationType").value == "comparison") &&
      this.nominationForm.get("service").value.length > 0
    ) {
      this.granularityOptions = [];
      if (change) {
        this.nominationForm.get("granularity").setValue("");
      }

      this.apiContract
        .getLogisticServicesGranularity(services, balanceZone)
        .subscribe({
          next: (res) => {
            res["granularity_options"].map((x) => {
         
                this.granularityOptions.push({
                  id: x.toString().toLowerCase(),
                  label:
                    x.toString().toLowerCase().charAt(0).toUpperCase() +
                    x.toString().toLowerCase().slice(1),
                });
        
            
              return x;
            });
            const ids = this.granularityOptions.map(({ id }) => id);
            const filtered = this.granularityOptions.filter(({ id }, index) =>
                !ids.includes(id, index + 1));
            this.granularityOptions=[];
            this.granularityOptions=filtered;
            if (this.granularityOptions.length == 0) {
              this.errorGranularity = true;
            } else {
              this.errorGranularity = false;
            }
          },
          error: (e) => {
            this.loadingViewNomination = false;
            if (e.error?.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while getting granularity"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        });
    }
  }
  refresh() {
    var country = localStorage.getItem("country_no");
    var legalEntity = localStorage.getItem("entity_no");
    var balanceZone = localStorage.getItem("balance_zone_no");
    var connection_point_type = localStorage.getItem(
      "connection_point_type_no"
    );
    var connection_point = localStorage.getItem("connection_point_no");
    var service;
    if (localStorage.getItem("service_array_no")) {
      service = JSON.parse(localStorage.getItem("service_array_no"));
    }
    var start_date = this.datepipe.transform(
      localStorage.getItem("start_date_no"),
      "yyyy-MM-dd"
    );
    var end_date = this.datepipe.transform(
      localStorage.getItem("end_date_no"),
      "yyyy-MM-dd"
    );
    var granularity = localStorage.getItem("granularity");
    var nomination_type = localStorage.getItem("nomination_type");
    var currentTab = localStorage.getItem("currenTab_no");

    if (
      country &&
      balanceZone &&
      connection_point_type &&
      legalEntity &&
      connection_point &&
      service.length > 0 &&
      granularity &&
      nomination_type
    ) {
      this.loadingViewNomination = true;
      this.getNomination(
        balanceZone,
        connection_point,
        service,
        legalEntity,
        start_date,
        end_date,
        granularity,
        this.compareTSO,
        nomination_type,
        currentTab
      );
    }
  }
  submitToETRM(){
    this.loadingViewNomination = true;
    if (this.nomination_type == "intradaily" && this.granularity == "hourly") {
      this.dialogService.open(DialogExportSchedulingComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Submit to ETRM",
          balanceZone: this.balanceZone,
          legalEntity: this.legalEntity,
          connection_point: this.connection_point,
          start_date: this.start_date,
          end_date: this.end_date,
          service: this.currentTabId,
          granularity: "daily",
          dates: this.dates,
        },
        autoFocus: false,
      });
    } else {
   

        this.jobService.submitLogisticOperations(
            this.balanceZone,
            this.legalEntity,
            this.connection_point,
            this.start_date,
            this.end_date,
            this.currentTabId,
            "daily"
          )
          .subscribe({
            next: (res) => {
              if(res["failed_submissions"].length != 0){
                var contracts = [];
                res["failed_submissions"].map((x) => {
                  contracts.push(x["contract"]);
                });
                this.messageService.showToast(
                  "primary",
                  "Message from ETRM",
                  res["message"] + ", as follows: "+ contracts.toString().replaceAll(",",", ")
                );
              } else {
                this.messageService.showToast(
                  "primary",
                  "Message from ETRM",
                  res["message"]
                );
              }
            
         
            },
            error: (e) => {
          
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
          }).add(()=>{
            this.loadingViewNomination=false;
          });;
      
    }
  }
  ngOnDestroy(){
    this.cancelAllRequests();
  }
}
