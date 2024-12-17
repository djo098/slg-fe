import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import * as moment from "moment";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { messageService } from "../../@core/utils/messages";
import { CountryService } from "../../@core/services/country.service";
import { LegalEntityService } from "../../@core/services/legalEntity.service";
import { BalanceZoneService } from "../../@core/services/balanceZone.service";
import { Subscription } from "rxjs";
import { ThirdPartyContractsService } from "../../@core/services/thirdPartyContracts.service";
import { map } from "rxjs/operators";
import { NbAccessChecker } from "@nebular/security";
import { DarkModeService } from "../../@core/services/sharedServices/darkMode.service";
@Component({
  selector: "slg-physical-contracts-comparison",
  templateUrl: "./physical-contracts-comparison.component.html",
  styleUrls: ["./physical-contracts-comparison.component.scss"],
})
export class PhysicalContractsComparisonComponent implements OnInit {
  @ViewChild("generateComparison", { static: true }) accordion;
  numeral = NumberColumnType.getNumeralInstance();
  comparisonForm!: FormGroup;
  errorDate = false;
  errorBalanceZone = false;
  loading = false;
  loadingForm = false;
  loading_form_array = [];
  data: any;
  entitiesOptions: any;
  zoneOptions: any;
  countriesOptions: any;
  country: any;
  balanceZone: any;
  entity: any;
  currentTab: any;
  start_date: any;
  end_date: any;
  protected subscriptions: Subscription[] = [];
  currentTabOriginal: any;
  revogridTheme: string;
  readonly: boolean;
  constructor(
    private formBuilder: FormBuilder,
    public datepipe: DatePipe,
    private messageService: messageService,
    private apiCountry: CountryService,
    private apiLegalEntity: LegalEntityService,
    private apiBalanceZone: BalanceZoneService,
    public accessChecker: NbAccessChecker,
    private apiThirdParty: ThirdPartyContractsService,
    private darkModeService: DarkModeService
  ) {
    this.getCountries();
    this.getLegalEntities();
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
      .isGranted("create", "physical-contracts-comparison")
      .subscribe((granted) => (this.readonly = !granted));
    this.accordion.toggle();
    this.numeral.locale("es");
    this.comparisonForm = this.formBuilder.group({
      date: new FormControl("", [Validators.required, this.dateRangeValidator]),
      balancing_zone: new FormControl("", [Validators.required]),
      legal_entity: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
    });
    this.country = localStorage.getItem("country_comp_ps");
    this.balanceZone = localStorage.getItem("balance_zone_comp_ps");
    this.entity = localStorage.getItem("entity_comp_ps");
    this.currentTab = localStorage.getItem("currenTab_comp_ps");
    this.start_date = localStorage.getItem("start_date_comp_ps");
    this.end_date = localStorage.getItem("end_date_comp_ps");

    if (
      this.country &&
      this.balanceZone &&
      this.entity &&
      this.start_date &&
      this.end_date
    ) {
      this.getBalanceZones(this.country);
      this.comparisonForm.controls["country_code"].setValue(this.country);
      this.comparisonForm.controls["balancing_zone"].setValue(
        Number(this.balanceZone)
      );
      this.comparisonForm.controls["legal_entity"].setValue(
        Number(this.entity)
      );
      this.comparisonForm.controls["date"].setValue({
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
        this.comparisonForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.getBalanceZones(object["country_code"]);
        this.comparisonForm
          .get("balancing_zone")
          .setValue(object["balancing_zone"]);
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
    }
  }
  private dateRangeValidator: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date = this.comparisonForm && this.comparisonForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.comparisonForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.comparisonForm.get("date").value.end,
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
  calculate(currenTab?, first?) {
    if (this.subscriptions.length > 0) {
      this.cancelAllRequests();
    }
    this.loading = true;
    if (first) {
      localStorage.setItem("rgRow_comp_ps", "");
      localStorage.setItem("rgRow_comp_ps_new", "");
      localStorage.setItem("rgCol_comp_ps", "");
      localStorage.setItem("rgCol_comp_ps_new", "");
      localStorage.setItem("currenTab_comp_ps", "");
      this.currentTab = null;
    }
    this.country = this.comparisonForm.get("country_code").value;
    this.balanceZone = this.comparisonForm.get("balancing_zone").value;
    this.entity = this.comparisonForm.get("legal_entity").value;
    this.start_date = this.datepipe.transform(
      this.comparisonForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.comparisonForm.get("date").value.end,
      "yyyy-MM-dd"
    );
    this.getComparison(
      this.comparisonForm.get("balancing_zone").value,
      this.datepipe.transform(
        this.comparisonForm.get("date").value.start,
        "yyyy-MM-dd"
      ),
      this.datepipe.transform(
        this.comparisonForm.get("date").value.end,
        "yyyy-MM-dd"
      ),
      this.comparisonForm.get("legal_entity").value,
      currenTab
    );

    localStorage.setItem("country_comp_ps", this.country);
    localStorage.setItem("balance_zone_comp_ps", this.balanceZone);
    localStorage.setItem("entity_comp_ps", this.entity);
    localStorage.setItem("start_date_comp_ps", this.start_date);
    localStorage.setItem("end_date_comp_ps", this.end_date);
  }
  reset() {
    this.comparisonForm.controls["country_code"].setValue("");
    this.comparisonForm.controls["balancing_zone"].setValue("");
    this.comparisonForm.controls["legal_entity"].setValue("");
    this.comparisonForm.controls["layout"].setValue("");
    this.comparisonForm.controls["date"].setValue("");
    this.zoneOptions = [];

    localStorage.setItem("country_ps_comp", "");
    localStorage.setItem("balance_zone_ps_comp", "");
    localStorage.setItem("entity_ps_comp", "");
    localStorage.setItem("start_date_ps_comp", "");
    localStorage.setItem("end_date_ps_comp", "");
    this.data = null;

    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.comparisonForm.get("country_code").setValue(object["country_code"]);
      this.comparisonForm
        .get("balancing_zone")
        .setValue(object["balancing_zone"]);
      this.getBalanceZones(object["country_code"]);
    }
  }
  exportAsCSV() {}
  exportAsXLSX() {}
  onChangeCountry($event) {
    this.comparisonForm.controls["balancing_zone"].setValue("");
    this.getBalanceZones($event);
  }
  getCountries() {
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
  getBalanceZones(country) {
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
  getComparison(
    balancing_zone,
    start_date,
    end_date,
    legal_entity,
    currenTab?
  ) {
    const subscription = this.apiThirdParty
      .getPhysicalGasOperationsTSO(
        start_date,
        end_date,
        legal_entity,
        balancing_zone
      )
      .pipe(
        map((data) => {
          localStorage.setItem(
            "rgRow_comp_ps_new",
            localStorage.getItem("rgRow_comp_ps")
          );
          localStorage.setItem(
            "rgCol_comp_ps_new",
            localStorage.getItem("rgCol_comp_ps")
          );
          if (data["msg"] != "" || data["msg"] != null) {
            if (data["msg"].search(/correctly/gi) !== -1) {
              this.messageService.showToast("success", "Success", data["msg"]);
            } else {
              this.messageService.showToast("danger", "Error", data["msg"]);
            }
          } 
          
          var exist_currentTab = false;
     
          return data['data'].map((x, index) => {
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
            localStorage.setItem("currenTab_comp_ps", this.currentTabOriginal);

            x.columns?.map((j) => {
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
                c["sortable"] = true;
                c["size"] = 100 + Number(c["name"].length) * 3;
                c["autoSize"] = true;
                if (c["name"] == "Date") {
                  c["pin"] = "colPinStart";
                } else if (c["filter"] == "string") {
                  c["columnType"] = "string";
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
          isNaN(Number(localStorage.getItem("rgCol_comp_ps_new"))) == false &&
          isNaN(Number(localStorage.getItem("rgRow_comp_ps_new"))) == false
        ) {
          document.querySelectorAll("revo-grid").forEach((element) =>
            element.scrollToCoordinate({
              x: Number(localStorage.getItem("rgCol_comp_ps_new")),
              y: Number(localStorage.getItem("rgRow_comp_ps_new")),
            })
          );
        }
      }, 100);
      this.loading = false;
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

    this.currentTabOriginal = $event.tabTitle;
    this.currentTab = $event.tabTitle.replace(" ", "_").toLowerCase();
    localStorage.setItem("currenTab_ba", this.currentTabOriginal);
  }
  OnViewPortScroll({ detail }) {
    if (detail.dimension == "rgRow") {
      localStorage.setItem("rgRow_comp_ps", detail.coordinate);
    }
    if (detail.dimension == "rgCol") {
      localStorage.setItem("rgCol_comp_ps", detail.coordinate);
    }
  }
  cancelAllRequests() {
    if (!this.subscriptions) {
      return;
    }

    this.subscriptions.forEach((s) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }
}
