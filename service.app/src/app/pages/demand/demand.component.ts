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
import { DemandService } from "../../@core/services/demand.service";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";
import { messageService } from "../../@core/utils/messages";
import * as moment from "moment";
import * as XLSX from "xlsx";
import { SupplyPointsAreaService } from "../../@core/services/supplyPointsArea.service";
import { map } from "rxjs/operators";
import NumberColumnType from "@revolist/revogrid-column-numeral";

import { NbDialogService } from "@nebular/theme";
import { DialogExportDemandComponent } from "./dialog-export-demand/dialog-export-demand.component";
import { LegalEntityService } from "../../@core/services/legalEntity.service";

import { Observable, Subscription, of } from "rxjs";
import { NbAccessChecker } from "@nebular/security";
import { DarkModeService } from "../../@core/services/sharedServices/darkMode.service";
@Component({
  selector: "ngx-demand",
  templateUrl: "./demand.component.html",
  styleUrls: ["./demand.component.scss"],
})
export class DemandComponent implements OnInit {
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
  generateDemandForm!: FormGroup;
  downloadForm!: FormGroup;
  supplyAreaOptions: any = [];
  loadingViewDemand = false;
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
  @ViewChild("generateDemand", { static: true })
  accordionGenerateDemand;
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
    private apiDemandService: DemandService,
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
      .isGranted("create", "demand-curves")
      .subscribe((granted) => (this.readonly = !granted));
    this.numeral.locale("es");
    this.accordionGenerateDemand.toggle();

    var object = localStorage.getItem("settings_parameters");
    this.manualUploadForm = this.formBuilder.group({
      balancing_zone_id: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      file: new FormControl("", []),
      logView: new FormControl(false, [Validators.required]),
      diarization_algorithm: new FormControl("", [Validators.required]),
      create: new FormControl(false, [Validators.required]),
      point_type: new FormControl("", [Validators.required]),
      legal_entity: new FormControl("", [Validators.required]),
      granularity: new FormControl("", [Validators.required]),
    });
    this.downloadForm = this.formBuilder.group({
      date: new FormControl("", [
        Validators.required,
        this.dateRangeValidator1,
      ]),
    });
    this.generateDemandForm = this.formBuilder.group({
      country_code: new FormControl("", [Validators.required]),
      balancing_zone: new FormControl("", [Validators.required]),
      supply_area: new FormControl([], [Validators.required]),
      granularity: new FormControl("", [Validators.required]),
      date: new FormControl("", [
        Validators.required,
        this.dateRangeValidator2,
      ]),
      legal_entity: new FormControl("", [Validators.required]),
    });
    this.country = localStorage.getItem("country_de");
    this.balancing_zone = localStorage.getItem("balance_zone_de");

    if (localStorage.getItem("supply_areas_de")) {
      this.supply_areas = JSON.parse(localStorage.getItem("supply_areas_de"));
    }
    this.start_date = localStorage.getItem("start_date_de");
    this.end_date = localStorage.getItem("end_date_de");
    this.granularity = localStorage.getItem("granularity_de");
    this.legal_entity = localStorage.getItem("legal_entity_de");

    if (
      this.country &&
      this.balancing_zone &&
      this.start_date &&
      this.end_date &&
      this.supply_areas.length > 0 &&
      this.granularity &&
      this.legal_entity
    ) {
      this.getSupplyAreas(this.balancing_zone);
      this.getbalanceZones2(this.country);

      this.generateDemandForm.controls["supply_area"].setValue(
        this.supply_areas
      );

      this.generateDemandForm.controls["country_code"].setValue(this.country);
      this.generateDemandForm.controls["balancing_zone"].setValue(
        Number(this.balancing_zone)
      );

      this.generateDemandForm.controls["granularity"].setValue(
        this.granularity
      );
      this.generateDemandForm.controls["legal_entity"].setValue(
        Number(this.legal_entity)
      );
      this.generateDemandForm.controls["date"].setValue({
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
        this.generateDemandForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.generateDemandForm
          .get("balancing_zone")
          .setValue(object["balancing_zone"]);
        this.getbalanceZones2(object["country_code"]);
        this.getSupplyAreas(object["balancing_zone"]);
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
      this.apiDemandService
        .getDemandWorksheetTemplate(
          this.manualUploadForm.get("balancing_zone_id").value,
          "2022-01-01",
          "2022-01-01",
          this.manualUploadForm.get("granularity").value
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
                res.pop();
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

              this.apiDemandService
                .uploadDemandWorksheet(
                  this.manualUploadForm.get("balancing_zone_id").value,
                  this.manualUploadForm.get("diarization_algorithm").value,
                  this.manualUploadForm.get("legal_entity").value,
                  this.manualUploadForm.get("granularity").value,
                  this.manualUploadForm.get("point_type").value,
                  !this.manualUploadForm.get("create").value,
                  this.result
                )
                .subscribe({
                  next: (res) => {
                    this.messageService.showToast(
                      "info",
                      "Info",
                      "Demand has been uploaded, please check the log tab."
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
                        "Internal server error while uploading demand",
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
    this.apiDemandService
      .getDemandWorksheetTemplate(
        this.manualUploadForm.get("balancing_zone_id").value,
        this.datepipe.transform(
          this.downloadForm.get("date").value.start,
          "yyyy-MM-dd"
        ),
        this.datepipe.transform(
          this.downloadForm.get("date").value.end,
          "yyyy-MM-dd"
        ),
        this.manualUploadForm.get("granularity").value
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
            "demand_template_" +
              this.manualUploadForm.get("balancing_zone_id").value
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
      this.generateDemandForm && this.generateDemandForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.generateDemandForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.generateDemandForm.get("date").value.end,
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
    this.generateDemandForm.controls["balancing_zone"].setValue("");
    this.generateDemandForm.controls["supply_area"].setValue([]);
    this.supplyAreaOptions = [];
    this.selectedSupplyAreas = [];
    this.getbalanceZones2(this.generateDemandForm.get("country_code").value);
  }
  onChangeBalanceZone2($event) {
    this.supplyAreaOptions = [];
    this.generateDemandForm.controls["supply_area"].setValue([]);
    this.supplyAreaOptions = [];
    this.selectedSupplyAreas = [];
    this.getSupplyAreas(
      this.generateDemandForm.get("balancing_zone").value,
      "change"
    );
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

  getDemand(
    balancing_zone,
    start_date,
    end_date,
    granularity,
    supplyAreas,
    legal_entity
  ) {
    this.errorsSupplyAreas = [];
    const subscription = this.apiDemandService
      .getDemand(
        balancing_zone,
        start_date,
        end_date,
        granularity,
        legal_entity,
        supplyAreas
      )
      .pipe(
        map((data) => {
          if (
            localStorage.getItem("rgRow_de") &&
            localStorage.getItem("rgCol_de")
          ) {
            localStorage.setItem(
              "rgRow_de_new",
              localStorage.getItem("rgRow_de")
            );
            localStorage.setItem(
              "rgCol_de_new",
              localStorage.getItem("rgCol_de")
            );
          }

          data["errors"].map((x) => {
            this.errorsSupplyAreas.push(
              Object.keys(x).toString().replace("Error: ", "")
            );
          });
          this.errorsSupplyAreas = this.errorsSupplyAreas
            .toString()
            .replaceAll(",", ", ");
          return data["data"].map((x, index) => {
            x["rows"]?.map((e, index) => {
              var keys = Object.keys(e);
              for (let i in keys) {
                if (keys[i] != "SUPPLY_AREAS" && keys[i] != "SUPPLY_POINTS") {
                  e[keys[i]] = this.numeral(
                    Number(e[keys[i]].toFixed(5))
                  ).format("0,0.[00000]");
                }
              }
            });

            x["columns"]?.map((j) => {
              j["sortable"] = true;

              if (j["prop"] == "SUPPLY_AREAS" || j["prop"] == "SUPPLY_POINTS") {
                j["size"] = 200;

                j["pin"] = "colPinStart";

                j["columnType"] = "string";
              } else {
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
          this.loadingViewDemand = false;
          this.dataView = null;

          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting demand"
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
        /*     document.querySelectorAll("revo-grid").forEach((element) => {
          element.columnTypes=  { 'numeric': new NumberColumnType('0,0.[0000]') }
          }); */

        if (
          isNaN(Number(localStorage.getItem("rgCol_de_new"))) == false &&
          isNaN(Number(localStorage.getItem("rgRow_de_new"))) == false
        ) {
          document.querySelector("revo-grid").scrollToCoordinate({
            x: Number(localStorage.getItem("rgCol_de_new")),
            y: Number(localStorage.getItem("rgRow_de_new")),
          });
        }
      }, 100);
      this.loadingViewDemand = false;
    });
  }
  calculate(first?) {
    if (this.subscriptions.length > 0) {
      this.cancelAllRequests();
    }
    this.validateRevogrid = true;
    this.loadingViewDemand = true;
    if (first) {
      localStorage.setItem("rgRow_de", "");
      localStorage.setItem("rgRow_de_new", "");
      localStorage.setItem("rgCol_de", "");
      localStorage.setItem("rgCol_de_new", "");
      localStorage.setItem("currenTab_de", "");
    }
    this.country = this.generateDemandForm.get("country_code").value;
    this.balancing_zone = this.generateDemandForm.get("balancing_zone").value;
    this.supply_areas = this.generateDemandForm.get("supply_area").value;
    this.granularity = this.generateDemandForm.get("granularity").value;
    this.start_date = this.datepipe.transform(
      this.generateDemandForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.generateDemandForm.get("date").value.end,
      "yyyy-MM-dd"
    );
    this.legal_entity = this.generateDemandForm.get("legal_entity").value;

    localStorage.setItem("country_de", this.country);
    localStorage.setItem("balance_zone_de", this.balancing_zone);
    var supply_areas = [];
    this.supply_areas.map((x) => {
      supply_areas.push(x["id"]);
    });

    localStorage.setItem("supply_areas_de", JSON.stringify(this.supply_areas));
    localStorage.setItem("granularity_de", this.granularity);
    localStorage.setItem("start_date_de", this.start_date);
    localStorage.setItem("end_date_de", this.end_date);
    localStorage.setItem("legal_entity_de", this.legal_entity);

    this.getDemand(
      this.balancing_zone,
      this.start_date,
      this.end_date,
      this.granularity,
      supply_areas,
      this.legal_entity
    );
  }
  reset() {
    this.cancelAllRequests();
    this.generateDemandForm.controls["country_code"].setValue("");
    this.generateDemandForm.controls["balancing_zone"].setValue("");
    this.generateDemandForm.controls["supply_area"].setValue([]);
    this.generateDemandForm.controls["granularity"].setValue("");
    this.generateDemandForm.controls["date"].setValue("");
    this.generateDemandForm.controls["legal_entity"].setValue("");
    this.zoneOptions = [];
    this.supplyAreaOptions = [];
    localStorage.setItem("country_de", "");
    localStorage.setItem("balance_zone_de", "");
    localStorage.setItem("supply_areas_de", "");
    localStorage.setItem("granularity_de", "");
    localStorage.setItem("start_date_de", "");
    localStorage.setItem("end_date_de", "");
    localStorage.setItem("legal_entity_de", "");
    this.selectedSupplyAreas = [];
    this.dataView = null;
    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.generateDemandForm
        .get("country_code")
        .setValue(object["country_code"]);
      this.generateDemandForm
        .get("balancing_zone")
        .setValue(object["balancing_zone"]);
      this.getbalanceZones2(object["country_code"]);
      this.getSupplyAreas(object["balancing_zone"]);
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
      } else {
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

  onAfterEdit({ detail }) {
    this.eventTimes.push("Called");
    if (this.eventTimes.length == 1) {
      var supply_areas = [];
      this.supply_areas.map((x) => {
        supply_areas.push(x["id"]);
      });
      if (this.validateRevogrid == true) {
        this.loadingViewDemand = true;
        if (detail.model !== undefined) {
          const arrayObject = [];
          const object = {};
          object["dem_date"] = detail.prop.replace("DATE_", "");
          object["cups"] = detail.model.SUPPLY_POINTS;
          // toString().replace(/\./g, '').replace(',', '.')
          object["dem_value"] = Number(
            detail.val.toString().replace(/\./g, "").replace(",", ".")
          );

          arrayObject.push(object);

          this.apiDemandService
            .setDailyDemand(this.balancing_zone, this.legal_entity, arrayObject)
            .subscribe({
              next: (res) => {
                this.getDemand(
                  this.balancing_zone,
                  this.start_date,
                  this.end_date,
                  this.granularity,
                  supply_areas,
                  this.legal_entity
                );

                this.messageService.showToast(
                  "success",
                  "Success",
                  "Demand updated successfully!"
                );
                // setTimeout(() => this.loading = false, 3000);
              },
              error: (e) => {
                if (e.error.title == "Internal Server Error") {
                  this.messageService.showToast(
                    "danger",
                    "Error",
                    "Internal server error while updating Demand"
                  );
                } else {
                  this.messageService.showToast("danger", "Error", e.error);
                }
              },
            });
        } else if (detail.models !== undefined) {
          const arrayObject = [];

          for (const data in detail.data) {
            for (const prop in Object.keys(detail.data[data])) {
              const object = {};
              object["dem_date"] = Object.keys(detail.data[data])[prop].replace(
                "DATE_",
                ""
              );
              object["dem_value"] = Number(
                Object.values(detail.data[data])
                  [prop].toString()
                  .replace(/\./g, "")
                  .replace(",", ".")
              );
              object["cups"] = detail.models[data].SUPPLY_POINTS;

              arrayObject.push(object);
            }
          }

          this.apiDemandService
            .setDailyDemand(this.balancing_zone, this.legal_entity, arrayObject)
            .subscribe({
              next: (res) => {
                this.getDemand(
                  this.balancing_zone,
                  this.start_date,
                  this.end_date,
                  this.granularity,
                  supply_areas,
                  this.legal_entity
                );

                this.messageService.showToast(
                  "success",
                  "Success",
                  "Demand updated successfully!"
                );
                // setTimeout(() => this.loading = false, 3000);
              },
              error: (e) => {
                if (e.error.title == "Internal Server Error") {
                  this.messageService.showToast(
                    "danger",
                    "Error",
                    "Internal server error while updating Demand"
                  );
                } else {
                  this.messageService.showToast("danger", "Error", e.error);
                }
              },
            });
        }
      }
    } else {
      this.eventTimes = [];
    }
  }

  exportAsCSV() {
    (document.querySelectorAll("revo-grid") as any).forEach((element) => {
      element.getPlugins().then((plugins) => {
        plugins.forEach((p) => {
          if (p.exportFile) {
            const exportPlugin = p;
            exportPlugin.exportFile({
              filename: "demand_" + this.start_date + "_" + this.end_date,
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
          "demand_" + this.start_date + "_" + this.end_date
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
  onChangeGranularity($event) {
    if ($event == "Daily") {
      this.manualUploadForm.get("diarization_algorithm").clearValidators();
      this.manualUploadForm
        .get("diarization_algorithm")
        .updateValueAndValidity();
    } else {
      this.manualUploadForm
        .get("diarization_algorithm")
        .setValidators([Validators.required]);
      this.manualUploadForm
        .get("diarization_algorithm")
        .updateValueAndValidity();
    }
  }
  openDownloadDialog() {
    this.dialogService.open(DialogExportDemandComponent, {
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
      localStorage.setItem("rgRow_de", detail.coordinate);
    }
    if (detail.dimension == "rgCol") {
      localStorage.setItem("rgCol_de", detail.coordinate);
    }
  }
  refresh() {
    this.loadingViewDemand = true;
    var balancing_zone = localStorage.getItem("balance_zone_de");
    var supply_areas_temp;
    if (localStorage.getItem("supply_areas_de")) {
      supply_areas_temp = JSON.parse(localStorage.getItem("supply_areas_de"));
    }
    var supply_areas = [];
    supply_areas_temp.map((x) => {
      supply_areas.push(x["id"]);
    });
    var start_date = localStorage.getItem("start_date_de");
    var end_date = localStorage.getItem("end_date_de");
    var granularity = localStorage.getItem("granularity_de");
    var legal_entity = localStorage.getItem("legal_entity_de");
    this.getDemand(
      balancing_zone,
      start_date,
      end_date,
      granularity,
      supply_areas,
      legal_entity
    );
  }
  ngOnDestroy() {
    this.cancelAllRequests();
  }
}
