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
import { DialogVirtualLogisticCotractsComponent } from "./dialog-virtual-logistic-cotracts/dialog-virtual-logistic-cotracts.component";
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
  selector: 'ngx-virtual-logistic-contracts',
  templateUrl: './virtual-logistic-contracts.component.html',
  styleUrls: ['./virtual-logistic-contracts.component.scss']
})
export class VirtualLogisticContractsComponent implements OnInit {

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
  filterEvent = false;
  loadingGetContracts = false;
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
        },
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
  /*     addendum: {
        title: "Addendum",
        type: "string",
      }, */
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
      .isGranted("create", "virtual-logistic-contracts")
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
      .isGranted("create", "virtual-logistic-contracts")
      .subscribe((granted) => (this.settings.actions.add = granted));
    this.accessChecker
      .isGranted("remove", "virtual-logistic-contracts")
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
      .isGranted("view", "virtual-logistic-contracts")
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


  getContracts() {
    this.loadingGetContracts = true;
    this.apiContract
      .getAllLogisticContractsVirtual()
      .subscribe({
        next: (res) => {
          this.data = res;

          this.source.load(this.data);
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting virtual logistic contracts"
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
      .open(DialogVirtualLogisticCotractsComponent, {
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
        if (val === "update") {
          this.getContracts();
        }
      });
  }
  onAdd($event) {
    this.dialogService
      .open(DialogVirtualLogisticCotractsComponent, {
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
      .open(DialogVirtualLogisticCotractsComponent, {
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
        this.excelService.exportAsExcelFile(value, "Virtual_Capacity_Contracts");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "Virtual_Capacity_Contracts");
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

    this.openDialogDelete($event.data.id);
  }

  openDialogDelete(id) {
    this.loadingGetContracts = false;
    this.dialogService
      .open(DialogConfirmationComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          body: "Are you sure you want to eliminate this virtual capacity contract?",
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
            .removeLogisticContractVirtual(id)
            .subscribe({
              next: (res) => {
                this.messageService.showToast(
                  "success",
                  "Success",
                  "Virtual Logistic Contract deleted successfully!"
                );
              },
              error: (e) => {
                if (e.error.title == "Internal Server Error") {
                  this.messageService.showToast(
                    "danger",
                    "Error",
                    "Internal server error while deleting Virtual Logistic Contract"
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
            var contracts=[];
            res["failed_submissions"].map((x)=>{
              contracts.push(x['contract'])
            });
            this.openErrorDialog(contracts.toString().replaceAll(',',', '), "The submit of the following Virtual Logistic Contracts to ETRM has failed", array);
          }
        },
        error: (e) => {
          this.openErrorDialog(e.error,"Sending Virtual Logistic Contract to ETRM has failed for the following reason:", array);
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while updating scheduling"
            );
          } else {
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
