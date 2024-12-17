import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { BalanceZoneService } from "../../../@core/services/balanceZone.service";
import { CountryService } from "../../../@core/services/country.service";
import { map } from "rxjs/operators";
import * as moment from "moment";
import { Observable, Subscription, of } from "rxjs";
import * as XLSX from "xlsx";
import { messageService } from "../../../@core/utils/messages";
import { SupplyPointsAreaService } from "../../../@core/services/supplyPointsArea.service";
import { DialogSupplyAreaComponent } from "./dialog-supply-area/dialog-supply-area.component";
import { DialogPointComponent } from "./dialog-supply-point/dialog-supply-point.component";
import { DialogExportCoefficientsComponent } from "./dialog-export-coefficients/dialog-export-coefficients.component";
import { DialogConfirmationComponent } from "../../../@theme/components/confirmation-dialog/dialog-confirmation-delete.component";
import { NbAccessChecker } from "@nebular/security";

@Component({
  selector: "ngx-supply-point-and",
  templateUrl: "./supply-point-and.component.html",
  styleUrls: ["./supply-point-and.component.scss"],
})
export class SupplyPointAndComponent implements OnInit {
  defaultRowPerPagePoint = 10;
  defaultRowPerPageArea = 10;
  dataExport: any[];
  paramsOptions: any;
  loading = false;
  optionsPager: any;
  selectedArea: any;
  selectedPoint: any;
  successfully_operations: any;
  loadingUpload = false;
  loading_upload_array: any = [];
  loadingForm = false;
  loading_form_array: any = [];
  countriesOptions: any;
  manualUploadForm!: FormGroup;
  zoneOptions: any;
  errorBalanceZone = false;
  logContainerDiv = false;
  file: File;
  arrayBuffer: any;
  result: any;
  logContainer = false;
  timestamp: any;
  successes: any;
  creation_errors: any;
  creation_errors_count: any;
  start_date: any;
  end_date: any;
  fileName: any = "";
  fileValid = false;
  protected subscriptions: Subscription[] = [];


  ngOnInit(): void {
    this.accessChecker.isGranted('create', 'supply-points-and-supply-areas').subscribe(granted => this.settingsSupplyPoint.actions.add = granted);
    this.accessChecker.isGranted('create', 'supply-points-and-supply-areas').subscribe(granted => this.settingsSupplyPoint.actions.edit = granted);
    this.accessChecker.isGranted('remove', 'supply-points-and-supply-areas').subscribe(granted => this.settingsSupplyPoint.actions.delete = granted);
    this.accessChecker.isGranted('create', 'supply-points-and-supply-areas').subscribe(granted => this.settingsSupplyArea.actions.add = granted);
    this.accessChecker.isGranted('create', 'supply-points-and-supply-areas').subscribe(granted => this.settingsSupplyArea.actions.edit = granted);

    this.optionsPager = [
      { value: 5 },
      { value: 10 },
      { value: 20 },
      { value: 50 },
      { value: 100 },
    ];
    this.selectedArea = this.optionsPager[0];
    this.selectedPoint = this.optionsPager[0];
    var object = localStorage.getItem('settings_parameters');
    if (object) {
      object = JSON.parse(localStorage.getItem('settings_parameters'));

      this.sourceSupplyAreas.setFilter([
        {
          field: "country",
          search: object['country_code'],
          filter: (value: string, searchValue: string) => {
            return new Date(value) == new Date(searchValue);
          },
        },
        {
          field: "balance_zone_id",
          search: object['balancing_zone'].toString(),
          filter: (value: string, searchValue: string) => {
            ;
            return value == searchValue
          },
        }])
    }

    this.manualUploadForm = this.formBuilder.group({
      balancing_zone_id: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      file: new FormControl("", []),
      logView: new FormControl(false, [Validators.required]),
    });
  }
  settingsSupplyPoint = {
    mode: "external",
    actions: {
      add: false,
      edit: false,
      delete: false,
    },
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
    },
    edit: {
      editButtonContent: '<i class="fas fa-pen fa-xs" title="Edit"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="fas fa-trash fa-xs" title="Delete"></i>',
    },

    columns: {
      id: {
        title: "Id",
        type: "string",
        hide: true,
      },
      label: {
        title: "Code",
        type: "string",
      },
      area_id: {
        title: "Supply Area Id",
        type: "string",
        hide: true,
      },
      location_label: {
        title: "Supply Area",
        type: "string",
      },
      /*     balancing_point_id: {
        title: 'Balancing Point Id',
        type: 'string',
        hide: true
      },
      balacing_point_name: {
        title: 'Balancing Point',
        type: 'string',
      },
      balance_zone_id: {
        title: 'Balancing Zone Id',
        type: 'string',
        hide: true
      },
      balance_zone_name: {
        title: 'Balancing Zone',
        type: 'string',
      },
      country_name: {
        title: 'Country',
        type: 'string',
      }, */
    },
    pager: {
      display: true,
      perPage: this.defaultRowPerPagePoint,
    },
  };
  settingsSupplyArea = {
    mode: "external",
    actions: {
      add: false,
      edit: false,
      delete: false,
    },
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
    },
    edit: {
      editButtonContent: '<i class="fas fa-pen fa-xs" title="Edit"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
    },

    columns: {
      id: {
        title: "Id",
        type: "number",
        hide: true,
      },
      label: {
        title: "Label",
        type: "string",
      },
      country: {
        title: "Country",
        type: "string",
      },
      balance_zone_id: {
        title: "Balancing Zone Id",
        type: "string",
        hide: true,
      },
      balance_zone_label: {
        title: "Balancing Zone",
        type: "string",
      },
      balancing_point_id: {
        title: "Virtual Balancing Point Id",
        type: "string",
        hide: true,
      },
      balancing_point_label: {
        title: "Virtual Balancing Point",
        type: "string",
      },
    },
    pager: {
      display: true,
      perPage: this.defaultRowPerPageArea,
    },
    attr: {
      class: "table",
    },
  };

  sourcePoints: LocalDataSource = new LocalDataSource();

  sourceSupplyAreas: LocalDataSource = new LocalDataSource();

  constructor(
    public datepipe: DatePipe,
    private messageService: messageService,
    private dialogService: NbDialogService,
    private excelService: ExcelService,
    private formBuilder: FormBuilder,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
    private apiSupplyAreasAndPoints: SupplyPointsAreaService,
    public accessChecker: NbAccessChecker
  ) {
    this.getPoints();
    this.getCountries();
    this.getSupplyAreas();
  }
  getPoints() {
    this.loading = true;
    this.apiSupplyAreasAndPoints.getSupplyPoints().subscribe({
      next: (res) => {
        const data = res;
        this.sourcePoints.load(data);
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting supply points"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    }).add(() => {
      this.loading = false;
    });
  }

  getSupplyAreas() {
    this.loading = true;
    this.apiSupplyAreasAndPoints
      .getSupplyAreas()
      .pipe(
        map((data) =>
          data.map(
            ({
              id,
              label,
              country,
              balance_zone_id,
              balance_zone_label,
              balancing_point_id,
              balancing_point_label,
            }) => ({
              id,
              label,
              country,
              balance_zone_id,
              balance_zone_label,
              balancing_point_id,
              balancing_point_label,
            })
          )
        )
      )
      .subscribe({
        next: (res) => {
          const data = res;
          this.sourceSupplyAreas.load(data);
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting supply areas"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      }).add(() => {
        this.loading = false;
      });;
  }

  setPager() {
    this.sourceSupplyAreas.setPaging(1, this.defaultRowPerPageArea, true);
    this.settingsSupplyPoint = Object.assign({}, this.settingsSupplyPoint);
    this.sourcePoints.setPaging(1, this.defaultRowPerPagePoint, true);
    this.settingsSupplyArea = Object.assign({}, this.settingsSupplyArea);
  }

  onEditSupplyArea($event) {
    this.dialogService
      .open(DialogSupplyAreaComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Supply Area",
          id: $event.data.id,
          label: $event.data.label,
          balance_zone_id: $event.data.balance_zone_id,
          balancing_point_id: $event.data.balancing_point_id,
          country_code: $event.data.country,
          action: "Update",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getSupplyAreas();
          this.getPoints();
        }
      });
  }
  onAddSupplyArea($event) {
    this.dialogService
      .open(DialogSupplyAreaComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Supply Area",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getSupplyAreas();
          this.getPoints();
        }
      });
  }
  onEditPoint($event) {
    this.dialogService
      .open(DialogPointComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Supply Point",
          id: $event.data.id,
          label: $event.data.label,
          area_id: $event.data.area_id,
          action: "Update",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getPoints();
        }
      });
  }
  onAddPoint($event) {
    this.dialogService
      .open(DialogPointComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Supply Point",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getPoints();
        }
      });
  }

  exportAsXLSXSupplyAreas() {
    var exportExcel = [];
    exportExcel = this.sourceSupplyAreas["filteredAndSorted"].map((x) => {
      delete x["id"];
      delete x["balancing_point_id"];
      delete x["balance_zone_id"];

      return x;
    });
    this.excelService.exportAsExcelFile(exportExcel, "supply_areas");
  }
  exportAsCSVSupplyAreas() {
    var exportExcel = [];
    exportExcel = this.sourceSupplyAreas["filteredAndSorted"].map((x) => {
      delete x["id"];
      delete x["balancing_point_id"];
      delete x["balance_zone_id"];

      return x;
    });
    this.excelService.exportToCsv(exportExcel, "supply_areas");
  }

  exportAsXLSXPoints() {
    var exportExcel = [];
    exportExcel = this.sourcePoints["filteredAndSorted"].map((x) => {
      x["code"] = x["label"];
      x["supply area"] = x["location_label"];
      delete x["label"];
      delete x["location_label"];
      delete x["id"];
      delete x["area_id"];
      return x;
    });
    this.excelService.exportAsExcelFile(exportExcel, "supply_points");
  }

  exportAsCSVPoints() {
    var exportExcel = [];
    exportExcel = this.sourcePoints["filteredAndSorted"].map((x) => {
      x["code"] = x["label"];
      x["supply area"] = x["location_label"];
      delete x["label"];
      delete x["location_label"];
      delete x["id"];
      delete x["area_id"];
      return x;
    });
    this.excelService.exportToCsv(exportExcel, "supply_points");
  }
  openDownloadDialog() {
    this.dialogService.open(DialogExportCoefficientsComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        balance_zone: this.manualUploadForm.get("balancing_zone_id").value,
        country_code: this.manualUploadForm.get("country_code").value,
      },
      autoFocus: false,
    });
  }
  onDeletePoint($event) {
    this.dialogService
      .open(DialogConfirmationComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          body: 'Are you sure you want to delete this supply point? Associated demand and consumption will also be removed.',
          title: "Confirmation Delete",
          button: "Delete",
          status_cancel: 'basic',
          status_confirm: 'danger'
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {

        if (val === "yes") {
          this.loading = true;
          this.apiSupplyAreasAndPoints
            .removeSupplyPoint(Number($event.data.id))
            .subscribe({
              next: (res) => {

                this.messageService.showToast(
                  "success",
                  "Success",
                  "Supply point deleted successfully!"
                );
              },
              error: (e) => {
                if (e.error.title == "Internal Server Error") {
                  this.messageService.showToast(
                    "danger",
                    "Error",
                    "Internal server error while deleting supply point"
                  );
                } else {
                  this.messageService.showToast("danger", "Error", e.error);
                }
              },
            })
            .add(() => {
              this.getPoints();

            });
        }
      });

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
  refreshArea() {
    this.loading = true;
    this.getSupplyAreas();
  }
  refreshPoint() {
    this.loading = true;
    this.getPoints();
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
      this.apiSupplyAreasAndPoints.getSupplyPointCoefficientsTemplate(
        this.manualUploadForm.get("balancing_zone_id").value,
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
                    // Array of date formats to try
                    const dateFormats = ["DD-MM-YYYY", "YYYY-MM-DD"];
                    // Create map with date formats as keys and parsed dates as values
                    const dateFormatsValidity = dateFormats.reduce((acc, format) => {
                      acc[format] = moment(x[j["label"]], format, true);
                      return acc;
                    }, {});
                    // Get first valid date, i.e. the one that is not null and not invalid
                    const firstValidDateFormat = dateFormats.find(
                      format => dateFormatsValidity[format].isValid()
                    );
                    const firstValidDate = moment(x[j["label"]], firstValidDateFormat).toDate();
                    if (
                      x[j["label"]] !== null &&
                      x[j["label"]] !== "" &&
                      dateIsValid(firstValidDate)
                    ) {
                      x[j["label"]] = this.datepipe.transform(
                        firstValidDate, "yyyy-MM-dd"
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
              this.apiSupplyAreasAndPoints.uploadSupplyPointCoefficientsWorksheet(
                this.manualUploadForm.get("balancing_zone_id").value,
                this.result
              )
                .subscribe({
                  next: (res) => {
                    this.messageService.showToast(
                      "info",
                      "Info",
                      "TSO Coefficients have been uploaded, please check the log tab."
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
                    if (res["successfully_operations"]) {
                      this.successfully_operations = Object.values(
                        res["successfully_operations"]
                      );
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
                        "Internal server error while uploading supply tso coefficients",
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
  downloadTemplate() {
    this.apiSupplyAreasAndPoints.getSupplyPointCoefficientsTemplate(
      this.manualUploadForm.get("balancing_zone_id").value,
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
            "supply_coefficients_template"
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
  download() {
    this.apiSupplyAreasAndPoints.getSupplyPointCoefficientsWorksheet(
      this.manualUploadForm.get("balancing_zone_id").value,
      this.manualUploadForm.get("start_date").value,
      this.manualUploadForm.get("end_date").value)
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
            "supply_coefficients"
          );
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while downloading supply_coefficients"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }
  reset() {
    this.cancelAllRequests();
    this.manualUploadForm.controls["country_code"].setValue("");
    this.manualUploadForm.controls["balancing_zone"].setValue("");
    this.manualUploadForm.controls["date"].setValue("");
    this.zoneOptions = [];
    localStorage.setItem("country_lgs", "");
    localStorage.setItem("balance_zone_lgs", "");
    localStorage.setItem("start_date_lgs", "");
    localStorage.setItem("end_date_lgs", "");
    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.manualUploadForm
        .get("country_code")
        .setValue(object["country_code"]);
      this.manualUploadForm
        .get("balancing_zone")
        .setValue(object["balancing_zone"]);
    }
  }
}
