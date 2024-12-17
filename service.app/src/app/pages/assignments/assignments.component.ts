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
import { NbAccessChecker } from "@nebular/security";
import { DarkModeService } from "../../@core/services/sharedServices/darkMode.service";

@Component({
  selector: "ngx-assignments",
  templateUrl: "./assignments.component.html",
  styleUrls: ["./assignments.component.scss"],
})
export class AssignmentsComponent implements OnInit {
  @ViewChild("tabset") tabsetEl: NbTabsetComponent;
  @ViewChild("generateassignment", { static: true })
  accordionGenerateassignment;
  toggleNgModel = false;

  /*   @ViewChild("assignmentView", { static: true }) accordionassignmentView;
  @ViewChild("assignmentComparison", { static: true })
  accordionassignmentComparison; */

  /* canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    return false
  } */

  zoneOptions: any;
  regasificationPlant: any;
  countriesOptions: any;
  entitiesOptions: any;
  loadingViewassignment = false;
  loadingComparisonassignment = false;
  loadingComparison = false;
  dataView: any;
  data1: any;
  optionsss: any;
  neededArray = [];
  assignmentForm!: FormGroup;
  exportForm!: FormGroup;
  grid: any;
  currentTab: string;
  currentTabOriginal: string;
  errorBalanceZone: any;
  errorLegalEntity: any;
  errorDate = false;
  indexRow: any;
  plugin: any;
  country: any;
  balanceZone: any;
  start_date: any;
  end_date: any;
  legalEntity: any;
  service: any;
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
  currentTabId: any;
  min: Date;
  max: Date;
  validateRevogridComparison: boolean;
  validateRevogridView: boolean;
  validateRevogrid_array = [];
  errorsCompare = "";
  numeral = NumberColumnType.getNumeralInstance();
  compareTSO = false;
  items = [{ title: "CSV" }, { title: "XML" }];
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
  readonly: boolean;
  revogridTheme: string;
  eventTimes1 = [];
  protected subscriptions: Subscription[] = [];
  constructor(
    private messageService: messageService,
    private apiBalanceZone: BalanceZoneService,
    private apiAssignment: NominationsService,
    private elRef: ElementRef,
    private formBuilder: FormBuilder,
    private apiCountry: CountryService,
    private apiLegalEntity: LegalEntityService,
    private excelService: ExcelService,
    public datepipe: DatePipe,
    protected dateService: NbDateService<Date>,
    private apiConnectionPoint: ConnectionPointService,
    private nbMenuService: NbMenuService,
    public accessChecker: NbAccessChecker,
    private darkModeService: DarkModeService
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
    .isGranted("create", "assignments")
    .subscribe((granted) => (this.readonly = !granted));
    this.dateService.getFirstDayOfWeek();
    this.accordionGenerateassignment.toggle();
    this.exportForm = this.formBuilder.group({
      extension: new FormControl("", [Validators.required]),
    });
    this.assignmentForm = this.formBuilder.group({
      date: new FormControl("", [Validators.required, this.dateRangeValidator]),
      balancing_zone: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      connection_type: new FormControl("", [Validators.required]),
      connection_point: new FormControl("", [Validators.required]),
      service: new FormControl("", [Validators.required]),
      legal_entity: new FormControl("", [Validators.required]),
    });
    this.country = localStorage.getItem("country_as");
    this.legalEntity = localStorage.getItem("entity_as");
    this.balanceZone = localStorage.getItem("balance_zone_as");
    this.connection_point_type = localStorage.getItem(
      "connection_point_type_as"
    );
    this.connection_point = localStorage.getItem("connection_point_as");
    this.service = localStorage.getItem("service_as");
    this.start_date = localStorage.getItem("start_date_as");
    this.end_date = localStorage.getItem("end_date_as");
    if (
      this.country &&
      this.balanceZone &&
      this.connection_point_type &&
      this.legalEntity &&
      this.connection_point &&
      this.service
    ) {

      this.getbalanceZones(this.country);
      this.getConnectionPoints(this.connection_point_type, this.balanceZone);
      this.getServices(this.connection_point_type, this.balanceZone);
      this.assignmentForm.controls["country_code"].setValue(this.country);
      this.assignmentForm.controls["balancing_zone"].setValue(
        Number(this.balanceZone)
      );
      this.assignmentForm.controls["service"].setValue(Number(this.service));
      this.assignmentForm.controls["connection_point"].setValue(
        Number(this.connection_point)
      );
      this.assignmentForm.controls["connection_type"].setValue(
        this.connection_point_type
      );

      this.assignmentForm.controls["legal_entity"].setValue(
        Number(this.legalEntity)
      );
      this.assignmentForm.controls["date"].setValue({
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
      this.calculate(false);
    } else {
      var object = localStorage.getItem('settings_parameters')
      if(object){
        object= JSON.parse(localStorage.getItem('settings_parameters'));
        this.assignmentForm.get('country_code').setValue(object['country_code']);
        this.assignmentForm.get('balancing_zone').setValue(object['balancing_zone']);
        this.getbalanceZones(object['country_code']);

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
    const date = this.assignmentForm && this.assignmentForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.assignmentForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.assignmentForm.get("date").value.end,
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

  getAssignments(
    balancing_zone,
    connection_point,
    service,
    legal_entity,
    start_date,
    end_date,
    compare
  ) {
   
   const subscription = this.apiAssignment
      .getAssignments(
        balancing_zone,
        legal_entity,
        connection_point,
        service,
        start_date,
        end_date,
        compare
      )
      .pipe(
        map((data) => {

          if (
            localStorage.getItem("rgRow_as") &&
            localStorage.getItem("rgCol_as")
          ) {
            localStorage.setItem(
              "rgRow_as_new",
              localStorage.getItem("rgRow_as")
            );
            localStorage.setItem(
              "rgCol_as_new",
              localStorage.getItem("rgCol_as")
            );
          }

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
          this.errorsCompare = "";
          if (data["errors"] !== "") {
            this.errorsCompare = data["errors"]
              .toString()
              .replaceAll(",", ", ");
            this.errorsCompare = Array.from(
              new Set(this.errorsCompare.split(","))
            ).toString();
          }
          return data["data"].map((x, index) => {
            var errrosContractByService = [];

            x["rows"]?.map((e, index) => {
              var keys = Object.keys(e);
              for (let i in keys) {
                if (keys[i] != "DATE") {
                  e[keys[i]] = this.numeral(e[keys[i]]).format("0,0.[0000]");
                }
              }
            });

            x["columns"]?.map((j) => {
              j["sortable"] = true;

              if (j["name"] == "Date") {
                j["size"] = 130;
                if (this.granularity == "hourly") {
                  j["size"] = 160;
                }
                j["pin"] = "colPinStart";

                j["columnType"] = "string";
              } else if (j["filter"] == "string") {
                j["size"] = 160;
                j["columnType"] = "string";
              } else if (j["filter"] == "number") {
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

                  x["rows"]?.map((e, index) => {
                    if (
                      Number(
                        e["ASSIG_CAP_" + contract]
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
                      errrosContractByService.push(contract.split(/_(.*)/s)[1]);
                    }
                  });
                }
              });

              /*     if (j["prop"] == "AVBL_CAP") {
              j["cellTemplate"] = (createElement, props, rowIndex) => {
                if (
                  Number(
                    props.model["AVBL_CAP"]
                      .toString()
                      .replace(/\./g, "")
                      .replace(",", ".")
                  ) > 0
                ) {
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
                    props.model[props.prop]
                  );
                } else if (
                  Number(
                    props.model["AVBL_CAP"]
                      .toString()
                      .replace(/\./g, "")
                      .replace(",", ".")
                  ) < 0
                ) {
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
                    props.model[props.prop],
                  );
                } else if (
                  Number(
                    props.model["AVBL_CAP"]
                      .toString()
                      .replace(/\./g, "")
                      .replace(",", ".")
                  ) == 0
                ) {
                  return createElement(
                    "div",
                    {
                      style: {
                        background: "#F7D200",
                        color: "black",
                      },
                      class: {
                        bubble: true,
                      },
                    },
                    props.model[props.prop]
                  );
                }
              };
            } */
            });
            if (errrosContractByService.length == 0) {
            } else {
              x["errorsContracts"] = this.uniqByObject(errrosContractByService)
                .toString()
                .replaceAll(",", ", ");
            }
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
          if (e.error?.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting assignments"
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
            isNaN(Number(localStorage.getItem("rgCol_as_new")))==false &&
            isNaN(Number(localStorage.getItem("rgRow_as_new")))==false
          ) {
            document.querySelectorAll("revo-grid").forEach((element) =>
              element.scrollToCoordinate({
                x: Number(localStorage.getItem("rgCol_as_new")),
                y: Number(localStorage.getItem("rgRow_as_new")),
              })
            );
          }
        }, 100);
        this.loadingViewassignment = false;
      });
  }

  calculate(compare, first?) {
    if(this.subscriptions.length>0){
      this.cancelAllRequests();
    }
    this.validateRevogridView = true;
    this.validateCapacity = true;
    this.compareTSO = false;

    this.loadingViewassignment = true;
    if (first) {
      localStorage.setItem("rgRow_as", "");
      localStorage.setItem("rgRow_as_new", "");
      localStorage.setItem("rgCol_as", "");
      localStorage.setItem("rgCol_as_new", "");
    }
    this.country = this.assignmentForm.get("country_code").value;
    this.connection_point = this.assignmentForm.get("connection_point").value;
    this.connection_point_type =
      this.assignmentForm.get("connection_type").value;
    this.balanceZone = this.assignmentForm.get("balancing_zone").value;
    this.legalEntity = this.assignmentForm.get("legal_entity").value;
    this.start_date = this.datepipe.transform(
      this.assignmentForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.assignmentForm.get("date").value.end,
      "yyyy-MM-dd"
    );
    this.service = this.assignmentForm.get("service").value;

    localStorage.setItem("country_as", this.country);
    localStorage.setItem("balance_zone_as", this.balanceZone);
    localStorage.setItem("entity_as", this.legalEntity);
    localStorage.setItem("service_as", this.service);
    localStorage.setItem("connection_point_as", this.connection_point);
    localStorage.setItem(
      "connection_point_type_as",
      this.connection_point_type
    );
    localStorage.setItem("start_date_as", this.start_date);
    localStorage.setItem("end_date_as", this.end_date);
    localStorage.setItem("currenTab_no", this.currentTabOriginal);
    this.getAssignments(
      this.balanceZone,
      this.connection_point,
      this.service,
      this.legalEntity,
      this.start_date,
      this.end_date,
      compare
    );
  }

  getcountries() {
    this.loadingForm=true;
    this.loading_form_array[0]=true;
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
    }).add(() => {
      this.loading_form_array[0]=false;
        if(this.loading_form_array.includes(true)==false){
          this.loadingForm=false
          this.loading_form_array=[];
        }
      });
  }
  getLegalEntities() {
    this.loadingForm=true;
    this.loading_form_array[1]=true;
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
      }).add(() => {
        this.loading_form_array[1]=false;
          if(this.loading_form_array.includes(true)==false){
            this.loadingForm=false
            this.loading_form_array=[];
          }
        });
  }
  getbalanceZones(country) {
    this.loadingForm=true;
    this.loading_form_array[2]=true;
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
    }).add(() => {
      this.loading_form_array[2]=false;
        if(this.loading_form_array.includes(true)==false){
          this.loadingForm=false
          this.loading_form_array=[];
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
                filename: "assignment_" + this.currentTab,
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
  compare() {
    this.timestamp = new Date(
      new Date().toString().replace(/GMT.*$/, "GMT+0000")
    )
      .toISOString()
      .replace("Z", "")
      .replace("T", " ")
      .split(".")[0];
    this.calculate(true);
    this.compareTSO=true;
  }

  onChangeCountry($event) {
    this.assignmentForm.controls["balancing_zone"].setValue("");
    this.assignmentForm.controls["connection_point"].setValue("");
    this.logisticElementOptions = [];
    this.getbalanceZones(this.assignmentForm.get("country_code").value);

  }

  onChangeTab($event) {
    document
      .querySelectorAll("revo-grid")
      .forEach((element) => (element.resize = true));
    document
      .querySelectorAll("revo-grid")
      .forEach((element) => (element.autoSizeColumn = true));
    this.currentTabId = $event.tabId;
    this.currentTabOriginal = $event.tabTitle;
    this.currentTab = $event.tabTitle.replace(" ", "_").toLowerCase();
    localStorage.setItem("currenTab_no", this.currentTabOriginal);
  }
  getConnectionPointsTypes() {
    this.loadingForm=true;
    this.loading_form_array[3]=true;
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
    }).add(() => {
      this.loading_form_array[3]=false;
        if(this.loading_form_array.includes(true)==false){
          this.loadingForm=false
          this.loading_form_array=[];
        }
      });
  }
  getConnectionPoints(type, zone) {
    this.loadingForm=true;
    this.loading_form_array[4]=true;
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
      }).add(() => {
        this.loading_form_array[4]=false;
          if(this.loading_form_array.includes(true)==false){
            this.loadingForm=false
            this.loading_form_array=[];
          }
        });
  }
  getServices(connection_type?, zone?) {
    this.loadingForm=true;
    this.loading_form_array[5]=true;
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
    }).add(() => {
      this.loading_form_array[5]=false;
        if(this.loading_form_array.includes(true)==false){
          this.loadingForm=false
          this.loading_form_array=[];
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
      if (this.validateRevogridView == true && this.validateCapacity == true) {
        if (detail.model !== undefined) {
          const arrayObject = [];
          const object = {};
          object["nom_contract"] = detail.prop.split("_")[2];
          object["nom_date"] = detail.model.DATE;
          object["nom_value"] = Number(
            detail.val.toString().replace(/\./g, "").replace(",", ".")
          );
          arrayObject.push(object);

          this.apiAssignment
            .addNominationOperations(
              this.balanceZone,
              this.connection_point,
              this.service,
              this.legalEntity,
              "daily",
              "forward",
              arrayObject
            )
            .subscribe({
              next: (res) => {
                this.getAssignments(
                  this.balanceZone,
                  this.connection_point,
                  this.service,
                  this.legalEntity,
                  this.start_date,
                  this.end_date,
                  this.compareTSO
                );
                this.messageService.showToast(
                  "success",
                  "Success",
                  "Assignments updated successfully in the SLG!"
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
            this.apiAssignment
              .addNominationOperations(
                this.balanceZone,
                this.connection_point,
                this.service,
                this.legalEntity,       
                "daily",
                "forward",
                arrayObject
              )
              .subscribe({
                next: (res) => {
                  this.getAssignments(
                    this.balanceZone,
                    this.connection_point,
                    this.service,
                    this.legalEntity,
                    this.start_date,
                    this.end_date,
                    this.compareTSO
                  );
                  this.messageService.showToast(
                    "success",
                    "Success",
                    "Assignments updated successfully in the SLG!"
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
    this.getConnectionPoints(
      this.assignmentForm.get("connection_type").value,
      this.assignmentForm.get("balancing_zone").value
    );
    this.getServices(
      this.assignmentForm.get("connection_type").value,
      this.assignmentForm.get("balancing_zone").value
    );
    this.logisticElementOptions = [];
    this.assignmentForm.controls["connection_point"].setValue("");
    this.assignmentForm.controls["service"].setValue("");
  }
  onChangeBalanceZone($event) {
    this.logisticElementOptions = [];
    this.assignmentForm.controls["service"].setValue("");
    if (this.assignmentForm.get("connection_type").value) {
      this.getConnectionPoints(
        this.assignmentForm.get("connection_type").value,
        this.assignmentForm.get("balancing_zone").value
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
    /*   var contract = detail.prop.split("ASSIG_CAP_")[1].split(/_(.*)/s)[1];
      var val_capacity = Number(
        detail.model["TOTAL_CAP_" + detail.prop.split("ASSIG_CAP_")[1]]
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
      } else {
        detail.val = this.numeral(
          Number(detail.val.toString().replace(/\./g, "").replace(",", "."))
        ).format("0,0.[0000000000]");
      }
      /*  if (
        Number(detail.val.toString().replace(/\./g, "").replace(",", ".")) >
        Number(val_capacity)
      ) {
        this.errorsContract = [contract];
        this.validateCapacity = false;
        e.preventDefault();
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
          var value = 
            Object.values(detail.data[data])
              [prop].toString();

         /*  var contract = Object.keys(detail.data[data])
            [prop].split("ASSIG_CAP_")[1]
            .split(/_(.*)/s)[1];
          var contract_label = Object.keys(detail.data[data])[prop].split(
            "ASSIG_CAP_"
          )[1];

          var value2 = Number(
            detail.models[data]["TOTAL_CAP_" + contract_label]
              .toString()
              .replace(/\./g, "")
              .replace(",", ".")
          ); */

          if (/^[+]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/.test(
            value
          ) == false) {
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
            e.preventDefault();
            this.errorsContract.push(contract);
          } */
        }
      }
      /*    this.uniqByObject(this.errorsContract);
      this.errorsContract = this.uniqByObject(this.errorsContract);
      this.errorsString = this.errorsContract.toString().replace(",", ", "); */
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
    this.assignmentForm.controls["country_code"].setValue("");
    this.assignmentForm.controls["connection_point"].setValue("");
    this.assignmentForm.controls["connection_type"].setValue("");
    this.assignmentForm.controls["balancing_zone"].setValue("");
    this.assignmentForm.controls["legal_entity"].setValue("");
    this.assignmentForm.controls["service"].setValue("");
    this.assignmentForm.controls["date"].setValue("");
    this.zoneOptions = [];
    this.serviceOptions = [];
    this.logisticElementOptions = [];
    localStorage.setItem("country_as", "");
    localStorage.setItem("balance_zone_as", "");
    localStorage.setItem("entity_as", "");
    localStorage.setItem("service_no", "");
    localStorage.setItem("connection_point_as", "");
    localStorage.setItem("connection_point_type_as", "");
    localStorage.setItem("start_date_as", "");
    localStorage.setItem("end_date_as", "");
    this.dataView = null;
    var object = localStorage.getItem('settings_parameters');
    if(object){
      object= JSON.parse(localStorage.getItem('settings_parameters'));
      this.assignmentForm.get('country_code').setValue(object['country_code']);
      this.assignmentForm.get('balancing_zone').setValue(object['balancing_zone']);
      this.getbalanceZones(object['country_code']);

    }
  }
  exportAsXML() {
    this.apiAssignment
      .getFileAssignmentsTSO(
        this.balanceZone,
        this.legalEntity,
        this.connection_point,
        this.service,
        this.start_date,
        this.end_date,
        "XML"
      )
      .subscribe({
        next: (res) => {
          var xmltext = res.toString();
          var filename =
          "assignments_" +
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
              "Internal server error while export assignment to XML"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }
  exportAsXLSX() {
    this.apiAssignment
      .getFileAssignmentsTSO(
        this.balanceZone,
        this.legalEntity,
        this.connection_point,
        this.service,
        this.start_date,
        this.end_date,
        "XLS"
      )
      .subscribe({
        next: (res) => {
          this.excelService.exportAsExcelFileOld(
            res,
            "assignments_" +
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
              "Internal server error while export assignment to XLS"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }
  submit() {
    this.loadingViewassignment = true;
    this.apiAssignment
      .submitAssignmentsToTSO(
        this.balanceZone,
        this.legalEntity,
        this.connection_point,
        this.service,
        this.start_date,
        this.end_date
      )
      .subscribe({
        next: (res) => {
          this.messageService.showToast("primary", "Message from TSO", res["msg"]);
          this.loadingViewassignment = false;
        },
        error: (e) => {
          this.loadingViewassignment = false;
          if (e.error?.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while submit assignments"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }

  export() {
    var extension = this.exportForm.get("extension").value;
    if (extension == "csv") {
      this.exportAsCSV();
    } else if (extension == "xml") {
      this.exportAsXML();
    } else if (extension == "xlsx") {
      this.exportAsXLSX();
    }
    this.exportForm.controls["extension"].setValue("");
  }
  OnViewPortScroll({ detail }) {
    if (detail.dimension == "rgRow") {
      localStorage.setItem("rgRow_as", detail.coordinate);
    }
    if (detail.dimension == "rgCol") {
      localStorage.setItem("rgCol_as", detail.coordinate);
    }
  }
  refresh(){
    var country = localStorage.getItem("country_as");
    var legalEntity = localStorage.getItem("entity_as");
    var balanceZone = localStorage.getItem("balance_zone_as");
    var connection_point = localStorage.getItem("connection_point_as");


    var service = localStorage.getItem("service_as");

    var start_date = this.datepipe.transform(
      localStorage.getItem("start_date_as"),
      "yyyy-MM-dd"
    );
    var end_date =  this.datepipe.transform(
      localStorage.getItem("end_date_as"),
      "yyyy-MM-dd"
    );


    if (
      country &&
      balanceZone &&
      legalEntity &&
      connection_point &&
      service
    ) {

      this.loadingViewassignment = true;
      this.getAssignments(balanceZone,connection_point,service,legalEntity,start_date,end_date,this.compareTSO)
    }

   
  }
  ngOnDestroy(){
    this.cancelAllRequests();
  }
}
