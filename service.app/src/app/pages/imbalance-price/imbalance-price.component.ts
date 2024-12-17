import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import * as XLSX from "xlsx";
import * as moment from "moment";
import { MeasurementUnit } from "../../@core/schemas/measurementUnit";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  ValidatorFn,
} from "@angular/forms";
import { messageService } from "../../@core/utils/messages";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";
import { DatePipe } from "@angular/common";
import { ContractsService } from "../../@core/services/contracts.service";
import { LegalEntityService } from "../../@core/services/legalEntity.service";
import { CountryService } from "../../@core/services/country.service";
import { BalanceZoneService } from "../../@core/services/balanceZone.service";

import NumberColumnType from "@revolist/revogrid-column-numeral";

import { MarketDataService } from "../../@core/services/marketData.service";
import { map } from "rxjs/operators";
import { Subscription } from "rxjs";
import { NbAccessChecker } from "@nebular/security";
import { DarkModeService } from "../../@core/services/sharedServices/darkMode.service";

@Component({
  selector: "ngx-imbalance-price",
  templateUrl: "./imbalance-price.component.html",
  styleUrls: ["./imbalance-price.component.scss"],
})
export class ImbalancePriceComponent implements OnInit {
  fileName: any = "";
  @Input() action1: string;
  arrayBuffer: any;
  file: File;
  fileValid = false;
  loadingUpload = false;
  defaultRowPerPage = 10;
  filterForm!: FormGroup;
  generatePricesForm!: FormGroup;
  manualUploadForm!: FormGroup;
  data: any;
  start_date: any;
  end_date: any;
  errorDateFilter = false;
  errorDateUpload = false;
  errorLegalEntity: any;
  errorBalanceZone1 = false;
  errorBalanceZone2 = false;
  entitiesOptions: any;
  objectTemplate = [{}];
  result: any;
  zoneOptions1: any;
  zoneOptions2: any;
  currentTabOriginal: any;
  currentTab: any;
  countriesOptions: any;
  measureUnitOptions: MeasurementUnit;
  source: LocalDataSource = new LocalDataSource();
  timestamp: any;
  successes: any;
  creation_errors_count: any;
  successfully_operations: any;
  zoneOptions: any;
  errorBalanceZone = false;
  mapping_errors_count: any;
  creation_errors: any;
  mapping_errors: any;
  logContainer = false;
  logContainerDiv = false;
  fileNg: any;
  toggleNgModel = false;
  dependencies: any;
  loadingGetPrices = false;
  numeral = NumberColumnType.getNumeralInstance();
  rows: any;
  waitDependencies = false;
  waitNominations = false;
  optionsPager: any;
  dataView: any;
  balancing_zone: any;
  loadingVisualizeForm = false;
  selected: any;
  errorCurve = false;
  curves: any;
  revogridTheme: string;
  protected subscriptions: Subscription[] = [];
  @ViewChild("generatePrices", { static: true })
  accordionGeneratePrices;
  settings = {
    mode: "external",
    actions: {
      add: false,
      edit: false,
      delete: false,

      /*   custom: [
    
        {
          name: "view",
          title: '<i class="far fa-eye"></i>',
        },
      
      ], */
    },
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
    },

    columns: {
      id: {
        title: "Id",
        type: "number",
        hide: true,
      },

      price_date: {
        title: "Price Date",
        type: "string",
        filter: false,
      },
      logistic_element_id: {
        title: "Logistic Element Id",
        type: "string",
        hide: true,
      },
      logistic_element_label: {
        title: "Logistic Element",
        type: "string",
      },
      price: {
        title: "Price",
        type: "number",
        valuePrepareFunction: (value) => {
          return this.numeral(value).format("0,0.[0000000000]");
        },
      },

      balance_zone_id: {
        title: "Balance Zone Id",
        type: "string",
        hide: true,
      },
      balance_zone: {
        title: "Balance Zone",
        type: "string",
      },
      country: {
        title: "Country",
        type: "string",
      },
    },
    pager: {
      display: true,
      perPage: this.defaultRowPerPage,
    },
    attr: {
      class: "table",
    },
  };
  errorDate1: boolean;
  country: any;
  curve: any;
  typePrice: string;
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
    this.accordionGeneratePrices.toggle();
    var object = localStorage.getItem("settings_parameters");
    this.filterForm = this.formBuilder.group({
      date: new FormControl("", [
        Validators.required,
        this.dateRangeValidatorFilter,
      ]),
    });
    this.manualUploadForm = this.formBuilder.group({
      typePrice: new FormControl("", [Validators.required]),
      balancing_zone_id: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      file: new FormControl("", []),
      logView: new FormControl(false, [Validators.required]),
    });
    this.generatePricesForm = this.formBuilder.group({
      country_code: new FormControl("", [Validators.required]),
      balancing_zone: new FormControl("", [Validators.required]),
      date: new FormControl("", [
        Validators.required,
        this.dateRangeValidator1,
      ]),
      curve: new FormControl(""),
      typePrice: new FormControl("", [Validators.required]),
    });

    this.country = localStorage.getItem("country_prices");
    this.balancing_zone = localStorage.getItem("balance_zone_prices");
    this.start_date = localStorage.getItem("start_date_prices");
    this.end_date = localStorage.getItem("end_date_prices");
    this.curve = localStorage.getItem("curve_prices");
    this.typePrice = localStorage.getItem("type_of_prices");
    if (
      this.country &&
      this.balancing_zone &&
      this.start_date &&
      this.end_date &&
      this.typePrice
    ) {
    
      if (this.typePrice == "purchase_sale") {
        if(this.curve){
   
          this.getCurves(this.balancing_zone);
          this.generatePricesForm.get('curve').setValue(Number(this.curve));
          this.getbalanceZones(this.country, 2);
          this.generatePricesForm.controls["balancing_zone"].setValue(
            Number(this.balancing_zone)
          );
          this.generatePricesForm.controls["typePrice"].setValue(this.typePrice);
          this.generatePricesForm.controls["country_code"].setValue(this.country);
       
          this.generatePricesForm.controls["date"].setValue({
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
        }

      } else if (this.typePrice == "imbalance") {
        this.getbalanceZones(this.country, 2);
        this.generatePricesForm.controls["typePrice"].setValue(this.typePrice);
        this.generatePricesForm.controls["country_code"].setValue(this.country);
        this.generatePricesForm.controls["balancing_zone"].setValue(
          Number(this.balancing_zone)
        );
        this.generatePricesForm.controls["date"].setValue({
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
      }
    } else {
      if (object) {
        object = JSON.parse(localStorage.getItem("settings_parameters"));
        this.generatePricesForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.generatePricesForm
          .get("balancing_zone")
          .setValue(object["balancing_zone"]);
        this.manualUploadForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.manualUploadForm
          .get("balancing_zone_id")
          .setValue(object["balancing_zone"]);
        this.getbalanceZones(object["country_code"], 1);
        this.getbalanceZones(object["country_code"], 2);
        this.getCurves(object["balancing_zone"]);
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
      this.getbalanceZones(object["country_code"], 1);
    }
 
  }
  constructor(
    public datepipe: DatePipe,
    private messageService: messageService,
    private dialogService: NbDialogService,
    private excelService: ExcelService,
    private formBuilder: FormBuilder,
    private apiContract: ContractsService,
    private apiLegalEntity: LegalEntityService,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
    private apiMarketData: MarketDataService,
    public accessChecker: NbAccessChecker,
    private darkModeService: DarkModeService
  ) {
    this.getCountries();
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
  private dateRangeValidator1: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date =
      this.generatePricesForm && this.generatePricesForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.generatePricesForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.generatePricesForm.get("date").value.end,
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
      if (this.manualUploadForm.get("typePrice").value == "imbalance") {
        this.apiMarketData
          .getImbalancePricesWorksheetTemplate(
            this.manualUploadForm.get("balancing_zone_id").value
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
                      .replace(",__EMPTY", "")
                      .replaceAll(/(,__EMPTY_)\w+/g, "") ===
                    Object.keys(j).toString()
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
                  for (var propName in x) {
                    if (propName.toString().search("EMPTY") != -1) {
                      delete x[propName];
                    }
                  }
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
                        dateIsValid(
                          moment(x[j["label"]], "DD/MM/YYYY").toDate()
                        ) == true
                      ) {
                        x[j["label"]] = this.datepipe.transform(
                          moment(x[j["label"]], "DD/MM/YYYY").toDate(),
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
                    } else {
                      if (x[j["label"]] !== null && x[j["label"]] !== "") {
                        x[j["label"]] = x[j["label"]].toString();
                      } else {
                        x[j["label"]] = null;
                      }
                    }
                  });
                });

                this.apiMarketData
                  .uploadImbalancePricesWorksheet(
                    this.manualUploadForm.get("balancing_zone_id").value,
                    this.result
                  )
                  .subscribe({
                    next: (res) => {
                      this.successes = "";
                      this.creation_errors = "";
                      this.creation_errors_count = "";
                      this.messageService.showToast(
                        "info",
                        "Info",
                        "Orders have been uploaded, please check the log tab."
                      );

                      this.timestamp = new Date(
                        new Date().toString().replace(/GMT.*$/, "GMT+0000")
                      )
                        .toISOString()
                        .replace("Z", "")
                        .replace("T", " ")
                        .split(".")[0];
                      this.successes = res["successes"];
                      if (res["errors"]) {
                        this.creation_errors_count = Object.values(
                          res["errors"]
                        ).length;
                        this.creation_errors = Object.values(res["errors"]);
                      }
                      if (res["successfully_operations"]) {
                        this.successfully_operations = Object.values(
                          res["successfully_operations"]
                        );
                      }

                      this.logContainer = true;
                    },
                    error: (e) => {
                      this.loadingUpload = false;
                      this.loadingGetPrices = false;
                      if (e.error.title == "Internal Server Error") {
                        this.messageService.showToast(
                          "danger",
                          "Error",
                          "Internal server error while uploading orders"
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
                          "Internal server error while uploading orders",
                        ];

                        this.logContainer = true;
                      } else {
                        this.messageService.showToast(
                          "danger",
                          "Error",
                          e.error
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
                        this.creation_errors = [e.error];

                        this.logContainer = true;
                      }
                    },
                  })
                  .add(() => {
                    this.loadingUpload = false;
                    this.loadingGetPrices = false;
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
                this.loadingUpload = false;
                this.loadingGetPrices = false;
                this.logContainer = true;
              }
            },
          });
      }
      if (this.manualUploadForm.get("typePrice").value == "purchase_sale") {
        this.apiMarketData
          .getPurchaseSaleWorksheetTemplate(
            this.manualUploadForm.get("balancing_zone_id").value
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
                      .replace(",__EMPTY", "")
                      .replaceAll(/(,__EMPTY_)\w+/g, "") ===
                    Object.keys(j).toString()
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
                  for (var propName in x) {
                    if (propName.toString().search("EMPTY") != -1) {
                      delete x[propName];
                    }
                  }
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
                        dateIsValid(
                          moment(x[j["label"]], "DD/MM/YYYY").toDate()
                        ) == true
                      ) {
                        x[j["label"]] = this.datepipe.transform(
                          moment(x[j["label"]], "DD/MM/YYYY").toDate(),
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
                    } else {
                      if (x[j["label"]] !== null && x[j["label"]] !== "") {
                        x[j["label"]] = x[j["label"]].toString();
                      } else {
                        x[j["label"]] = null;
                      }
                    }
                  });
                });

                this.apiMarketData
                  .uploadPurchaseSaleWorksheet(
                    this.manualUploadForm.get("balancing_zone_id").value,
                    this.result
                  )
                  .subscribe({
                    next: (res) => {
                      this.successes = "";
                      this.creation_errors = "";
                      this.creation_errors_count = "";
                      this.messageService.showToast(
                        "info",
                        "Info",
                        "Orders have been uploaded, please check the log tab."
                      );

                      this.timestamp = new Date(
                        new Date().toString().replace(/GMT.*$/, "GMT+0000")
                      )
                        .toISOString()
                        .replace("Z", "")
                        .replace("T", " ")
                        .split(".")[0];
                      this.successes = res["successes"];
                      if (res["errors"]) {
                        this.creation_errors_count = Object.values(
                          res["errors"]
                        ).length;
                        this.creation_errors = Object.values(res["errors"]);
                      }
                      if (res["successfully_operations"]) {
                        this.successfully_operations = Object.values(
                          res["successfully_operations"]
                        );
                      }

                      this.logContainer = true;
                    },
                    error: (e) => {
                      this.loadingUpload = false;
                      this.loadingGetPrices = false;
                      if (e.error.title == "Internal Server Error") {
                        this.messageService.showToast(
                          "danger",
                          "Error",
                          "Internal server error while uploading orders"
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
                          "Internal server error while uploading orders",
                        ];

                        this.logContainer = true;
                      } else {
                        this.messageService.showToast(
                          "danger",
                          "Error",
                          e.error
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
                        this.creation_errors = [e.error];

                        this.logContainer = true;
                      }
                    },
                  })
                  .add(() => {
                    this.loadingUpload = false;
                    this.loadingGetPrices = false;
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
                this.loadingUpload = false;
                this.loadingGetPrices = false;
                this.logContainer = true;
              }
            },
          });
      }
    };
    fileReader.readAsArrayBuffer(this.file);
    function getCurrentTimestamp() {
      return Date.now();
    }
  }

  getImbalancePrices(balancing_zone, start_date, end_date) {
    this.loadingGetPrices=true;
    const subscription = this.apiMarketData
      .getImbalancePrices(balancing_zone, start_date, end_date)
      .pipe(
        map((data) => {
   
          if (
            localStorage.getItem("rgRow_prices") &&
            localStorage.getItem("rgCol_prices")
          ) {
            localStorage.setItem(
              "rgRow_prices_new",
              localStorage.getItem("rgRow_prices")
            );
            localStorage.setItem(
              "rgCol_prices_new",
              localStorage.getItem("rgCol_prices")
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
    
          this.loadingGetPrices = false;
          this.dataView = null;

          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting imbalance prices"
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
          isNaN(Number(localStorage.getItem("rgCol_prices_new"))) == false &&
          isNaN(Number(localStorage.getItem("rgRow_prices_new"))) == false
        ) {
          document.querySelector("revo-grid").scrollToCoordinate({
            x: Number(localStorage.getItem("rgCol_prices_new")),
            y: Number(localStorage.getItem("rgRow_prices_new")),
          });
        }
      }, 100);
      this.loadingGetPrices = false;
    });
  }
  getPurchaseSalesPrices(curveId, start_date, end_date) {
    this.loadingGetPrices=true;
    const subscription = this.apiMarketData
      .getPurchaseSalePrices(curveId, start_date, end_date)
      .pipe(
        map((data) => {
          if (
            localStorage.getItem("rgRow_prices") &&
            localStorage.getItem("rgCol_prices")
          ) {
            localStorage.setItem(
              "rgRow_prices_new",
              localStorage.getItem("rgRow_prices")
            );
            localStorage.setItem(
              "rgCol_prices_new",
              localStorage.getItem("rgCol_prices")
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

          this.loadingGetPrices = false;
          this.dataView = null;

          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting imbalance prices"
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
          isNaN(Number(localStorage.getItem("rgCol_prices_new"))) == false &&
          isNaN(Number(localStorage.getItem("rgRow_prices_new"))) == false
        ) {
          document.querySelector("revo-grid").scrollToCoordinate({
            x: Number(localStorage.getItem("rgCol_prices_new")),
            y: Number(localStorage.getItem("rgRow_prices_new")),
          });
        }
      }, 100);
      this.loadingGetPrices = false;
    });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }

  onToggle($event) {
    var logView = this.manualUploadForm.get("logView").value;

    this.logContainerDiv = !logView;
  }
  filter() {
    this.start_date = this.datepipe.transform(
      this.filterForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.filterForm.get("date").value.end,
      "yyyy-MM-dd"
    );
    this.dateRange(this.start_date, this.end_date);
  }
  dateRange(beginDate: string, endDate: string) {
    this.source = new LocalDataSource(this.dataView);
    this.source.setFilter([
      {
        field: "price_date",
        search: beginDate,
        filter: (value: string, searchValue: string) => {
          return (
            new Date(value) >= new Date(searchValue) &&
            new Date(value) <= new Date(endDate)
          );
        },
      },
    ]);
  }
  onChangeTypeOfPrice($event) {
    this.generatePricesForm.get('curve').setValue("");
    if ($event == "imbalance") {
      this.generatePricesForm.get("curve").clearValidators();
      this.generatePricesForm.get("curve").updateValueAndValidity();
    } else if ($event == "purchase_sale") {
      this.generatePricesForm.get("curve").setValidators(Validators.required);
      this.generatePricesForm.get("curve").updateValueAndValidity();
    }
    if(this.generatePricesForm.get('balancing_zone').value){
      this.getCurves(this.generatePricesForm.get('balancing_zone').value);
    }
  }
  onChangeZone($event) {
    this.generatePricesForm.get('curve').setValue("");
    if(this.generatePricesForm.get('typePrice').value=="purchase_sale"){
     this.getCurves($event);
    }
    
  }
  getCurves(zone){
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

  reset() {
    this.cancelAllRequests();
    this.generatePricesForm.controls["typePrice"].setValue("");
    this.generatePricesForm.controls["country_code"].setValue("");
    this.generatePricesForm.controls["balancing_zone"].setValue("");
    this.generatePricesForm.controls["date"].setValue("");
    this.generatePricesForm.controls["curve"].setValue("");
    this.zoneOptions = [];
    localStorage.setItem("country_prices", "");
    localStorage.setItem("balance_zone_prices", "");
    localStorage.setItem("start_date_prices", "");
    localStorage.setItem("end_date_prices", "");
    localStorage.setItem("curve_prices", "");
    localStorage.setItem("type_of_prices", "");
    this.dataView = null;
    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.generatePricesForm
        .get("country_code")
        .setValue(object["country_code"]);
      this.generatePricesForm
        .get("balancing_zone")
        .setValue(object["balancing_zone"]);
      this.getbalanceZones(object["country_code"],1);
      this.getbalanceZones(object["country_code"],2);
      this.getCurves(object["balancing_zone"]);
      
    }
  }
  private dateRangeValidatorFilter: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date = this.filterForm && this.filterForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.filterForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.filterForm.get("date").value.end,
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
      this.errorDateFilter = true;
    } else {
      this.errorDateFilter = false;
    }

    return invalid ? { invalidRange: {} } : null;
  };

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

  getbalanceZones(country, num) {
    this.apiBalanceZone.getAllBalanceZonesByCountry(country).subscribe({
      next: (res) => {
        if (num == 1) {
          this.zoneOptions1 = res;
          if (this.zoneOptions1.length == 0) {
            this.errorBalanceZone1 = true;
          } else {
            this.errorBalanceZone1 = false;
          }
        } else {
          this.zoneOptions2 = res;
          if (this.zoneOptions2.length == 0) {
            this.errorBalanceZone2 = true;
          } else {
            this.errorBalanceZone2 = false;
          }
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
  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "Orders");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "Orders");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }

  onChangeCountry1($event) {
    this.manualUploadForm.controls["balancing_zone_id"].setValue("");
    this.getbalanceZones(this.manualUploadForm.get("country_code").value, 1);
  }
  onChangeCountry2($event) {
    this.generatePricesForm.controls["balancing_zone"].setValue("");
    this.getbalanceZones(this.generatePricesForm.get("country_code").value, 2);
  }

  download() {
    if (this.manualUploadForm.get("typePrice").value == "imbalance") {
      this.apiMarketData
        .getImbalancePricesWorksheetTemplate(
          this.manualUploadForm.get("balancing_zone_id").value
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
              "imbalance_prices_template"
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
    } else if (
      this.manualUploadForm.get("typePrice").value == "purchase_sale"
    ) {
      this.apiMarketData
        .getPurchaseSaleWorksheetTemplate(
          this.manualUploadForm.get("balancing_zone_id").value
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
              "purchase_sale_prices_template"
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
  }
  calculate(first?) {
    if (this.subscriptions.length > 0) {
      this.cancelAllRequests();
    }

    if (first) {
      localStorage.setItem("rgRow_prices", "");
      localStorage.setItem("rgRow_prices_new", "");
      localStorage.setItem("rgCol_prices", "");
      localStorage.setItem("rgCol_prices_new", "");
      localStorage.setItem("currenTab_prices", "");
    }
    this.country = this.generatePricesForm.get("country_code").value;
    this.balancing_zone = this.generatePricesForm.get("balancing_zone").value;
    this.curve = this.generatePricesForm.get("curve").value;
    this.typePrice = this.generatePricesForm.get("typePrice").value;
    this.start_date = this.datepipe.transform(
      this.generatePricesForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.generatePricesForm.get("date").value.end,
      "yyyy-MM-dd"
    );

    localStorage.setItem("country_prices", this.country);
    localStorage.setItem("balance_zone_prices", this.balancing_zone);
    localStorage.setItem("start_date_prices", this.start_date);
    localStorage.setItem("end_date_prices", this.end_date);
    localStorage.setItem("curve_prices", this.curve);
    localStorage.setItem("type_of_prices", this.typePrice);
    if (this.generatePricesForm.get("typePrice").value == "imbalance") {
 
      this.getImbalancePrices(
        this.balancing_zone,
        this.start_date,
        this.end_date
      );
    } else if (
      this.generatePricesForm.get("typePrice").value == "purchase_sale"
    ) {

      this.getPurchaseSalesPrices(this.curve, this.start_date, this.end_date);
    }
  }

  clean(obj) {
    for (var propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      }
    }
    return obj;
  }
  refresh() {
    this.loadingGetPrices = true;
    this.getImbalancePrices(
      this.balancing_zone,
      this.start_date,
      this.end_date
    );
  }
  OnViewPortScroll({ detail }) {
    if (detail.dimension == "rgRow") {
      localStorage.setItem("rgRow_prices", detail.coordinate);
    }
    if (detail.dimension == "rgCol") {
      localStorage.setItem("rgCol_prices", detail.coordinate);
    }
  }
}
