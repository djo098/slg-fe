import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef, NbDialogService } from "@nebular/theme";
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
  NumberValueAccessor,
} from "@angular/forms";
import { DialogContractComponent } from "./dialog-contract/dialog-contract.component";
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

import { DialogConfirmationComponent } from "../../@theme/components/confirmation-dialog/dialog-confirmation-delete.component";
import { JobsService } from "../../@core/services/jobs.service";
import { NbAccessChecker } from "@nebular/security";
@Component({
  selector: "ngx-contract",
  templateUrl: "./contract.component.html",
  styleUrls: ["./contract.component.scss"],
})
export class ContractComponent implements OnInit {
  fileName: any = "";
  @Input() action1: string;
  arrayBuffer: any;
  file: File;
  fileValid = false;
  loadingUpload = false;
  loading = false;
  defaultRowPerPage = 10;
  filterForm!: FormGroup;
  autoUploadForm!: FormGroup;
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
  fileNg: any;
  toggleNgModel = false;
  dependencies: any;
  loadingGetContracts = false;
  numeral = NumberColumnType.getNumeralInstance();
  rows: any;
  filterEvent = false;
  waitDependencies = false;
  waitNominations = false;
  optionsPager: any;
  selected: any;
  settings = {
    mode: "external",
    actions: {
      add: false,
      edit: false,
      delete: false,

      custom: [
        {
          name: "edit",
          title: '<i class="fas fa-pen fa-xs" title="Edit"></i>',
        },
        {
          name: "view",
          title: '<i class="fas fa-eye fa-sm" title="View"></i>',
        },
        {
          name: "delete",
          title: '<i class="fas fa-trash fa-xs" title="Delete"></i>',
        }
        
      ],
    },
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
    },

    /*  add: {
      addButtonContent: '<i class="nb-plus"></i>',
    },
    edit: {
      editButtonContent: '<i class="fas fa-pen fa-xs" title="Edit"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="far fa-eye"></i>',
    }, */

    columns: {
      id: {
        title: "Id",
        type: "number",
        hide: true,
      },
      label: {
        title: "Contract Code",
        type: "string",
      },
      addendum: {
        title: "Addendum",
        type: "string",
      },
      owner: {
        title: "Owner",
        type: "string",
      },
      tso: {
        title: "TSO",
        type: "string",
      },
      service: {
        title: "Service",
        type: "string",
      },
      element_type: {
        title: "Element type",
        type: "string",
      },
      infrastructure: {
        title: "Infrastructure",
        type: "string",
      },
      duration_type: {
        title: "Duration Type",
        type: "string",
      },
      start_date: {
        title: "Start Date",
        type: "string",
        filter: false,
      },
      end_date: {
        title: "End Date",
        type: "string",
        filter: false,
      },
      total_capacity_volume: {
        title: "Total capacity",
        type: "number",
        valuePrepareFunction: (value) => {
          return this.numeral(value).format("0,0.[0000000000]");
        },
      },
      total_capacity_unit: {
        title: "Unit",
        type: "number",
        filter: false,
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
  timestamp1: string;
  successes1: any;
  creation_errors_count1: any;
  creation_errors1 = [];
  logContainer1: boolean;
  logContainerDiv1: boolean;
  loadingDownload: boolean;

  ngOnInit(): void {
    this.accessChecker
      .isGranted("create", "logistic-contracts")
      .subscribe((granted) =>
        granted == false
          ? this.settings.actions.custom.map((x, index) => {
              x.name == "edit"
                ? this.settings.actions.custom.splice(index, 1)
                : "";
              return x;
            })
          : ""
      );
    this.accessChecker
      .isGranted("create", "logistic-contracts")
      .subscribe((granted) => (this.settings.actions.add = granted));
    this.accessChecker
      .isGranted("remove", "logistic-contracts")
      .subscribe((granted) =>
        granted == false
          ? this.settings.actions.custom.map((x, index) => {
              x.name == "delete"
                ? this.settings.actions.custom.splice(index, 1)
                : "";
              return x;
            })
          : ""
      );
    this.accessChecker
      .isGranted("view", "logistic-contracts")
      .subscribe((granted) =>
        granted == false
          ? this.settings.actions.custom.map((x, index) => {
              x.name == "view"
                ? this.settings.actions.custom.splice(index, 1)
                : "";
              return x;
            })
          : ""
      );

    this.optionsPager = [
      { value: 5 },
      { value: 10 },
      { value: 20 },
      { value: 50 },
      { value: 100 },
    ];
    this.selected = this.optionsPager[0];
    this.numeral.locale("es");
    this.filterForm = this.formBuilder.group({
      date: new FormControl("", [
        Validators.required,
        this.dateRangeValidatorFilter,
      ]),
    });
    this.autoUploadForm = this.formBuilder.group({
      date: new FormControl("", [
        Validators.required,
        this.dateRangeValidatorUpload,
      ]),
      country_code: new FormControl("", [Validators.required]),
      legal_entity: new FormControl("", [Validators.required]),
      balancing_zone_id: new FormControl("", [Validators.required]),
      logView: new FormControl(false, [Validators.required]),
    });
    this.manualUploadForm = this.formBuilder.group({
      balancing_zone_id: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      file: new FormControl("", []),
      logView: new FormControl(false, [Validators.required]),
    });
    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.autoUploadForm.get("country_code").setValue(object["country_code"]);
      this.autoUploadForm
        .get("balancing_zone_id")
        .setValue(object["balancing_zone"]);
      this.manualUploadForm
        .get("country_code")
        .setValue(object["country_code"]);
      this.manualUploadForm
        .get("balancing_zone_id")
        .setValue(object["balancing_zone"]);

      this.getbalanceZones(object["country_code"], 1);
      this.getbalanceZones(object["country_code"], 2);
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
    private apiJobs: JobsService,
    public accessChecker: NbAccessChecker
  ) {
    this.getContracts();
    this.getCountries();
    this.getLegalEntities();
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
  convertSerialToDate(serial: number): Date {
    // Alternative, date only formulation
    // return new Date(Date.UTC(0, 0, serialDate - 1))

    // Epoch for Excel (January 1, 1900)
    const excelEpoch = new Date(Date.UTC(1899, 11, 31));
    // Convert serial date to milliseconds
    var serialMilliseconds = serial * 24 * 60 * 60 * 1000;

    // Excel incorrectly treats 1900 as a leap year, 
    // so subtract one day for dates after 1900-02-28
    if (serial > 60)
      serialMilliseconds -= 24 * 60 * 60 * 1000;

    // Create a new date object at 00:00:00 UTC and add the serial milliseconds
    return new Date(Math.round(excelEpoch.getTime() + serialMilliseconds ));
  }
  objectIsNonEmpty(input: Object): boolean {
    if (input === null)
      return false;
    
    if (typeof input === "string")
      return input.trim().length !== 0;
    
    return true;
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
        cellDates: false,
        raw: false,
        dateNF: "dd/mm/yyy",
      });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];

      this.result = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    };
    fileReader.onloadend = (e) => {
      let isEqual = false;
      this.apiContract
        .getContractsWorksheetTemplate(
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
                    var convertedDate = this.convertSerialToDate(x[j["label"]]);
                    if (
                      this.objectIsNonEmpty(x[j["label"]]) &&
                      dateIsValid(convertedDate)
                    ) {
                      x[j["label"]] = this.datepipe.transform(
                        convertedDate,
                        "yyyy-MM-dd"
                      );
                    } else {
                      x[j["label"]] = null;
                    }
                  } else if (j["type"] == "date-time") {
                    var convertedDate = this.convertSerialToDate(x[j["label"]]);
                    if (
                      this.objectIsNonEmpty(x[j["label"]]) &&
                      dateIsValid(convertedDate)
                    ) {
                      x[j["label"]] = convertedDate.toISOString().split(".")[0] + "Z";
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

              this.apiContract
                .uploadContractsWorksheet(
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
                      "Logistic contracts have been uploaded, please check the log tab."
                    );

                    this.getContracts();
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
                    if (res["created_contracts"].length > 0) {
                      this.submitLogisticContracts(res["created_contracts"]);
                    }

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
                        "Internal server error while uploading contracts",
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
              this.loadingUpload = false;
              this.logContainer = true;
            }
          },
        });
    };
    fileReader.readAsArrayBuffer(this.file);
    function getCurrentTimestamp() {
      return Date.now();
    }
  }
  autoUpload() {
    this.dialogService
      .open(DialogConfirmationComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          body: "Contracts in that date range will be removed and downloaded again. Do you want to continue?",
          title: "Confirmation",
          button: "Confirm",
          status_cancel: "basic",
          status_confirm: "success",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "yes") {
          this.autoUploadForm.controls["logView"].setValue(true);
          this.logContainerDiv1 = true;
          this.loadingDownload = true;
          var entity = this.autoUploadForm.get("legal_entity").value;
          var balance_zone = this.autoUploadForm.get("balancing_zone_id").value;

          var start = this.datepipe.transform(
            this.autoUploadForm.get("date").value.start,
            "yyyy-MM-dd"
          );
          var end = this.datepipe.transform(
            this.autoUploadForm.get("date").value.end,
            "yyyy-MM-dd"
          );
          this.apiContract
            .uploadContractsWS(entity, balance_zone, start, end)
            .subscribe({
              next: (res) => {
                this.messageService.showToast(
                  "success",
                  "Success",
                  "Logistic contracts downloaded successfully!"
                );
                this.getContracts();
                this.timestamp1 = new Date(
                  new Date().toString().replace(/GMT.*$/, "GMT+0000")
                )
                  .toISOString()
                  .replace("Z", "")
                  .replace("T", " ")
                  .split(".")[0];

                this.successes1 = res["successes"];
                if (res["errors"]) {
                  this.creation_errors_count1 = Object.values(
                    res["errors"]
                  ).length;
                  this.creation_errors1 = Object.values(res["errors"]);
                }
                this.submitLogisticContracts(res["created_contracts"]);

                this.logContainer1 = true;
              },
              error: (e) => {
                this.loadingDownload = false;
                if (e.error.title == "Internal Server Error") {
                  this.messageService.showToast(
                    "danger",
                    "Error",
                    "Internal server error while downloading contracts"
                  );
                  this.timestamp1 = new Date(
                    new Date().toString().replace(/GMT.*$/, "GMT+0000")
                  )
                    .toISOString()
                    .replace("Z", "")
                    .replace("T", " ")
                    .split(".")[0];
                  this.successes1 = 0;
                  this.creation_errors_count1 = 1;
                  this.creation_errors1 = [
                    "Internal server error while downloading contracts",
                  ];

                  this.logContainer1 = true;
                } else {
                  this.messageService.showToast("danger", "Error", e.error);
                  this.timestamp1 = new Date(
                    new Date().toString().replace(/GMT.*$/, "GMT+0000")
                  )
                    .toISOString()
                    .replace("Z", "")
                    .replace("T", " ")
                    .split(".")[0];
                  this.successes1 = 0;
                  this.creation_errors_count1 = 1;
                  this.creation_errors1 = [e.error];

                  this.logContainer1 = true;
                }
              },
            })
            .add(() => {
              this.loadingDownload = false;
            });
        }
      });
  }

  getContracts() {
    this.loadingGetContracts = true;
    this.apiContract
      .getAllLogisticContracts()
      .subscribe({
        next: (res) => {
          this.data = res;

          this.data = this.data.filter((item)=>{
            return item.label.includes('ETRM') != true;
          })

          this.source.load(this.data);
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting contracts"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.loadingGetContracts = false;
        if (
          this.filterEvent == true &&
          this.filterForm.get("date").value !== undefined &&
          this.filterForm.get("date").value !== null &&
          this.filterForm.get("date").valid == true
        ) {
          this.filter();
        }
      });
  }
  onEdit($event) {
    this.dialogService
      .open(DialogContractComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Contract",
          id: $event.data.id,
          action: "Update",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getContracts();
        }
      });
  }
  onAdd($event) {
    this.dialogService
      .open(DialogContractComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Contract",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getContracts();
        }
      });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  dateRange(beginDate: string, endDate: string) {
    var filterObject = this.source.getFilter();
    var data = this.data.filter((item) => {

      return (
        (new Date(item.start_date) >= new Date(beginDate) &&
          new Date(item.start_date) <= new Date(endDate)) ||
        (new Date(item.end_date) >= new Date(beginDate) &&
          new Date(item.end_date) <= new Date(endDate)) ||
        (new Date(beginDate) >= new Date(item.start_date) &&
          new Date(endDate) <= new Date(item.end_date))
      );
    });

    this.source = new LocalDataSource(data);

    if (filterObject !== undefined && filterObject !== null) {
      this.source.setFilter(filterObject.filters);
    }
  }
  onToggle($event) {
    var logView = this.manualUploadForm.get("logView").value;

    this.logContainerDiv = !logView;
  }
  onToggle1($event) {
    var logView = this.autoUploadForm.get("logView").value;

    this.logContainerDiv1 = !logView;
  }

  filter() {
    this.filterEvent = true;
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
  reset() {
    this.filterEvent = false;
    this.source = new LocalDataSource(this.data);
    this.filterForm.controls["date"].setValue("");
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
  private dateRangeValidatorUpload: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date = this.autoUploadForm && this.autoUploadForm.get("date").value;

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
    }

    return invalid ? { invalidRange: {} } : null;
  };
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
  onChange($event) {}
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
            "Internal server error while getting balance"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  onView($event) {
    this.dialogService
      .open(DialogContractComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "View Contract",
          id: $event.data.id,
          action: "View",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getContracts();
        }
      });
  }
  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "Capacity_Contracts");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "Capacity_Contracts");
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
    this.autoUploadForm.controls["balancing_zone_id"].setValue("");
    this.getbalanceZones(this.autoUploadForm.get("country_code").value, 2);
  }

  download() {
    this.apiContract
      .getContractsWorksheetTemplate(
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
            "logistic_contract_template" +
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

    /*     object.map((x) => {
          this.result.map((j) => {
            var keys = Object.keys(x);
            for (let i in keys) {
              if (x[keys[i]] == "integer") {
                j[keys[i]] == Number(j[keys[i]]);
              } else if (x[keys[i]] == "date") {
                j[keys[i]] = this.datepipe.transform(
                  j[keys[i]],
                  "yyyy-MM-dd"
                );
              }else if (x[keys[i]] == "date-time") {
                j[keys[i]] = new Date(
                  new Date(j[keys[i]])
                    .toString()
                    .replace(/GMT.*$/, "GMT+0000")
                ).toISOString();
              } else {
                j[keys[i]]= j[keys[i]];
              }
               
            }
          });
        });
        object = object.map((x) => {
         
          for (let i in Object.keys(x)) {
            x[Object.keys(x)[i]] = "";
          }
          return x;
        }); */
    /*   this.result.map(x=>{
        object.map(j=>{
          if(j['type']='integer'){
            x[j['label']]= Number(x[j['label']])
          }
         
        })
      }) */
  }
  onCustom($event) {
    var action = $event.action;

    if (action == "view") {
      this.onView($event);
    }
    if (action == "edit") {
      this.onEdit($event);
    }
    if (action == "delete") {
      this.onDelete($event);
    }
  }

  onDelete($event) {
    this.loadingGetContracts = true;
    this.getDependenciesById($event.data.id);
  }

  openDialogDelete(id) {
    var columns = [
      {
        name: "Contract",
        prop: "contract_label",
        size: 150,
        readonly: true,
      },
      {
        name: "Date",
        prop: "date",
        size: 150,
        readonly: true,
      },
      {
        name: "Volume (Kwh)",
        prop: "volume",
        size: 200,
        readonly: true,
        cellProperties: ({ prop, model, data, column }) => {
          return {
            class: {
              numeric: true,
            },
          };
        },
      },
    ];
    this.loadingGetContracts = false;
    this.dialogService
      .open(DialogConfirmationComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          body: "Are you sure you want to eliminate this capacity contract?",
          columns: columns,
          row_nominations: this.rows,
          dependencies: this.dependencies,
          body_dependencies:
            "The following associated contracts will also be removed: " +
            this.dependencies,
          body_nominations:
            " The following associated nominations will be removed:",
          title: "Confirmation Delete",
          button: "Delete",
          status_cancel: "basic",
          status_confirm: "danger",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val == "yes") {
          this.loadingGetContracts = true;
          this.apiContract
            .removeLogisticContract(id)
            .subscribe({
              next: (res) => {
                this.messageService.showToast(
                  "success",
                  "Success",
                  "Logistic Contract deleted successfully!"
                );
              },
              error: (e) => {
                if (e.error.title == "Internal Server Error") {
                  this.messageService.showToast(
                    "danger",
                    "Error",
                    "Internal server error while deleting logistic contract"
                  );
                } else {
                  this.messageService.showToast("danger", "Error", e.error);
                }
              },
            })
            .add(() => {
              this.getContracts();
            });
        }
      });
  }
  getDependenciesById(id) {
    this.dependencies = [];
    this.waitDependencies = false;
    this.apiContract
      .getLogisticContractDependentItems(id)
      .subscribe({
        next: (res) => {
          this.dependencies = res[0];

          if (this.dependencies.length == 0) {
            this.dependencies = null;
          } else {
            this.dependencies = res[0].map((x) => {
              return x["label"];
            });
            this.dependencies = this.dependencies
              .toString()
              .replaceAll(",", ", ");
          }
          this.rows = res[1];
          if (this.rows.length == 0) {
            this.rows = null;
          } else {
            this.rows = this.rows.map((x) => {
              x["volume"] = x["volume"].toFixed(2);
              return x;
            });
          }
        },
        error: (e) => {
          this.dependencies == null;
          this.rows == null;

          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting nominations and dependencies"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.openDialogDelete(id);
      });
  }

  /*   getNominationById(id) {
    this.waitNominations = false;
    this.rows=[];
    this.apiContract
      .getContractNominations(id)
      .subscribe({
        next: (res) => {
          this.rows = res;
          if (this.rows.length == 0) {
            this.rows = null;
          }
        },
        error: (e) => {
          this.rows=null;
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting nominations"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.openDialogDelete(id);
      });
  } */
  clean(obj) {
    for (var propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      }
    }
    return obj;
  }
  refresh() {
    this.loadingGetContracts = true;
    this.getContracts();
  }
  submitLogisticContracts(array) {
    this.loading = true;
    this.apiJobs
      .submitLogisticContracts({
        elements: array,
      })
      .subscribe({
        next: (res) => {
          if (res["failed_submissions"].length == 0) {
            this.messageService.showToast("success", "Success", res);
          } else {
            var contracts = [];
            res["failed_submissions"].map((x) => {
              contracts.push(x["contract"]);
            });
            this.openErrorDialog(
              contracts.toString().replaceAll(",", ", "),
              "The submit of the following logistic contracts to ETRM has failed",
              array
            );
          }
        },
        error: (e) => {
        
          if (e.error.title == "Internal Server Error") {
            this.openErrorDialog(
              e.error,
              "Sending logistic contract to ETRM has failed for the following reason:",
              "Internal server error while submit contract/s to ETRM"
            );
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while submit contract/s to ETRM"
            );
          } else {
            this.openErrorDialog(
              e.error,
              "Sending logistic contract to ETRM has failed for the following reason:",
              array
            );
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }

  openErrorDialog(error, message, array) {
    this.dialogService
      .open(DialogConfirmationComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          body:
            message +
            "\n" +
            "\n" +
            error +
            "\n" +
            "\n" +
            "do you want to resend?",
          title: "Confirmation",
          button: "Confirm",
          status_cancel: "basic",
          status_confirm: "success",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "yes") {
          this.submitLogisticContracts(array);
        }
      });
  }
}
