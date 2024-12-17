import { Component, Input, OnInit } from "@angular/core";
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
import { DialogRequestSingleClientComponent } from "./dialog-request-single-client/dialog-request-single-client.component";
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
import { TankerTrucksService } from "../../@core/services/tankerTrucks.service";
import { DialogRequestSingleClientSchedulingComponent } from "./dialog-request-single-client-scheduling/dialog-request-single-client-scheduling.component";
import { NbAccessChecker } from "@nebular/security";

@Component({
  selector: "ngx-request-single-client",
  templateUrl: "./request-single-client.component.html",
  styleUrls: ["./request-single-client.component.scss"],
})
export class RequestSingleClientComponent implements OnInit {
  fileName: any = "";
  @Input() action1: string;
  arrayBuffer: any;
  file: File;
  fileValid = false;
  loadingUpload = false;
  defaultRowPerPage = 10;
  filterForm!: FormGroup;
  getTSORequestNumberForm!: FormGroup;
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
  successes_count: any;
  info: any;
  creation_errors_count: any;
  creation_errors: any;
  mapping_errors: any;
  logContainer = false;
  logContainerDiv = false;
  fileNg: any;
  toggleNgModel = false;
  dependencies: any;
  loadingGetOperations = false;
  loadingGetTSORequestNumbers = false;
  numeral = NumberColumnType.getNumeralInstance();
  rows: any;
  waitDependencies = false;
  waitNominations = false;
  optionsPager: any;
  selected: any;
  settings = {
    mode: "external",
    actions: {
      add: false,
      edit: false,
      delete: true,
    },
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
    },
    edit: {
      editButtonContent: '<i class="fas fa-pen fa-xs" title="Edit"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="fas fa-eye fa-sm" title="View"></i>',
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
      request_code: {
        title: "Internal Request Code",
        type: "string",
      },
      delivery_date: {
        title: "Delivery Date",
        type: "string",
        filter: false,
      },
      /*     client: {
        title: "Client",
        type: "string",
      }, */
      carrier_id: {
        title: "Carrier",
        type: "string",
        hide: true,
      },
      carrier: {
        title: "Carrier",
        type: "string",
      },
      operation_date: {
        title: "Operation Date",
        type: "string",
        filter: false,
      },
      total_size: {
        title: "Total Size (Kwh)",
        type: "number",
        valuePrepareFunction: (value) => {
          return this.numeral(value).format("0,0.[0000000000]");
        },
      },
      owner_id: {
        title: "Owner Id",
        type: "string",
        hide: true,
      },
      owner: {
        title: "Owner",
        type: "string",
      },
      load_connection_id: {
        title: "Regasification Plant Id",
        type: "string",
        hide: true,
      },
      load_connection: {
        title: "Regasification Plant",
        type: "string",
      },
      logistic_contract_id: {
        title: "Logistic Contract",
        type: "string",
        hide: true,
      },
      logistic_contract: {
        title: "Logistic Contract",
        type: "string",
      },
      request_code_tso: {
        title: "TSO Request Code",
        type: "string",
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

  ngOnInit(): void {
    this.accessChecker
      .isGranted("create", "request-single-clients")
      .subscribe((granted) => (this.settings.actions.add = granted));
    this.accessChecker
      .isGranted("create", "request-single-clients")
      .subscribe((granted) => (this.settings.actions.edit = granted));
/*     this.accessChecker
      .isGranted("view", "request-single-clients")
      .subscribe((granted) => (this.settings.actions.delete = granted)); */
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
    this.getTSORequestNumberForm = this.formBuilder.group({
      date: new FormControl("", [
        Validators.required,
        this.dateRangeValidatorUpload,
      ]),
      logView: new FormControl(false, [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      legal_entity: new FormControl("", [Validators.required]),
      balancing_zone_id: new FormControl("", [Validators.required]),
    });

    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.getTSORequestNumberForm
        .get("country_code")
        .setValue(object["country_code"]);
      this.getTSORequestNumberForm
        .get("balancing_zone_id")
        .setValue(object["balancing_zone"]);

      this.getbalanceZones(object["country_code"], 2);
      this.source.setFilter([
        {
          field: "country",
          search: object["country_code"],
        },
        {
          field: "balance_zone",
          search: object["balancing_zone_label"],
        },
      ]);
    }
  }
  constructor(
    public datepipe: DatePipe,
    private messageService: messageService,
    private dialogService: NbDialogService,
    private excelService: ExcelService,
    private formBuilder: FormBuilder,
    private apiTankerTruck: TankerTrucksService,
    private apiLegalEntity: LegalEntityService,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
    public accessChecker: NbAccessChecker
  ) {
    this.getOperations();
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
  getTSORequestNumbers() {
    this.loadingGetOperations = true;
    this.loadingGetTSORequestNumbers = true;
    this.logContainerDiv = true;
    this.getTSORequestNumberForm.controls["logView"].setValue(true);
    this.apiTankerTruck
      .getTankerTruckOperationsTSO(
        this.getTSORequestNumberForm.get("balancing_zone_id").value,
        this.getTSORequestNumberForm.get("legal_entity").value,
        this.datepipe.transform(
          this.getTSORequestNumberForm.get("date").value.start,
          "yyyy-MM-dd"
        ),
        this.datepipe.transform(
          this.getTSORequestNumberForm.get("date").value.end,
          "yyyy-MM-dd"
        )
      )
      .subscribe({
        next: (res) => {
          this.timestamp = new Date(
            new Date().toString().replace(/GMT.*$/, "GMT+0000")
          )
            .toISOString()
            .replace("Z", "")
            .replace("T", " ")
            .split(".")[0];
          this.creation_errors = res;

          if (res["errors"]) {
            this.creation_errors_count = Object.values(res["errors"]).length;
            this.creation_errors = Object.values(res["errors"]);
          }

          if (res["successes"]) {
            this.successes_count = Object.values(res["successes"]).length;
            this.successes = Object.values(res["successes"]);
          }

          if (res["info"]) {
            this.info = Object.values(res["info"]);
          }

          this.logContainer = true;
        },
        error: (e) => {
          this.loadingGetTSORequestNumbers = false;
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting tso request code"
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
        this.getOperations();
        this.loadingGetTSORequestNumbers = false;
      });
  }
  getOperations() {
    this.loadingGetOperations = true;
    this.apiTankerTruck
      .getTankerTruckOperations()
      .subscribe({
        next: (res) => {
          this.data = res;
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting countracts"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        var data = this.data.filter((item) => {
          return item.client_type == "SINGLE_CLIENT_TANKERS";
        });
        this.data = data;
        this.source.load(this.data);
        this.loadingGetOperations = false;
      });
  }
  onEdit($event) {
    this.dialogService
      .open(DialogRequestSingleClientComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Request Single Client",
          action: "Update",
          operation_type: "request",
          id: $event.data.id,
          balance_zone_id: $event.data.balance_zone_id,
          country_code: $event.data.country,
          request_code: $event.data.request_code,
          request_code_tso: $event.data.request_code_tso,
          delivery_date: $event.data.delivery_date,
          operation_date: $event.data.operation_date,
          carrier_id: $event.data.carrier_id,
          total_size: $event.data.total_size,
          owner_id: $event.data.owner_id,
          load_connection_id: $event.data.load_connection_id,
          logistic_contract_id: $event.data.logistic_contract_id,
          logistic_contract_label: $event.data.logistic_contract,
          comment: $event.data.comment,
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getOperations();
        }
      });
  }
  onAdd($event) {
    this.dialogService
      .open(DialogRequestSingleClientComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Request Single Client",
          action: "Add",
          operation_type: "request",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getOperations();
        }
      });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  dateRange(beginDate: string, endDate: string) {
    this.source = new LocalDataSource(this.data);

    this.source.setFilter([
      {
        field: "delivery_date",
        search: beginDate,
        filter: (value: string, searchValue: string) => {
          return (
            new Date(value) >= new Date(searchValue) &&
            new Date(value) <= new Date(endDate)
          );
        },
      },
      /*  {
        field: "delivery_date",
        search: endDate,
        filter: (value: string, searchValue: string) => {
          return new Date(value) <= new Date(searchValue);
        },
      }, */
    ]);
  }
  onToggle($event) {
    var logView = this.getTSORequestNumberForm.get("logView").value;

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
  reset() {
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
    const date =
      this.getTSORequestNumberForm &&
      this.getTSORequestNumberForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.getTSORequestNumberForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.getTSORequestNumberForm.get("date").value.end,
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
    this.dialogService.open(DialogRequestSingleClientComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        title: "View Request Single Client",
        action: "View",
        id: $event.data.id,
        operation_type: "request",
        balance_zone_id: $event.data.balance_zone_id,
        country_code: $event.data.country,
        request_code: $event.data.request_code,
        request_code_tso: $event.data.request_code_tso,
        delivery_date: $event.data.delivery_date,
        operation_date: $event.data.operation_date,
        carrier_id: $event.data.carrier_id,
        total_size: $event.data.total_size,
        owner_id: $event.data.owner_id,
        load_connection_id: $event.data.load_connection_id,
        logistic_contract_id: $event.data.logistic_contract_id,
        logistic_contract_label: $event.data.logistic_contract,
      },
      autoFocus: false,
    });
  }
  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "requests_single_client");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "requests_single_client");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }

  onChangeCountry1($event) {
    this.getTSORequestNumberForm.controls["balancing_zone_id"].setValue("");
    this.getbalanceZones(
      this.getTSORequestNumberForm.get("country_code").value,
      1
    );
  }
  onChangeCountry2($event) {
    this.getTSORequestNumberForm.controls["balancing_zone_id"].setValue("");
    this.getbalanceZones(
      this.getTSORequestNumberForm.get("country_code").value,
      2
    );
  }

  onCustom($event) {
    var action = $event.action;

    if (action == "view") {
      this.onView($event);
    }
    if (action == "edit") {
      this.onEdit($event);
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
  openDialogScheduling1() {
    this.dialogService.open(DialogRequestSingleClientSchedulingComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        title: "Export to XLS",

        action: "Export",
      },
      autoFocus: false,
    });
  }
  openDialogScheduling2() {
    this.dialogService.open(DialogRequestSingleClientSchedulingComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        title: "Export to XML",

        action: "Export",
      },
      autoFocus: false,
    });
  }
  openDialogScheduling3() {
    this.dialogService
      .open(DialogRequestSingleClientSchedulingComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Submit to TSO",

          action: "Submit",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "submit") {
          this.getOperations();
        }
      });
  }
  refresh() {
    this.getOperations();
  }
}
