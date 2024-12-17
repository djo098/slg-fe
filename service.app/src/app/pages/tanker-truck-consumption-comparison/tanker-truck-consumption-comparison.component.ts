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
import { Observable } from "rxjs";
import { TankerTrucksService } from "../../@core/services/tankerTrucks.service";

@Component({
  selector: 'ngx-tanker-truck-consumption-comparison',
  templateUrl: './tanker-truck-consumption-comparison.component.html',
  styleUrls: ['./tanker-truck-consumption-comparison.component.scss']
})
export class TankerTruckConsumptionComparisonComponent implements OnInit {

  @ViewChild("tabset") tabsetEl: NbTabsetComponent;
  @ViewChild("generateBalance", { static: true }) accordion;

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
  layoutOptions: any;
  loading = false;
  data: any;
  data1: any;
  optionsss: any;
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
  errors = [];
  min: Date;
  max: Date;
  validateRevogrid: boolean;
  validateRevogrid_array = [];

  constructor(
    private messageService: messageService,
    private apiBalanceZone: BalanceZoneService,
    private apiBalance: BalanceService,
    private elRef: ElementRef,
    private formBuilder: FormBuilder,
    private apiCountry: CountryService,
    private apiLegalEntity: LegalEntityService,
    private excelService: ExcelService,
    public datepipe: DatePipe,
    private apiTankerTruck: TankerTrucksService,
    protected dateService: NbDateService<Date>
  ) {
    this.getcountries();
    this.min = new Date("2010-01-01");
    this.max = new Date("2022-01-01");
    this.getLegalEntities();
    /*  const numeral = NumberColumnType.getNumeralInstance();
    numeral.register("locale", "es", {
      delimiters: {
        thousands: ".",
        decimal: ",",
      },
      abbreviations: {
        thousand: "k",
        million: "m",
        billion: "b",
        trillion: "t",
      },
      ordinal: function (number) {
        return number === 1 ? "er" : "er";
      },
      currency: {
        symbol: "€",
      },
    });
    numeral.locale("es"); */
  }

  ngOnInit(): void {
    this.dateService.getFirstDayOfWeek();
    this.accordion.toggle();

    this.balanceForm = this.formBuilder.group({
      date: new FormControl("", [Validators.required, this.dateRangeValidator]),
      balancing_zone: new FormControl("", [Validators.required]),
      legal_entity: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      layout: new FormControl(""),
    });
    this.country = localStorage.getItem("country_tanker_truck");
    this.balanceZone = localStorage.getItem("balance_zone_tanker_truck");
    this.entity = localStorage.getItem("entity_tanker_truck");
    this.currentTab = localStorage.getItem("currenTab_tanker_truck");
    this.start_date = localStorage.getItem("start_date_tanker_truck");
    this.end_date = localStorage.getItem("end_date_tanker_truck");

    if (
      this.country &&
      this.balanceZone &&
      this.entity &&
      this.start_date &&
      this.end_date
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
      var object = localStorage.getItem('settings_parameters');
      if(object ){
        object= JSON.parse(localStorage.getItem('settings_parameters'));
        this.balanceForm.get('country_code').setValue(object['country_code']);
        this.getbalanceZones(object['country_code']);
        this.balanceForm.get('balancing_zone').setValue(object['balancing_zone']);
   
        this.getLayouts(object['balancing_zone']);
      }
    }
    numeral.locale("es");
    if (
      this.country &&
      this.balanceZone &&
      this.entity &&
      this.start_date &&
      this.end_date
    ) {
      this.calculate(this.currentTab);
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

  getComparison(
    balancing_zone,
    start_date,
    end_date,
    legal_entity,
    currenTab?,
    layout?
  ) {
    const numeral = NumberColumnType.getNumeralInstance();
    numeral.locale("es");
    this.apiTankerTruck
      .getBalanceUnloadsComparison(start_date, end_date, legal_entity, balancing_zone)
      .pipe(
        map((data) => {

          localStorage.setItem(
            "rgRow_tanker_truck_new",
            localStorage.getItem("rgRow_tanker_truck")
          );
          localStorage.setItem(
            "rgCol_tanker_truck_new",
            localStorage.getItem("rgCol_tanker_truck")
          );
          
          data["errors"].map((x) => {
            this.errors.push(
              Object.keys(x).toString().replace("Error: ", "")
            );
          });
          this.errors
            .toString()
            .replaceAll(",", ", ");
          return data["data"].map((x, index) => {
          index == 0
            ? (x["isActive"] = true)
            : (x["isActive"] = false);
      
          localStorage.setItem("currenTab_tanker_truck", this.currentTabOriginal);
            x["rows"]?.map((e, index) => {
              var keys = Object.keys(e);
              for (let i in keys) {
                if (keys[i] != "DATE") {
                  e[keys[i]] = numeral(Number(e[keys[i]].toFixed(2))).format(
                    "0,0.[0000]"
                  );
                }
              }
            });

            x["columns"]?.map((j) => {
              j["sortable"] = true;

              if (j["prop"] == "DATE") {
                j["size"] = 160;

                j["pin"] = "colPinStart";

                j["columnType"] = "string";
              } else {
                j["size"] = 200;
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

                if (c["prop"] == "DATE") {
                  c["size"] = 100;
  
                  c["pin"] = "colPinStart";
  
                  c["columnType"] = "string";
                } else {
                  c["size"] = 200;
                  c["columnType"] = "numeric";
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
          this.data = res;
;
        },
        error: (e) => {
          this.data = null;
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
            isNaN(Number(localStorage.getItem("rgCol_tanker_truck_new")))==false &&
            isNaN(Number(localStorage.getItem("rgRow_tanker_truck_new")))==false
          ) {
            document.querySelectorAll("revo-grid").forEach((element) =>
              element.scrollToCoordinate({
                x: Number(localStorage.getItem("rgCol_tanker_truck_new")),
                y: Number(localStorage.getItem("rgRow_tanker_truck_new")),
              })
            );
          }
        }, 100);
        this.loading = false;
      });
  }

  calculate(currenTab?, first?) {
    this.loading = true;
    this.validateRevogrid = true;
    if (first) {
      localStorage.setItem("rgRow_tanker_truck", "");
      localStorage.setItem("rgRow_tanker_truck_new", "");
      localStorage.setItem("rgCol_tanker_truck", "");
      localStorage.setItem("rgCol_tanker_truck_new", "");
      localStorage.setItem("currenTab_tanker_truck", "");
      this.currentTab = null;
    }

    this.country = this.balanceForm.get("country_code").value;
    this.balanceZone = this.balanceForm.get("balancing_zone").value;
    this.entity = this.balanceForm.get("legal_entity").value;
    this.layout = this.balanceForm.get("layout").value;
    if (isNaN(Number(this.layout)) || this.layout == "") {
      this.layout = null;
    }

    this.start_date = this.datepipe.transform(
      this.balanceForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.balanceForm.get("date").value.end,
      "yyyy-MM-dd"
    );

    this.getComparison(
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
    localStorage.setItem("country_tanker_truck", this.country);
    localStorage.setItem("balance_zone_tanker_truck", this.balanceZone);
    localStorage.setItem("entity_tanker_truck", this.entity);
    localStorage.setItem("start_date_tanker_truck", this.start_date);
    localStorage.setItem("end_date_tanker_truck", this.end_date);
    localStorage.setItem("layout_tanker_truck", this.layout);
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
  getLayouts(zone) {
    this.apiBalance.getBalanceLayoutConfiguration().subscribe({
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
                'forecasted_and_real_unloading_comparison' + "_" + this.start_date + "_" + this.end_date,
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
    localStorage.setItem("currenTab_tanker_trucl", this.currentTabOriginal);
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
;
          this.apiBalance
            .addBalanceOperations(this.balanceZone, this.entity, arrayObject)
            .subscribe({
              next: (res) => {
                this.loading = true;
                this.getComparison(
                  this.balanceZone,
                  this.start_date,
                  this.end_date,
                  this.entity,
                  this.currentTabOriginal
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
                this.getComparison(
                  this.balanceZone,
                  this.start_date,
                  this.end_date,
                  this.entity,
                  this.currentTabOriginal
                );
              },
            });
        } else if (detail.models !== undefined) {
          const arrayObject = [];
;
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
;
          this.apiBalance
            .addBalanceOperations(this.balanceZone, this.entity, arrayObject)
            .subscribe({
              next: (res) => {
                this.loading = true;
                this.getComparison(
                  this.balanceZone,
                  this.start_date,
                  this.end_date,
                  this.entity,
                  this.currentTabOriginal
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
                this.getComparison(
                  this.balanceZone,
                  this.start_date,
                  this.end_date,
                  this.entity,
                  this.currentTabOriginal
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
        isNaN(
          Number(detail.val.toString().replace(/\./g, "").replace(",", "."))
        ) ||
        Number(detail.val.toString().replace(/\./g, "").replace(",", ".")) < 0
      ) {
        this.validateRevogrid = false;
        e.preventDefault();
      }
    }
  }
  onBeforeRangeEdit(e, { detail }) {
    this.validateRevogrid = true;
    const numeral = NumberColumnType.getNumeralInstance();
    numeral.locale("en");

    if (detail.models !== undefined) {
      for (const data in detail.data) {
        for (const prop in Object.keys(detail.data[data])) {
          var value = Number(
            Object.values(detail.data[data])
              [prop].toString()
              .replace(/\./g, "")
              .replace(",", ".")
          );

          if (isNaN(Number(value)) || Number(value) < 0) {
            this.validateRevogrid = false;
            e.preventDefault();
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
    this.entitiesOptions = [];
    localStorage.setItem("country_tanker_truck", "");
    localStorage.setItem("balance_zone_tanker_truck", "");
    localStorage.setItem("entity_tanker_truck", "");
    localStorage.setItem("start_date_tanker_truck", "");
    localStorage.setItem("end_date_tanker_truck", "");
    this.data = null;

    var object = localStorage.getItem('settings_parameters');
    if(object){
      object= JSON.parse(localStorage.getItem('settings_parameters'));
      this.balanceForm.get('country_code').setValue(object['country_code']);
      this.balanceForm.get('balancing_zone').setValue(object['balancing_zone']);
      this.getbalanceZones(object['country_code']);
      this.getLayouts(object['balancing_zone']);
 
    }
    
  }
  exportAsXLSX() {
    this.excelService.exportAsExcelFile(
      this.data,
      "forecasted_and_real_unloading_comparison_" + this.start_date + "_" + this.end_date
    );
  }
  OnViewPortScroll({ detail }) {
    if (detail.dimension == "rgRow") {
      localStorage.setItem("rgRow_ba", detail.coordinate);
    }
    if (detail.dimension == "rgCol") {
      localStorage.setItem("rgCol_ba", detail.coordinate);
    }
  }
  refresh(){
 
    var country = localStorage.getItem("country_tanker_truck");
    var legalEntity = localStorage.getItem("entity_tanker_truck");
    var balanceZone = localStorage.getItem("balance_zone_tanker_truck");



    var start_date = this.datepipe.transform(
      localStorage.getItem("start_date_tanker_truck"),
      "yyyy-MM-dd"
    );
    var end_date =  this.datepipe.transform(
      localStorage.getItem("end_date_tanker_truck"),
      "yyyy-MM-dd"
    );
  

    if (
      country &&
      balanceZone &&
      legalEntity &&
      start_date &&
      end_date


    ) {
      this.loading= true;
    
      this.getComparison(balanceZone,start_date,end_date,legalEntity)
    }

   
  }
}
