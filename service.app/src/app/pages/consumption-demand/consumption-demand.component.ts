import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import * as XLSX from "xlsx";
import * as moment from "moment";
import { MeasurementUnit } from "../../@core/schemas/measurementUnit";
import {
  FormGroup,
  FormBuilder,
  Validators,
  Form,
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

import { concat } from "rxjs-compat/operator/concat";
import { isThisSecond } from "date-fns";
import NumberColumnType from "@revolist/revogrid-column-numeral";

import { DemandService } from "../../@core/services/demand.service";
import { map } from "rxjs/operators";
import { SupplyPointsAreaService } from "../../@core/services/supplyPointsArea.service";
import { NbAccessChecker } from "@nebular/security";
import { DarkModeService } from "../../@core/services/sharedServices/darkMode.service";
import {  Subscription } from "rxjs";
import { BalanceService } from "../../@core/services/balance.service";

@Component({
  selector: "ngx-consumption-demand",
  templateUrl: "./consumption-demand.component.html",
  styleUrls: ["./consumption-demand.component.scss"],
})
export class ConsumptionDemandComponent implements OnInit {
  fileName: any = "";
  @Input() action1: string;
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
  protected subscriptions: Subscription[] = [];
  @ViewChild("generateConsumptionComparison", { static: true })
  accordionGenerateCosumptionComparison;
  arrayBuffer: any;
  file: File;
  fileValid = false;
  loadingUpload = false;
  loading_upload_array: any = [];
  loadingUploadWebService = false;
  defaultRowPerPage = 20;
  autoUploadForm!: FormGroup;
  manualUploadForm!: FormGroup;
  generateConsumptionCompareForm!: FormGroup;
  dataView: any;
  start_date: any;
  end_date: any;
  errorLegalEntity1: any;
  errorLegalEntity2: any;
  errorLegalEntity3: any;
  errorBalanceZone1 = false;
  errorBalanceZone2 = false;
  errorBalanceZone3 = false;
  entitiesOptions1: any;
  entitiesOptions2: any;
  entitiesOptions3: any;
  objectTemplate = [{}];
  result: any;
  zoneOptions1: any;
  zoneOptions2: any;
  zoneOptions3: any;
  countriesOptions: any;
  measureUnitOptions: MeasurementUnit;
  source: LocalDataSource = new LocalDataSource();
  timestamp: any;
  successes: any;
  creation_errors_count: any;
  mapping_errors_count: any;
  creation_errors: any;
  mapping_errors: any;
  logContainer = false;
  logContainerDiv = false;
  timestampWebService: any;
  successesWebService: any;
  creation_errors_countWebService: any;
  mapping_errors_countWebService: any;
  creation_errorsWebService: any;
  mapping_errorsWebService: any;
  logContainerWebService = false;
  WebServiceAdjustment : any;
  logContainerWebServiceAdjustment : any;
  logContainerWebServiceDiv = false;
  fileNg: any;
  toggleNgModel = false;
  loadingViewConsumption = false;
  errorDate = false;
  country_code: any;
  balancing_zone: any;
  granularity: any;
  date: any;
  legal_entity: any;
  variable1: any;
  variable2: any;
  time_period1: any;
  time_period2: any;
  supplyAreaOptions: any = [];
  supply_areas: any;
  selectedSupplyAreas = [];
  activeTimeperiod1 = false;
  activeTimeperiod2 = false;
  timePeriodOptions = [];
  acceptExtension: any;
  isActiveNOofCasesNo = false;
  errorTimePeriod = false;
  errorSupplyAreas = false;
  errorsSupplyAreas: any;
  supplyAreaEvent: any;
  loadingVisualize = false;
  numeral = NumberColumnType.getNumeralInstance();
  readonly: boolean;
  filterFn: any;
  loadingForm = false;
  loading_form_array: any = [];
  revogridTheme: string;
  granularityValue : any;
  ngOnInit(): void {
    var date1 = new Date();

    date1; //# => Fri Apr 01 2011 11:14:50 GMT+0200 (CEST)

    date1.setDate(date1.getDate() - 2);
    this.darkModeService.isDarkMode == true
    ? (this.revogridTheme = "darkMaterial")
    : (this.revogridTheme = "material");
  this.darkModeService.darkModeChange.subscribe((value) => {
    value == true
      ? (this.revogridTheme = "darkMaterial")
      : (this.revogridTheme = "material");
  });
    this.filterFn = (date) =>
      date <= new Date()
    this.accessChecker
      .isGranted("create", "demand-curves")
      .subscribe((granted) => (this.readonly = !granted));
    var object = localStorage.getItem("settings_parameters");
    this.numeral.locale("es");
    this.accordionGenerateCosumptionComparison.toggle();
    this.autoUploadForm = this.formBuilder.group({
      country_code: new FormControl("", [Validators.required]),
      legal_entity: new FormControl("", [Validators.required]),
      granularity: new FormControl("", [Validators.required]),
      balancing_zone_id: new FormControl("", [Validators.required]),
      logView: new FormControl(false, [Validators.required]),
      consumption_type: new FormControl("", [Validators.required]),
      date: new FormControl("", [Validators.required]),
    });
    this.manualUploadForm = this.formBuilder.group({
      balancing_zone_id: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      legal_entity: new FormControl("", [Validators.required]),
      granularity: new FormControl("", [Validators.required]),
      time_period: new FormControl("", [Validators.required]),
      file: new FormControl("", []),
      logView: new FormControl(false, [Validators.required]),
      consumption_type: new FormControl("", [Validators.required]),
      interval: new FormControl("", [
        Validators.required,
        Validators.pattern(
          /^[+-]?([1-9]{1}[0-9]{0,0}(\.\d{3})*(\,\d{0,0})?|[1-9]{1}\d{0,}(\,\d{0,0})?|0(\,\d{0,0})?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d{0,0}(\.\d{3})*(\,\d{0,0})?|[1-9]{1}\d{0,}(\,\d{0,0})?|0(\,\d{0,0})?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d{0,0}(\.\d{3})*(\,\d{0,0})?|[1-9]{1}\d{0,}(\,\d{0,0})?|0(\,\d{0,0})?|(\,\d{1,2}))\)$/
        ),
        Validators.min(0),
      ]),
    });
    this.generateConsumptionCompareForm = this.formBuilder.group({
      country_code: new FormControl("", [Validators.required]),
      balancing_zone: new FormControl("", [Validators.required]),
      granularity: new FormControl("", [Validators.required]),
      date: new FormControl("", [
        Validators.required,
        this.dateRangeValidatorUpload,
      ]),
      legal_entity: new FormControl("", [Validators.required]),
      variable1: new FormControl("", [Validators.required]),
      variable2: new FormControl("", [Validators.required]),
      time_period1: new FormControl(""),
      time_period2: new FormControl(""),
      supply_area: new FormControl("", [Validators.required]),
    });
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.manualUploadForm
        .get("country_code")
        .setValue(object["country_code"]);
      this.manualUploadForm
        .get("balancing_zone_id")
        .setValue(object["balancing_zone"]);
      this.getbalanceZones1(object["country_code"]);

      this.autoUploadForm.get("country_code").setValue(object["country_code"]);
      this.autoUploadForm
        .get("balancing_zone_id")
        .setValue(object["balancing_zone"]);
      this.getbalanceZones2(object["country_code"]);
    }
    this.country_code = localStorage.getItem("country_con");
    this.balancing_zone = localStorage.getItem("balance_zone_con");
    this.supply_areas = localStorage.getItem("supply_areas_con");
    this.granularity = localStorage.getItem("granularity_con");
    this.start_date = localStorage.getItem("start_date_con");
    this.end_date = localStorage.getItem("end_date_con");
    this.legal_entity = localStorage.getItem("legal_entity_con");
    this.variable1 = localStorage.getItem("variable1_con");
    this.variable2 = localStorage.getItem("variable2_con");
    this.time_period1 = localStorage.getItem("time_period1_con");
    this.time_period2 = localStorage.getItem("time_period2_con");
    if (localStorage.getItem("supply_areas_con")) {
      this.supply_areas = JSON.parse(localStorage.getItem("supply_areas_con"));
    }

    /*     this.autoUploadForm.controls["date"].setValue(
      new Date().setDate(new Date().getDate() - 1)
    );
    this.autoUploadForm.controls["date"].disable(); */
    if (
      this.country_code &&
      this.balancing_zone &&
      this.start_date &&
      this.end_date &&
      this.supply_areas.length > 0 &&
      this.granularity &&
      this.legal_entity &&
      this.variable1 &&
      this.variable2
    ) {
      this.getSupplyAreas(this.balancing_zone);
      this.getbalanceZones3(this.country_code);

      this.generateConsumptionCompareForm.controls["country_code"].setValue(
        this.country_code
      );
      this.generateConsumptionCompareForm.controls["balancing_zone"].setValue(
        Number(this.balancing_zone)
      );

      this.generateConsumptionCompareForm.controls["supply_area"].setValue(
        this.supply_areas
      );
      this.generateConsumptionCompareForm.controls["granularity"].setValue(
        this.granularity
      );
      this.generateConsumptionCompareForm.controls["date"].setValue({
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
      this.generateConsumptionCompareForm.controls["legal_entity"].setValue(
        Number(this.legal_entity)
      );
      this.generateConsumptionCompareForm.controls["variable1"].setValue(
        this.variable1
      );
      this.generateConsumptionCompareForm.controls["variable2"].setValue(
        this.variable2
      );

      this.onChangeVariable1();
      this.onChangeVariable2();

      this.onChangeGranularity2(true, true, true);
    } else {
      if (object) {
        object = JSON.parse(localStorage.getItem("settings_parameters"));
        this.generateConsumptionCompareForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.generateConsumptionCompareForm
          .get("balancing_zone")
          .setValue(object["balancing_zone"]);
        this.getbalanceZones3(object["country_code"]);
        this.getSupplyAreas(object["balancing_zone"]);
      }
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
    private apiDemandService: DemandService,
    private apiSupplyAreas: SupplyPointsAreaService,
    public accessChecker: NbAccessChecker,
    private darkModeService: DarkModeService,
    private apiBalanceService: BalanceService,
  ) {
    this.getCountries();
    this.getLegalEntities();

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
    var consumption_type = this.manualUploadForm.get("consumption_type").value;
    let fileReader = new FileReader();
    this.result = null;
    if (this.manualUploadForm.get("granularity").value == "supply_area") {
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
          .getConsumptionWorksheetTemplate(
            this.manualUploadForm.get("balancing_zone_id").value,
            this.manualUploadForm.get("legal_entity").value,
            consumption_type
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
                  if (Object.keys(x).toString() === Object.keys(j).toString()) {
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
                    } else {
                      if (x[j["label"]] !== null && x[j["label"]] !== "") {
                        x[j["label"]] = x[j["label"]].toString();
                      } else {
                        x[j["label"]] = null;
                      }
                    }
                  });
                });

                var time_period_interval: string =
                  this.manualUploadForm.get("time_period").value.toString() +
                  this.manualUploadForm.get("interval").value.toString();

                this.apiDemandService
                  .uploadConsumptionWorksheet(
                    this.manualUploadForm.get("balancing_zone_id").value,
                    this.manualUploadForm.get("legal_entity").value,
                    time_period_interval.toString(),
                    this.manualUploadForm.get("granularity").value,
                    consumption_type,
                    this.result
                  )
                  .subscribe({
                    next: (res) => {
                      this.messageService.showToast(
                        "info",
                        "Info",
                        "Cousumption have been uploaded, please check the log tab."
                      );

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
                          "Internal server error while uploading consumption"
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
                          "Internal server error while uploading consumption",
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
                    if (this.dataView != null) {
                      this.calculate();
                    }
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
                this.logContainer = true;
              }
            },
            error: (e) => {
              this.loadingUpload = false;
              this.messageService.showToast(
                "danger",
                "Error",
                "No interface available to retreive consumption data for the specified balance zone."
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
                "No interface available to retreive consumption data for the specified balance zone.",
              ];

              this.logContainer = true;
            },
          });
      };
      fileReader.readAsArrayBuffer(this.file);
    } else if (
      this.manualUploadForm.get("granularity").value == "supply_point"
    ) {
      fileReader.onload = (evt) => {
        this.result = evt.target.result.toString();
      };
      fileReader.onloadend = (e) => {
        this.result = [
          {
            xml_message: this.result,
          },
        ];

        var time_period_interval: string =
          this.manualUploadForm.get("time_period").value.toString() +
          this.manualUploadForm.get("interval").value.toString();
        this.apiDemandService
          .uploadConsumptionWorksheet(
            this.manualUploadForm.get("balancing_zone_id").value,
            this.manualUploadForm.get("legal_entity").value,
            time_period_interval.toString(),
            this.manualUploadForm.get("granularity").value,
            consumption_type,
            this.result
          )
          .subscribe({
            next: (res) => {
              this.messageService.showToast(
                "info",
                "Info",
                "Consumption have been uploaded, please check the log tab."
              );

              this.timestamp = new Date(
                new Date().toString().replace(/GMT.*$/, "GMT+0000")
              )
                .toISOString()
                .replace("Z", "")
                .replace("T", " ")
                .split(".")[0];
              this.successes = res["successes"];
              this.creation_errors_count = Object.values(res["errors"]).length;
              this.creation_errors = Object.values(res["errors"]);

              this.logContainer = true;
            },
            error: (e) => {
              this.loadingUpload = false;
              if (e.error.title == "Internal Server Error") {
                this.messageService.showToast(
                  "danger",
                  "Error",
                  "Internal server error while uploading consumption"
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
                  "Internal server error while uploading consumption",
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
            if (this.dataView != null) {
              this.calculate();
            }
          });
      };
      fileReader.readAsText(this.file);
    }

    function getCurrentTimestamp() {
      return Date.now();
    }
  }
  autoUpload() {
    this.loadingUploadWebService = true;
    this.autoUploadForm.controls["logView"].setValue(true);
    this.logContainerWebServiceDiv = true;
    var entity = this.autoUploadForm.get("legal_entity").value;
    var balance_zone = this.autoUploadForm.get("balancing_zone_id").value;
    var granularity = this.autoUploadForm.get("granularity").value;
    var consumption_type = this.autoUploadForm.get("consumption_type").value;
    var date = this.datepipe.transform(
      this.autoUploadForm.get("date").value,
      "yyyy-MM-dd"
    );
    if (granularity == 'balance_zone' && consumption_type == 'adjustment'){
      this.apiBalanceService.getBalanceAdjustmentsTSO(balance_zone, date, date, entity).subscribe({
        next: (res) => {
          this.timestampWebService = new Date(
            new Date().toString().replace(/GMT.*$/, "GMT+0000")
          )
            .toISOString()
            .replace("Z", "")
            .replace("T", " ")
            .split(".")[0];
          this.logContainerWebService = false;
          this.logContainerWebServiceAdjustment = true;
          this.WebServiceAdjustment = Object(res)
          this.messageService.showToast(
            "success",
            "Info",
            "Adjustment for date " + date + " has been uploaded."
          );
        },
        error: (e) => {
          this.loadingUploadWebService = true;
          this.logContainerWebServiceAdjustment = true;
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while uploading consumption"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
       .add(() => {
          this.logContainerWebServiceAdjustment = true;
          this.loadingUploadWebService = false;
      });
    } else { 
      this.apiDemandService
        .getConsumption(balance_zone, granularity, entity, consumption_type, date)
        .subscribe({
          next: (res) => {
            this.timestampWebService = new Date(
              new Date().toString().replace(/GMT.*$/, "GMT+0000")
            )
              .toISOString()
              .replace("Z", "")
              .replace("T", " ")
              .split(".")[0];
            this.logContainerWebServiceAdjustment = false;
            this.logContainerWebService = true;     
            this.successesWebService = res["successes"];
            this.creation_errors_countWebService = Object.values(
              res["errors"]
            ).length;
          this.creation_errorsWebService = Object.values(res["errors"]);
          this.creation_errorsWebService = Object.values(res["errors"]);

          this.logContainer = true;
            this.creation_errorsWebService = Object.values(res["errors"]);

          this.logContainer = true;
            this.messageService.showToast(
              "info",
              "Info",
              "Consumption have been uploaded, please check the log tab."
            );
          },
          error: (e) => {
            this.loadingUploadWebService = false;
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while uploading consumption"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        })
        .add(() => {
          this.logContainerWebService = true;
          this.loadingUploadWebService = false;
        });
      }
  }

  getGranularity(){
    this.granularityValue = this.autoUploadForm.get("granularity").value;      
    return this.granularityValue;
  }

  showOptions(): boolean {
    if (this.getGranularity() == 'supply_point' || this.getGranularity() == 'supply_area'){
      return true;
    }else{
      return false;
    }
  }

  showOptions2(): boolean {
    if (this.getGranularity() == 'supply_point') {
      return true;
    }
    return false;
  }

  getConsumption(
    balancing_zone,
    start_date,
    end_date,
    granularity,
    legal_entity,
    variable1,
    variable2,
    supplyAreas,
    time_period_1?,
    timpe_period_2?
  ) {

    this.errorsSupplyAreas = [];
    const subscription = this.apiDemandService
      .getConsumptionComparison(
        balancing_zone,
        start_date,
        end_date,
        granularity,
        legal_entity,
        variable1,
        variable2,
        supplyAreas,
        time_period_1,
        timpe_period_2
      )
      .pipe(
        map((data) => {
          if (
            localStorage.getItem("rgRow_con") &&
            localStorage.getItem("rgCol_con")
          ) {
            localStorage.setItem(
              "rgRow_con_new",
              localStorage.getItem("rgRow_con")
            );
            localStorage.setItem(
              "rgCol_con_new",
              localStorage.getItem("rgCol_con")
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
                if (
                  keys[i] != "supply_area_label" &&
                  keys[i] != "supply_point_label"
                ) {
                  e[keys[i]] = this.numeral(Number(e[keys[i]].toFixed(2))).format(
                    "0,0.[0000]"
                  );
                }
              }
            });

            x["columns"]?.map((j) => {
              j["sortable"] = true;

              if (
                j["prop"] == "supply_area_label" ||
                j["prop"] == "supply_point_label"
              ) {
                j["size"] = 200;

                j["pin"] = "colPinStart";

                j["columnType"] = "string";
              } else {
                j["size"] = 170;
                j["columnType"] = "numeric";
                j["cellProperties"] = ({ prop, model, data, column }) => {
                  return {
                    class: {
                      numeric: true,
                    },
                  };
                };
              }

              j["children"]?.map((o) => {
                o["size"] = 170;
                o["columnType"] = "numeric";
                o["cellProperties"] = ({ prop, model, data, column }) => {
                  return {
                    class: {
                      numeric: true,
                    },
                  };
                };
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
          this.loadingViewConsumption = false;
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
  
          if (
            isNaN(Number(localStorage.getItem("rgCol_con_new"))) == false &&
            isNaN(Number(localStorage.getItem("rgRow_con_new"))) == false
          ) {
            document.querySelector("revo-grid").scrollToCoordinate({
              x: Number(localStorage.getItem("rgCol_con_new")),
              y: Number(localStorage.getItem("rgRow_con_new")),
            });
          }
        }, 100);
        this.loadingViewConsumption = false;
 
      });

      /*  */
    
  }
  calculate(first?) {
    if(this.subscriptions.length>0){
      this.cancelAllRequests();
    }
    this.loadingViewConsumption = true;

    if (first) {
      localStorage.setItem("rgRow_con", "");
      localStorage.setItem("rgRow_con_new", "");
      localStorage.setItem("rgCol_con", "");
      localStorage.setItem("rgCol_con_new", "");
      localStorage.setItem("currenTab_con", "");
    }
    this.country_code =
      this.generateConsumptionCompareForm.get("country_code").value;
    this.balancing_zone =
      this.generateConsumptionCompareForm.get("balancing_zone").value;
    this.supply_areas =
      this.generateConsumptionCompareForm.get("supply_area").value;
    this.granularity =
      this.generateConsumptionCompareForm.get("granularity").value;
    this.start_date = this.datepipe.transform(
      this.generateConsumptionCompareForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.generateConsumptionCompareForm.get("date").value.end,
      "yyyy-MM-dd"
    );
    this.legal_entity =
      this.generateConsumptionCompareForm.get("legal_entity").value;
    this.variable1 = this.generateConsumptionCompareForm.get("variable1").value;
    this.variable2 = this.generateConsumptionCompareForm.get("variable2").value;
    this.time_period1 =
      this.generateConsumptionCompareForm.get("time_period1").value;
    this.time_period2 =
      this.generateConsumptionCompareForm.get("time_period2").value;

    var supply_areas = [];
    this.supply_areas.map((x) => {
      supply_areas.push(x["id"]);
    });

    localStorage.setItem("country_con", this.country_code);
    localStorage.setItem("balance_zone_con", this.balancing_zone);
    localStorage.setItem("supply_areas_con", JSON.stringify(this.supply_areas));
    localStorage.setItem("granularity_con", this.granularity);
    localStorage.setItem("start_date_con", this.start_date);
    localStorage.setItem("end_date_con", this.end_date);
    localStorage.setItem("legal_entity_con", this.legal_entity);
    localStorage.setItem("variable1_con", this.variable1);
    localStorage.setItem("variable2_con", this.variable2);
    localStorage.setItem("time_period1_con", this.time_period1);
    localStorage.setItem("time_period2_con", this.time_period2);

    this.getConsumption(
      this.balancing_zone,
      this.start_date,
      this.end_date,
      this.granularity,
      this.legal_entity,
      this.variable1,
      this.variable2,
      supply_areas,
      this.time_period1,
      this.time_period2
    );
  }
  reset() {
    this.cancelAllRequests();
    this.generateConsumptionCompareForm.controls["country_code"].setValue("");
    this.generateConsumptionCompareForm.controls["balancing_zone"].setValue("");
    this.generateConsumptionCompareForm.controls["supply_area"].setValue([]);
    this.generateConsumptionCompareForm.controls["granularity"].setValue("");
    this.generateConsumptionCompareForm.controls["date"].setValue("");
    this.generateConsumptionCompareForm.controls["legal_entity"].setValue("");
    this.generateConsumptionCompareForm.controls["variable1"].setValue("");
    this.generateConsumptionCompareForm.controls["variable2"].setValue("");
    this.generateConsumptionCompareForm.controls["time_period1"].setValue("");
    this.generateConsumptionCompareForm.controls["time_period2"].setValue("");
    this.loadingForm = false;
    this.loading_form_array =[];
    this.loadingViewConsumption= false;
    this.zoneOptions3 = [];
    this.supplyAreaOptions = [];
    this.generateConsumptionCompareForm.controls[
      "time_period1"
    ].clearValidators();
    this.generateConsumptionCompareForm.controls[
      "time_period1"
    ].updateValueAndValidity();
    this.activeTimeperiod1 = false;
    this.generateConsumptionCompareForm.controls[
      "time_period2"
    ].clearValidators();
    this.generateConsumptionCompareForm.controls[
      "time_period2"
    ].updateValueAndValidity();
    this.activeTimeperiod2 = false;
    localStorage.setItem("country_con", "");
    localStorage.setItem("balance_zone_con", "");
    localStorage.setItem("supply_areas_con", "");
    localStorage.setItem("granularity_con", "");
    localStorage.setItem("start_date_con", "");
    localStorage.setItem("end_date_con", "");
    localStorage.setItem("legal_entity_con", "");
    localStorage.setItem("variable1_con", "");
    localStorage.setItem("variable2_con", "");
    localStorage.setItem("time_period1_con", "");
    localStorage.setItem("time_period2_con", "");
    this.selectedSupplyAreas = [];
    this.dataView = null;
    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.generateConsumptionCompareForm
        .get("country_code")
        .setValue(object["country_code"]);
      this.generateConsumptionCompareForm
        .get("balancing_zone")
        .setValue(object["balancing_zone"]);
      this.getbalanceZones3(object["country_code"]);
      this.getSupplyAreas(object["balancing_zone"]);
    }
  }

  onToggle($event) {
    var logView = this.manualUploadForm.get("logView").value;

    this.logContainerDiv = !logView;
  }
  onToggle1($event) {
    var logView = this.autoUploadForm.get("logView").value;

    this.logContainerWebServiceDiv = !logView;
  }

  private dateRangeValidatorFilter: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date =
      this.generateConsumptionCompareForm &&
      this.generateConsumptionCompareForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.generateConsumptionCompareForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.generateConsumptionCompareForm.get("date").value.end,
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
  private dateRangeValidatorUpload: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    /*   const date = this.autoUploadForm && this.autoUploadForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.autoUploadForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.autoUploadForm.get("date").value.end,
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
      this.errorDateUpload = true;
    } else {
      this.errorDateUpload = false;
    } */

    return invalid ? { invalidRange: {} } : null;
  };
  getLegalEntities() {
    this.loadingVisualize=true;
    this.loading_form_array[0]=true;
    this.loadingUpload=true;
    this.loading_upload_array[3]=true;
    this.apiLegalEntity
      .getAllLegalEntitiesByCountry(null, "Internal")
      .subscribe({
        next: (res) => {
     
     
            this.entitiesOptions1 = res.sort((a, b) => (a.name > b.name) ? 1 : -1);
            if (this.entitiesOptions1.length == 0) {
              this.errorLegalEntity1 = true;
            } else {
              this.errorLegalEntity1 = false;
            }
     
            this.entitiesOptions2 = res.sort((a, b) => (a.name > b.name) ? 1 : -1);
            if (this.entitiesOptions2.length == 0) {
              this.errorLegalEntity2 = true;
            } else {
              this.errorLegalEntity2 = false;
            }
      
            this.entitiesOptions3 = res.sort((a, b) => (a.name > b.name) ? 1 : -1);
            if (this.entitiesOptions3.length == 0) {
              this.errorLegalEntity3 = true;
            } else {
              this.errorLegalEntity3 = false;
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
        this.loading_form_array[0]=false;
          if(this.loading_form_array.includes(true)==false){
            this.loadingVisualize=false
            this.loading_form_array=[];
          }
          this.loading_upload_array[3]=false;
          if(this.loading_upload_array.includes(true)==false){
            this.loadingUpload=false
            this.loading_upload_array=[];
          }
        });
  }
  getCountries() {
    this.loadingVisualize=true;
    this.loading_form_array[1]=true;
    this.loadingUpload=true;
    this.loading_upload_array[0]=true;
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
      this.loading_form_array[1]=false;
        if(this.loading_form_array.includes(true)==false){
          this.loadingVisualize=false
          this.loading_form_array=[];
        }
        this.loading_upload_array[0]=false;
        if(this.loading_upload_array.includes(true)==false){
          this.loadingUpload=false
          this.loading_upload_array=[];
        }
      });
  }

  getbalanceZones1(country) {

    this.loadingUpload=true;
    this.loading_upload_array[1]=true;
    this.apiBalanceZone.getAllBalanceZonesByCountry(country).subscribe({
      next: (res) => {
      
          this.zoneOptions1 = res;
          if (this.zoneOptions1.length == 0) {
            this.errorBalanceZone1 = true;
          } else {
            this.errorBalanceZone1 = false;
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

        this.loading_upload_array[1]=false;
        if(this.loading_upload_array.includes(true)==false){
          this.loadingUpload=false
          this.loading_upload_array=[];
        }
      });
  }
  
  getbalanceZones2(country) {

    this.loadingUpload=true;
    this.loading_upload_array[2]=true;
    this.apiBalanceZone.getAllBalanceZonesByCountry(country).subscribe({
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
    }).add(() => {

        this.loading_upload_array[2]=false;
        if(this.loading_upload_array.includes(true)==false){
          this.loadingUpload=false
          this.loading_upload_array=[];
        }
      });
  }
  getbalanceZones3(country) {
    this.loadingVisualize=true;
    this.loading_form_array[2]=true;
    this.apiBalanceZone.getAllBalanceZonesByCountry(country).subscribe({
      next: (res) => {
       
          this.zoneOptions3 = res;
          if (this.zoneOptions3.length == 0) {
            this.errorBalanceZone3 = true;
          } else {
            this.errorBalanceZone3 = false;
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
          this.loadingVisualize=false
          this.loading_form_array=[];
        }
      });
  }

  

  exportAsXLSX() {
    document
      .querySelector("revo-grid")
      .getSource()
      .then((value) => {
        this.excelService.exportAsExcelFile(
          value,
          "consumption_" +
            this.start_date +
            "_" +
            this.end_date +
            "_" +
            this.granularity
        );
      });
  }
  exportAsCSV() {
    (document.querySelectorAll("revo-grid") as any).forEach((element) => {
      element.getPlugins().then((plugins) => {
        plugins.forEach((p) => {
          if (p.exportFile) {
            const exportPlugin = p;
            exportPlugin.exportFile({
              filename:
                "consumption_" +
                this.start_date +
                "_" +
                this.end_date +
                "_" +
                this.granularity,
            });
          }
        });
      });
    });
  }

  onChangeCountry1($event) {
    this.manualUploadForm.controls["balancing_zone_id"].setValue("");
    this.getbalanceZones1(this.manualUploadForm.get("country_code").value);
  }
  onChangeCountry2($event) {
    this.autoUploadForm.controls["balancing_zone_id"].setValue("");
    this.getbalanceZones2(this.autoUploadForm.get("country_code").value);
  }
  onChangeCountry3($event) {
    this.generateConsumptionCompareForm.controls["balancing_zone"].setValue("");
    this.getbalanceZones3(
      this.generateConsumptionCompareForm.get("country_code").value
    );
  }

  download() {
    var consumption_type = this.manualUploadForm.get("consumption_type").value;
    this.apiDemandService
      .getConsumptionWorksheetTemplate(
        this.manualUploadForm.get("balancing_zone_id").value,
        this.manualUploadForm.get("legal_entity").value,
        consumption_type
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
            "consumption_template" +
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
  onChangeBalanceZone($event) {
    this.supplyAreaOptions = [];
    this.generateConsumptionCompareForm.controls["supply_area"].setValue([]);
    this.selectedSupplyAreas = [];
    this.getSupplyAreas(
      this.generateConsumptionCompareForm.get("balancing_zone").value,
      "change"
    );
    this.onChangeGranularity1();
  }
  getSupplyAreas(zone, change?) {
    this.loadingVisualize=true;
    this.loading_form_array[3]=true;
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
        },
      })
      .add(() => {
        this.selectedSupplyAreas = this.supply_areas;
        if (change) {
          this.selectedSupplyAreas = [];
        }
        this.loading_form_array[3]=false;
          if(this.loading_form_array.includes(true)==false){
            this.loadingVisualize=false
            this.loading_form_array=[];
          }
      });
   
  }
  onChangeVariable1() {
    this.generateConsumptionCompareForm.get("time_period1").setValue("");
    this.generateConsumptionCompareForm.controls[
      "time_period1"
    ].updateValueAndValidity();
    var variable1 = this.generateConsumptionCompareForm.get("variable1").value;
    if (variable1 == "Demand") {
      this.generateConsumptionCompareForm.controls[
        "time_period1"
      ].clearValidators();
      this.generateConsumptionCompareForm.controls[
        "time_period1"
      ].updateValueAndValidity();
      this.activeTimeperiod1 = false;
    } else if (variable1 == "Consumption") {
      this.onChangeGranularity2(null, true);
      this.generateConsumptionCompareForm.controls[
        "time_period1"
      ].addValidators(Validators.required);
      this.generateConsumptionCompareForm.controls[
        "time_period1"
      ].updateValueAndValidity();
      this.activeTimeperiod1 = true;
    }
  }
  onChangeVariable2() {
    var variable2 = this.generateConsumptionCompareForm.get("variable2").value;
    this.generateConsumptionCompareForm.get("time_period2").setValue("");
    this.generateConsumptionCompareForm.controls[
      "time_period2"
    ].updateValueAndValidity();
    if (variable2 == "Demand") {
      this.generateConsumptionCompareForm.controls[
        "time_period2"
      ].clearValidators();
      this.generateConsumptionCompareForm.controls[
        "time_period2"
      ].updateValueAndValidity();
      this.activeTimeperiod2 = false;
    } else if (variable2 == "Consumption") {
      this.onChangeGranularity2(null, null, true);
      this.generateConsumptionCompareForm.controls[
        "time_period2"
      ].setValidators(Validators.required);
      this.generateConsumptionCompareForm.controls[
        "time_period2"
      ].updateValueAndValidity();
      this.activeTimeperiod2 = true;
    }
  }
  onChangeGranularity1() {
    var granularity = this.manualUploadForm.get("granularity").value;
    if (granularity == "supply_area") {
      // this.timePeriodOptions = [{label: 'D+1', value: 'D1'}];
      this.acceptExtension = ".xlsx";
    } else if (granularity == "supply_point") {
      this.acceptExtension = ".xml";
      // this.timePeriodOptions = [{label: 'D+1', value: 'D1'},{label: 'M+1', value: 'M1'},{label: 'M+3', value: 'M3'},{label: 'M+15', value: 'M15'}];
    }
  }
  onChangeGranularity2(change?, time_period1?, time_period2?) {
    var granularity =
      this.generateConsumptionCompareForm.get("granularity").value;
    var balancing_zone =
      this.generateConsumptionCompareForm.get("balancing_zone").value;
    var supply_areas =
      this.generateConsumptionCompareForm.get("supply_area").value;
    var supply_areas_temp = [];
    supply_areas.map((x) => {
      supply_areas_temp.push(x["id"]);
    });
    var start_date = this.datepipe.transform(
      this.generateConsumptionCompareForm.get("date").value.start,
      "yyyy-MM-dd"
    );

    var end_date = this.datepipe.transform(
      this.generateConsumptionCompareForm.get("date").value.end,
      "yyyy-MM-dd"
    );
    var legal_entity =
      this.generateConsumptionCompareForm.get("legal_entity").value;
    this.timePeriodOptions = [];
    var variable1 = this.generateConsumptionCompareForm.get("variable1").value;
    var variable2 = this.generateConsumptionCompareForm.get("variable2").value;

    if (
      granularity == "supply_area" &&
      balancing_zone &&
      legal_entity &&
      start_date &&
      end_date &&
      supply_areas.length > 0 &&
      (variable1 == "Consumption" || variable2 == "Consumption")
    ) {
      this.generateConsumptionCompareForm.get("time_period1").setValue("");
      this.generateConsumptionCompareForm.get("time_period2").setValue("");
      this.loadingVisualize = true;
      this.apiDemandService
        .getConsumptionTypes(
          balancing_zone,
          legal_entity,
          start_date,
          end_date,
          supply_areas_temp
        )
        .subscribe({
          next: (res) => {
            this.timePeriodOptions = res;

            if (this.timePeriodOptions.length == 0) {
              this.errorTimePeriod = true;
            } else {
              this.errorTimePeriod = false;
            }
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while getting time periods"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        })
        .add(() => {
          if (change) {
            if (this.time_period1) {
              this.generateConsumptionCompareForm.controls[
                "time_period1"
              ].setValue(this.time_period1);
              this.generateConsumptionCompareForm.controls[
                "time_period1"
              ].updateValueAndValidity();
            }
            if (this.time_period2) {
              this.generateConsumptionCompareForm.controls[
                "time_period2"
              ].setValue(this.time_period2);
              this.generateConsumptionCompareForm.controls[
                "time_period2"
              ].updateValueAndValidity();
            }
            this.calculate();
          }
          this.loadingVisualize = false;
        });
    } else if (
      granularity == "supply_area" &&
      balancing_zone &&
      legal_entity &&
      start_date &&
      end_date &&
      supply_areas.length > 0 &&
      (variable1 == "Demand" || variable2 == "Demand")
    ) {
      if (change) {
        this.calculate();
      }
    } else if (granularity == "supply_point") {
      this.generateConsumptionCompareForm.get("time_period1").setValue("");
      this.generateConsumptionCompareForm.get("time_period2").setValue("");
      this.errorTimePeriod = false;
      this.timePeriodOptions = ["D+1"];

      if (change) {
        if (this.time_period1) {
          this.generateConsumptionCompareForm.controls["time_period1"].setValue(
            this.time_period1
          );
          this.generateConsumptionCompareForm.controls[
            "time_period1"
          ].updateValueAndValidity();
        }
        if (this.time_period2) {
          this.generateConsumptionCompareForm.controls["time_period2"].setValue(
            this.time_period2
          );
          this.generateConsumptionCompareForm.controls[
            "time_period2"
          ].updateValueAndValidity();
        }
        this.calculate();
      }
    }
  }
  OnViewPortScroll({ detail }) {
    if (detail.dimension == "rgRow") {
      localStorage.setItem("rgRow_con", detail.coordinate);
    }
    if (detail.dimension == "rgCol") {
      localStorage.setItem("rgCol_con", detail.coordinate);
    }
  }
  onChangeLegalEntity() {
    var supply_areas =
      this.generateConsumptionCompareForm.get("supply_area").value;
    if (supply_areas) {
      this.onChangeGranularity2();
    }
  }
  onChangeSupplyAreas($event) {
    this.onChangeGranularity2();
  }
  onChangeRangePicker() {
    var variable1 = this.generateConsumptionCompareForm.get("variable1").value;
    var variable2 = this.generateConsumptionCompareForm.get("variable2").value;
    var granularity =
      this.generateConsumptionCompareForm.get("granularity").value;
    var balancing_zone =
      this.generateConsumptionCompareForm.get("balancing_zone").value;
    var supply_areas =
      this.generateConsumptionCompareForm.get("supply_area").value;
    var supply_areas_temp = [];
    if (supply_areas) {
      supply_areas.map((x) => {
        supply_areas_temp.push(x["id"]);
      });
    }

    var start_date = this.datepipe.transform(
      this.generateConsumptionCompareForm.get("date").value.start,
      "yyyy-MM-dd"
    );

    var end_date = this.datepipe.transform(
      this.generateConsumptionCompareForm.get("date").value.end,
      "yyyy-MM-dd"
    );
    var legal_entity =
      this.generateConsumptionCompareForm.get("legal_entity").value;
    if (
      granularity == "supply_area" &&
      balancing_zone &&
      legal_entity &&
      start_date &&
      end_date &&
      supply_areas.length > 0 &&
      (variable1 == "Consumption" || variable2 == "Consumption")
    ) {
      this.timePeriodOptions = [];
      this.generateConsumptionCompareForm.get("time_period1").setValue("");
      this.generateConsumptionCompareForm.get("time_period2").setValue("");
      this.loadingVisualize = true;
      this.apiDemandService
        .getConsumptionTypes(
          balancing_zone,
          legal_entity,
          start_date,
          end_date,
          supply_areas_temp
        )
        .subscribe({
          next: (res) => {
            this.timePeriodOptions = res;

            if (this.timePeriodOptions.length == 0) {
              this.errorTimePeriod = true;
            } else {
              this.errorTimePeriod = false;
            }
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while getting time periods"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        })
        .add(() => {
          this.loadingVisualize = false;
        });
    }
  }
  onChangeTimePeriod() {
    var time_period = this.manualUploadForm.get("time_period").value;

    if (time_period == "D") {
      this.manualUploadForm.controls["interval"].setValue(1);
      this.manualUploadForm.controls["interval"].disable();
    } else {
      this.manualUploadForm.controls["interval"].setValue("");
      this.manualUploadForm.controls["interval"].enable();
    }
  }
  refresh() {
    this.loadingViewConsumption=true;
    this.country_code = localStorage.getItem("country_con");
    this.balancing_zone = localStorage.getItem("balance_zone_con");
    this.supply_areas = localStorage.getItem("supply_areas_con");
    this.granularity = localStorage.getItem("granularity_con");
    this.start_date = localStorage.getItem("start_date_con");
    this.end_date = localStorage.getItem("end_date_con");
    this.legal_entity = localStorage.getItem("legal_entity_con");
    this.variable1 = localStorage.getItem("variable1_con");
    this.variable2 = localStorage.getItem("variable2_con");
    this.time_period1 = localStorage.getItem("time_period1_con");
    this.time_period2 = localStorage.getItem("time_period2_con");
    var supply_areas_temp;
    if (localStorage.getItem("supply_areas_con")) {
      supply_areas_temp = JSON.parse(localStorage.getItem("supply_areas_con"));
    }
    var supply_areas = [];
    supply_areas_temp.map((x) => {
      supply_areas.push(x["id"]);
    });
    this.getConsumption(
      this.balancing_zone,
      this.start_date,
      this.end_date,
      this.granularity,
      this.legal_entity,
      this.variable1,
      this.variable2,
      supply_areas,
      this.time_period1,
      this.time_period2
    );
  }

  ngOnDestroy(){
    this.cancelAllRequests();
  }
}
