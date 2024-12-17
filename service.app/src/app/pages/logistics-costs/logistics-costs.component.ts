import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";

import { BalanceZoneService } from "../../@core/services/balanceZone.service";
import { CountryService } from "../../@core/services/country.service";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";
import { messageService } from "../../@core/utils/messages";
import * as moment from "moment";
import * as XLSX from "xlsx";
import { SupplyPointsAreaService } from "../../@core/services/supplyPointsArea.service";
import { map } from "rxjs/operators";
import NumberColumnType from "@revolist/revogrid-column-numeral";

import { NbDialogService } from "@nebular/theme";
import { DialogExportCostsComponent } from "./dialog-export-costs/dialog-export-costs.component";
import { LegalEntityService } from "../../@core/services/legalEntity.service";

import { Observable, Subscription, of } from "rxjs";
import { NbAccessChecker } from "@nebular/security";
import { DarkModeService } from "../../@core/services/sharedServices/darkMode.service";
import { MarketDataService } from "../../@core/services/marketData.service";

@Component({
  selector: 'slg-logistics-costs',
  templateUrl: './logistics-costs.component.html',
  styleUrls: ['./logistics-costs.component.scss']
})
export class LogisticsCostsComponent implements OnInit {

  settings = {
    singleSelection: false,
    text: "",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    enableSearchFilter: true,
    badgeShowLimit: 2,
    position: "bottom",
    autoPosition: false,
  };
  show = false;
  numeral = NumberColumnType.getNumeralInstance();
  fileName: any = "";
  arrayBuffer: any;
  result: any;
  file: File;
  fileValid = false;
  loadingUpload = false;
  loading_upload_array: any = [];
  manualUploadForm!: FormGroup;
  zoneOptions: any;
  errorBalanceZone = false;
  zoneOptions2: any;
  errorBalanceZone2 = false;
  errorDate1 = false;
  errorDate2 = false;
  logContainerDiv = false;
  countriesOptions: any;
  emptyDate: any;
  timestamp: any;
  successes: any;
  creation_errors_count: any;
  mapping_errors_count: any;
  creation_errors: any;
  mapping_errors: any;
  logContainer = false;
  generateLogisticCostForm!: FormGroup;
  downloadForm!: FormGroup;
  supplyAreaOptions: any = [];
  loadingViewLogisticCost = false;
  country: any;
  balancing_zone: any;
  supply_areas: any;
  granularity: any;
  start_date: any;
  end_date: any;
  dataView: any;
  validateRevogrid: boolean;
  eventTimes = [];
  protected subscriptions: Subscription[] = [];
  selectedSupplyAreas = [];
  entitiesOptions: any;
  entitiesOptions2: any;
  entitiesOptions3: any;
  errorLegalEntity = false;
  errorLegalEntity2 = false;
  errorLegalEntity3 = false;
  legal_entity: any;
  scroll: any;
  cupsIndex: any;
  rgCol: string;
  rgRow: string;
  errorSupplyAreas = false;
  errorsSupplyAreas: any;
  supplyAreaEvent: any;
  options: string[];
  filteredOptions$: Observable<string[]>;
  @ViewChild("autoInput") input;
  @ViewChild("generateLogisticCost", { static: true })
  accordionGenerateLogisticCost;
  readonly: boolean;
  loadingForm = false;
  loading_form_array: any = [];
  revogridTheme: string;
  eventTimes1 = [];
  constructor(
    public datepipe: DatePipe,
    private messageService: messageService,
    private excelService: ExcelService,
    private formBuilder: FormBuilder,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
    private apiLogisticCostService: MarketDataService,
    private apiSupplyAreas: SupplyPointsAreaService,
    private dialogService: NbDialogService,
    private apiLegalEntity: LegalEntityService,
    public accessChecker: NbAccessChecker,
    private darkModeService: DarkModeService
  ) {
    this.getCountries();
    this.options = ["pera", "manzana"];
    this.filteredOptions$ = of(this.options);
    this.getLegalEntities1();
    this.getLegalEntities2();
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
      .isGranted("create", "Logistics-costs")
      .subscribe((granted) => (this.readonly = !granted));
    this.numeral.locale("es");
    this.accordionGenerateLogisticCost.toggle();

    var object = localStorage.getItem("settings_parameters");
    this.manualUploadForm = this.formBuilder.group({
      balancing_zone_id: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      file: new FormControl("", []),
      logView: new FormControl(false, [Validators.required]),
    });
    this.downloadForm = this.formBuilder.group({
      date: new FormControl("", [
        Validators.required,
        this.dateRangeValidator1,
      ]),
    });
    this.generateLogisticCostForm = this.formBuilder.group({
      country_code: new FormControl("", [Validators.required]),
      balancing_zone: new FormControl("", [Validators.required]),
      date: new FormControl("", [
        Validators.required,
        this.dateRangeValidator2,
      ]),
    });
    this.country = localStorage.getItem("country_lgs");
    this.balancing_zone = localStorage.getItem("balance_zone_lgs");
    this.start_date = localStorage.getItem("start_date_lgs");
    this.end_date = localStorage.getItem("end_date_lgs");


    if (
      this.country &&
      this.balancing_zone &&
      this.start_date &&
      this.end_date
    ) {
      this.getbalanceZones2(this.country);

    

      this.generateLogisticCostForm.controls["country_code"].setValue(this.country);
      this.generateLogisticCostForm.controls["balancing_zone"].setValue(
        Number(this.balancing_zone)
      );

     
    
      this.generateLogisticCostForm.controls["date"].setValue({
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
      this.calculate();
    } else {
      if (object) {
        object = JSON.parse(localStorage.getItem("settings_parameters"));
        this.generateLogisticCostForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.generateLogisticCostForm
          .get("balancing_zone")
          .setValue(object["balancing_zone"]);
        this.getbalanceZones2(object["country_code"]);

      }
    }

    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.manualUploadForm
        .get("country_code")
        .setValue(object["country_code"]);
      this.manualUploadForm
        .get("balancing_zone_id")
        .setValue(object["balancing_zone"]);
      this.getbalanceZones1(object["country_code"]);
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
  getCountries() {
    this.loadingForm = true;
    this.loading_form_array[0] = true;
    this.loadingUpload = true;
    this.loading_upload_array[0] = true;
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
        this.loading_upload_array[0] = false;
        if (this.loading_upload_array.includes(true) == false) {
          this.loadingUpload = false;
          this.loading_upload_array = [];
        }
      });
  }
  onChangeCountry($event) {
    this.manualUploadForm.controls["balancing_zone_id"].setValue("");
    this.getbalanceZones1(this.manualUploadForm.get("country_code").value);
  }
  getbalanceZones1(country) {
    this.loadingUpload = true;
    this.loading_upload_array[1] = true;
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
        this.loading_upload_array[1] = false;
        if (this.loading_upload_array.includes(true) == false) {
          this.loadingUpload = false;
          this.loading_upload_array = [];
        }
      });
  }
  getbalanceZones2(country) {
    this.loadingForm = true;
    this.loading_form_array[1] = true;
    this.apiBalanceZone
      .getAllBalanceZonesByCountry(country)
      .subscribe({
        next: (res) => {
          this.zoneOptions2 = res;
  
          if (this.zoneOptions2.length == 0) {
            this.errorBalanceZone2 = true;
          } else {
            this.errorBalanceZone2 = false;
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
        this.loading_form_array[1] = false;
        if (this.loading_form_array.includes(true) == false) {
          this.loadingForm = false;
          this.loading_form_array = [];
        }
      });
  }
  onFileClick(event: any) {
    event.target.value = "";
  }
  onFileChange(event: any) {
    this.fileName = "";
    this.file = null;

    if (event.target.files[0] !== undefined) {
      this.fileName = event.target.files[0].name;
      this.file = event.target.files[0];
      this.fileValid = true;
    } else {
      this.fileValid = false;
    }
  }
  manualUpload() {
    this.loadingUpload = true;
    this.manualUploadForm.controls["logView"].setValue(true);
    this.logContainerDiv = true;
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i)
        arr[i] = String.fromCharCode(data[i]);

      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, {
        type: "binary",
        cellDates: true,
        raw: false,
        dateNF: "dd/mm/yyy",
      });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];

      this.result = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    };
    fileReader.onloadend = (e) => {
      let isEqual = false;
      this.apiLogisticCostService
        .getLogisticCostsTemplate(
          this.manualUploadForm.get("balancing_zone_id").value,
    /*       "2022-01-01",
          "2022-01-01",
          this.manualUploadForm.get("granularity").value */
        )
        .subscribe({
          next: (res) => {
            var objectTemp = [{}];
            objectTemp = objectTemp.map((x) => {
              res.map((j) => {
                x[j["label"]] = null;
              });
              return x;
            });

            this.result.map((x) => {
              objectTemp.map((j) => {
                if (
                  Object.keys(x)
                    .toString()
                    .replaceAll(/,\d{4}-\d{2}/g, "")
                    .replaceAll(/-\d{2}/g, "") ===
                  Object.keys(j)
                    .toString()
                    .replaceAll(/,\d{4}-\d{2}/g, "")
                    .replaceAll(/-\d{2}/g, "")
                ) {
                  isEqual = true;
                }
              });
            });
            function dateIsValid(date) {
              return date instanceof Date && !isNaN(Number(date.getTime()));
            }

            if (isEqual) {
              this.result.map((x) => {
                res.map((j) => {
                  if (j["type"] == "integer") {
                    if (
                      x[j["label"]] !== null &&
                      x[j["label"]] !== "" &&
                      isNaN(Number(x[j["label"]])) === false
                    ) {
                      x[j["label"]] = Number(x[j["label"]]);
                    } else {
                      x[j["label"]] = null;
                    }
                  } else if (j["type"] == "number") {
                    if (
                      x[j["label"]] !== null &&
                      x[j["label"]] !== "" &&
                      isNaN(Number(x[j["label"]])) === false
                    ) {
                      x[j["label"]] = Number(x[j["label"]]);
                    } else {
                      x[j["label"]] = null;
                    }
                  } else if (j["type"] == "date") {
                    if (
                      x[j["label"]] !== null &&
                      x[j["label"]] !== "" &&
                      dateIsValid(x[j["label"]]) == true
                    ) {
                      x[j["label"]] = this.datepipe.transform(
                        x[j["label"]],
                        "yyyy-MM-dd"
                      );
                    } else {
                      x[j["label"]] = null;
                    }
                  } else if (j["type"] == "date-time") {
                    if (
                      x[j["label"]] !== null &&
                      x[j["label"]] !== "" &&
                      dateIsValid(x[j["label"]]) == true
                    ) {
                      x[j["label"]] =
                        new Date(
                          new Date(x[j["label"]])
                            .toString()
                            .replace(/GMT.*$/, "GMT+0000")
                        )
                          .toISOString()
                          .split(".")[0] + "Z";
                    } else {
                      x[j["label"]] = null;
                    }
                  } else if (j["type"] == "string") {
                    if (x[j["label"]] !== null && x[j["label"]] !== "") {
                      x[j["label"]] = x[j["label"]].toString();
                    } else {
                      x[j["label"]] = null;
                    }
                  } else {
                    if (
                      x[j["label"]] !== null &&
                      x[j["label"]] !== "" &&
                      isNaN(Number(x[j["label"]])) === false
                    ) {
                      x[j["label"]] = Number(x[j["label"]]);
                    } else {
                      x[j["label"]] = null;
                    }
                  }
                });
              });

              this.apiLogisticCostService
                .uploadLogisticCostsWorksheet(
                  this.manualUploadForm.get("balancing_zone_id").value,
                  this.result
                )
                .subscribe({
                  next: (res) => {
                    this.messageService.showToast(
                      "info",
                      "Info",
                      "Logistics costs have been uploaded, please check the log tab."
                    );

                    // this.getContracts();
                    this.timestamp = new Date(
                      new Date().toString().replace(/GMT.*$/, "GMT+0000")
                    )
                      .toISOString()
                      .replace("Z", "")
                      .replace("T", " ")
                      .split(".")[0];
                    this.successes = res["successes"];
                    this.creation_errors_count = Object.values(
                      res["errors"]
                    ).length;
                    this.creation_errors = Object.values(res["errors"]);
                    this.logContainer = true;
                  },
                  error: (e) => {
                    this.loadingUpload = false;
                    if (e.error.title == "Internal Server Error") {
                      this.messageService.showToast(
                        "danger",
                        "Error",
                        "Internal server error while uploading contracts"
                      );
                      this.timestamp = new Date(
                        new Date().toString().replace(/GMT.*$/, "GMT+0000")
                      )
                        .toISOString()
                        .replace("Z", "")
                        .replace("T", " ")
                        .split(".")[0];
                      this.successes = 0;
                      this.creation_errors_count = 1;
                      this.creation_errors = [
                        "Internal server error while uploading logistics costs",
                      ];

                      this.logContainer = true;
                    } else {
                      this.messageService.showToast("danger", "Error", e.error);
                      this.timestamp = new Date(
                        new Date().toString().replace(/GMT.*$/, "GMT+0000")
                      )
                        .toISOString()
                        .replace("Z", "")
                        .replace("T", " ")
                        .split(".")[0];
                      this.successes = 0;
                      this.creation_errors_count = 1;
                      this.creation_errors = [e.error];
                      this.logContainer = true;
                    }
                  },
                })
                .add(() => {
                  this.loadingUpload = false;
                });
            } else {
              this.messageService.showToast(
                "danger",
                "Error",
                "The uploaded file does not have the template structure or does not have data"
              );
              this.timestamp = new Date(
                new Date().toString().replace(/GMT.*$/, "GMT+0000")
              )
                .toISOString()
                .replace("Z", "")
                .replace("T", " ")
                .split(".")[0];
              this.successes = 0;
              this.creation_errors_count = 1;
              this.creation_errors = [
                "the uploaded file does not have the template structure or does not have data",
              ];
              this.logContainer = true;
              this.loadingUpload = false;
            }
          },
        });
    };
    fileReader.readAsArrayBuffer(this.file);
    function getCurrentTimestamp() {
      return Date.now();
    }
  }
  download() {
    this.apiLogisticCostService
      .getLogisticCostsTemplate(
        this.manualUploadForm.get("balancing_zone_id").value,
        /* this.datepipe.transform(
          this.downloadForm.get("date").value.start,
          "yyyy-MM-dd"
        ),
        this.datepipe.transform(
          this.downloadForm.get("date").value.end,
          "yyyy-MM-dd"
        ),
        this.manualUploadForm.get("granularity").value */
      )
      .subscribe({
        next: (res) => {
          var objectTemp = [{}];
          objectTemp = objectTemp.map((x) => {
            res.map((j) => {
              x[j["label"]] = null;
            });
            return x;
          });

          this.excelService.exportAsExcelFile(
            objectTemp,
            "logistics_costs_template"
          );
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while downloading template"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }
  private dateRangeValidator1: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date = this.downloadForm && this.downloadForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.downloadForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.downloadForm.get("date").value.end,
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

    return invalid
      ? {
          invalidRange: {},
        }
      : null;
  };
  private dateRangeValidator2: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date =
      this.generateLogisticCostForm && this.generateLogisticCostForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.generateLogisticCostForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.generateLogisticCostForm.get("date").value.end,
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
      this.errorDate2 = true;
    } else {
      this.errorDate2 = false;
    }

    return invalid
      ? {
          invalidRange: {},
        }
      : null;
  };
  onToggle($event) {
    var logView = this.manualUploadForm.get("logView").value;

    this.logContainerDiv = !logView;
  }

  onChangeCountry2($event) {
    this.generateLogisticCostForm.controls["balancing_zone"].setValue("");
    this.getbalanceZones2(this.generateLogisticCostForm.get("country_code").value);
  }

  getSupplyAreas(zone, change?) {
    this.loadingForm = true;
    this.loading_form_array[2] = true;
    this.apiSupplyAreas
      .getSupplyAreasByBalanceZone(zone)
      .subscribe({
        next: (res) => {
          this.supplyAreaOptions = res;
          this.supplyAreaOptions.map((x) => {
            x["itemName"] = x["label"];
          });
          if (this.supplyAreaOptions.length == 0) {
            this.errorSupplyAreas = true;
          } else {
            this.errorSupplyAreas = false;
          }
        },
        error: (e) => {
          this.errorSupplyAreas = true;
          /*     if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting supply areas"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          } */
        },
      })
      .add(() => {
        this.selectedSupplyAreas = this.supply_areas;

        if (change) {
          this.selectedSupplyAreas = [];
        }
        this.loading_form_array[2] = false;
        if (this.loading_form_array.includes(true) == false) {
          this.loadingForm = false;
          this.loading_form_array = [];
        }
      });
  }

  getLogisticsCosts(
    balancing_zone,
    start_date,
    end_date
  ) {
    this.errorsSupplyAreas = [];
    const subscription = this.apiLogisticCostService
      .getLogisticCosts(
        start_date,
        end_date,
        balancing_zone,
   
      )
      .pipe(
        map((data) => {
          if (
            localStorage.getItem("rgRow_lgs") &&
            localStorage.getItem("rgCol_lgs")
          ) {
            localStorage.setItem(
              "rgRow_lgs_new",
              localStorage.getItem("rgRow_lgs")
            );
            localStorage.setItem(
              "rgCol_lgs_new",
              localStorage.getItem("rgCol_lgs")
            );
          }
          return data["data"].map((x, index) => {
        

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

          this.loadingViewLogisticCost = false;
          this.dataView = null;

          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting logistics costs"
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

        if (
          isNaN(Number(localStorage.getItem("rgCol_lgs_new"))) == false &&
          isNaN(Number(localStorage.getItem("rgRow_lgs_new"))) == false
        ) {
          document.querySelector("revo-grid").scrollToCoordinate({
            x: Number(localStorage.getItem("rgCol_lgs_new")),
            y: Number(localStorage.getItem("rgRow_lgs_new")),
          });
        }
      }, 100);
      this.loadingViewLogisticCost = false;
    });
  }
  calculate(first?) {
    if (this.subscriptions.length > 0) {
      this.cancelAllRequests();
    }
    this.validateRevogrid = true;
    this.loadingViewLogisticCost = true;
    if (first) {
      localStorage.setItem("rgRow_lgs", "");
      localStorage.setItem("rgRow_lgs_new", "");
      localStorage.setItem("rgCol_lgs", "");
      localStorage.setItem("rgCol_lgs_new", "");
      localStorage.setItem("currenTab_lgs", "");
    }
    this.country = this.generateLogisticCostForm.get("country_code").value;
    this.balancing_zone = this.generateLogisticCostForm.get("balancing_zone").value;
    this.start_date = this.datepipe.transform(
      this.generateLogisticCostForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.generateLogisticCostForm.get("date").value.end,
      "yyyy-MM-dd"
    );

    localStorage.setItem("country_lgs", this.country);
    localStorage.setItem("balance_zone_lgs", this.balancing_zone);
    localStorage.setItem("start_date_lgs", this.start_date);
    localStorage.setItem("end_date_lgs", this.end_date);


    this.getLogisticsCosts(
      this.balancing_zone,
      this.start_date,
      this.end_date,
     
    );
  }
  reset() {
    this.cancelAllRequests();
    this.generateLogisticCostForm.controls["country_code"].setValue("");
    this.generateLogisticCostForm.controls["balancing_zone"].setValue("");
    this.generateLogisticCostForm.controls["date"].setValue("");
    this.zoneOptions = [];
    localStorage.setItem("country_lgs", "");
    localStorage.setItem("balance_zone_lgs", "");
    localStorage.setItem("start_date_lgs", "");
    localStorage.setItem("end_date_lgs", "");
    this.dataView = null;
    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.generateLogisticCostForm
        .get("country_code")
        .setValue(object["country_code"]);
      this.generateLogisticCostForm
        .get("balancing_zone")
        .setValue(object["balancing_zone"]);
      this.getbalanceZones2(object["country_code"]);
      this.getSupplyAreas(object["balancing_zone"]);
    }
  }
 

  exportAsCSV() {
    (document.querySelectorAll("revo-grid") as any).forEach((element) => {
      element.getPlugins().then((plugins) => {
        plugins.forEach((p) => {
          if (p.exportFile) {
            const exportPlugin = p;
            exportPlugin.exportFile({
              filename: "logistics_costs" + this.start_date + "_" + this.end_date,
            });
          }
        });
      });
    });
  }

  exportAsXLSX() {
    document
      .querySelector("revo-grid")
      .getSource()
      .then((value) => {
        this.excelService.exportAsExcelFile(
          value,
          "logistics_costs" + this.start_date + "_" + this.end_date
        );
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
  }
 
  openDownloadDialog() {
    this.dialogService.open(DialogExportCostsComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        balance_zone: this.manualUploadForm.get("balancing_zone_id").value,
        granularity: this.manualUploadForm.get("granularity").value,
      },
      autoFocus: false,
    });
  }
  getLegalEntities1() {
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
  getLegalEntities2() {
    this.loadingForm = true;
    this.loading_form_array[3] = true;
    this.apiLegalEntity
      .getAllLegalEntitiesByCountry(null, "Internal")
      .subscribe({
        next: (res) => {
          this.entitiesOptions2 = res.sort((a, b) =>
            a.name > b.name ? 1 : -1
          );
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
      })
      .add(() => {
        this.loading_form_array[3] = false;
        if (this.loading_form_array.includes(true) == false) {
          this.loadingForm = false;
          this.loading_form_array = [];
        }
      });
  }
  OnViewPortScroll({ detail }) {
    if (detail.dimension == "rgRow") {
      localStorage.setItem("rgRow_lgs", detail.coordinate);
    }
    if (detail.dimension == "rgCol") {
      localStorage.setItem("rgCol_lgs", detail.coordinate);
    }
  }
  refresh() {
    this.loadingViewLogisticCost = true;
    var balancing_zone = localStorage.getItem("balance_zone_lgs");
    var start_date = localStorage.getItem("start_date_lgs");
    var end_date = localStorage.getItem("end_date_lgs");
    this.getLogisticsCosts(
      balancing_zone,
      start_date,
      end_date,  
    );
  }
  ngOnDestroy() {
    this.cancelAllRequests();
  }
}
