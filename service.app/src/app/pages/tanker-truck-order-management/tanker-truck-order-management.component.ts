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
import { messageService } from "../../@core/utils/messages";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";
import { DatePipe } from "@angular/common";
import { ContractsService} from "../../@core/services/contracts.service";
import { LegalEntityService } from "../../@core/services/legalEntity.service";
import { CountryService } from "../../@core/services/country.service";
import { BalanceZoneService } from "../../@core/services/balanceZone.service";

import { concat } from "rxjs-compat/operator/concat";
import { isThisSecond } from "date-fns";
import NumberColumnType from "@revolist/revogrid-column-numeral";

import { DialogConfirmationComponent } from "../../@theme/components/confirmation-dialog/dialog-confirmation-delete.component";
import { TankerTrucksService } from "../../@core/services/tankerTrucks.service";
import { DialogRequestSingleClientComponent } from "../request-single-client/dialog-request-single-client/dialog-request-single-client.component";
import { NbAccessChecker } from "@nebular/security";

@Component({
  selector: 'ngx-tanker-truck-order-management',
  templateUrl: './tanker-truck-order-management.component.html',
  styleUrls: ['./tanker-truck-order-management.component.scss']
})
export class TankerTruckOrderManagementComponent implements OnInit {

  fileName: any = "";
  @Input() action1: string;
  arrayBuffer: any;
  file: File;
  fileValid = false;
  loadingUpload = false;
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
  successfully_operations : any;
  mapping_errors_count: any;
  creation_errors: any;
  mapping_errors: any;
  logContainer = false;
  logContainerDiv = false;
  timestamp1: any;
  successes1: any;
  creation_errors_count1: any;
  successfully_operations1 : any;
  mapping_errors_count1: any;
  creation_errors1: any;
  mapping_errors1: any;
  logContainer1 = false;
  logContainerDiv1= false;
  fileNg: any;
  toggleNgModel = false;
  dependencies: any;
  loadingGetOrders = false;
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
          name: "view",
          title: '<i class="fas fa-eye fa-sm" title="View"></i>',
        },
      
      ],
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
 
      delivery_date: {
        title: "Delivery Date",
        type: "string",
        filter:false
      },
      request_code_tso: {
        title: "TSO Request Code",
        type: "string",
      },
      client_type: {
        title: "Operation Type",
        type: "string",
   
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
        filter:false
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
    this.accessChecker.isGranted('view', 'orders-management').subscribe(granted=> granted == false ?  this.settings.actions.custom.map((x,index)=> {x.name=='view' ? this.settings.actions.custom.splice(index,1) : '' 
    return x} ) : '');
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
      logView: new FormControl(false, [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      legal_entity: new FormControl("", [Validators.required]),
      balancing_zone_id: new FormControl("", [Validators.required]),
    });
    this.manualUploadForm = this.formBuilder.group({
      balancing_zone_id: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      file: new FormControl("", []),
      logView: new FormControl(false, [Validators.required]),
    });

    var object = localStorage.getItem('settings_parameters');
      if(object){
        object= JSON.parse(localStorage.getItem('settings_parameters'));
        this.autoUploadForm.get('country_code').setValue(object['country_code']);
        this.autoUploadForm.get('balancing_zone_id').setValue(object['balancing_zone']);
        this.manualUploadForm.get('country_code').setValue(object['country_code']);
        this.manualUploadForm.get('balancing_zone_id').setValue(object['balancing_zone']);

        this.getbalanceZones(object['country_code'],1);
        this.getbalanceZones(object['country_code'],2);
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
    private apiContract: ContractsService,
    private apiLegalEntity: LegalEntityService,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
    private apiTankerTruck: TankerTrucksService,
    public accessChecker: NbAccessChecker
  ) {
    this.getOrders();
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

      this.result = XLSX.utils.sheet_to_json(worksheet, { defval: null});

    };
    fileReader.onloadend = (e) => { 
      let isEqual = false;

      this.apiTankerTruck
        .getTankerTruckOperationsWorksheetTemplate(
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
                if (Object.keys(x).toString().replace(',__EMPTY','').replaceAll(/(,__EMPTY_)\w+/g,'') === Object.keys(j).toString()) {
                  isEqual = true;
                }
            
              });
            });
       
            function dateIsValid(date) {
       
              return date instanceof Date && !isNaN(Number(date.getTime()));
            }

            if (isEqual) {
       
               this.result.map((x) => {
           
                for (var propName in x ){
                 if(propName.toString().search('EMPTY')!= -1){
                      delete x[propName]
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
                      dateIsValid(moment(x[j["label"]],"DD/MM/YYYY").toDate()) == true
                    ) {
                      x[j["label"]] = this.datepipe.transform(
                        moment(x[j["label"]],"DD/MM/YYYY").toDate(),
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
              this.apiTankerTruck
                .uploadTankerTruckOperationsWorksheet(
                  this.manualUploadForm.get("balancing_zone_id").value,
                  this.result,
               
                )
                .subscribe({
                  next: (res) => {
                   this.successes="";
                   this.creation_errors="";
                   this.creation_errors_count="";
                    this.messageService.showToast(
                      "info",
                      "Info",
                      "Orders have been uploaded, please check the log tab."
                    );

                    this.getOrders();
                    this.timestamp = new Date(
                      new Date().toString().replace(/GMT.*$/, "GMT+0000")
                    )
                      .toISOString()
                      .replace("Z", "")
                      .replace("T", " ")
                      .split(".")[0];
                    this.successes = res["successes"];
                    if(res['errors']){
                      this.creation_errors_count = Object.values(
                        res["errors"]
                      ).length;
                      this.creation_errors = Object.values(res["errors"]);
                    }
                    if(res['successfully_operations']){
                      this.successfully_operations = Object.values(res["successfully_operations"]);
                    }
                 
                 

                    this.logContainer = true;
                  },
                  error: (e) => {
                    this.loadingUpload = false;
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

  getOrders() {
    this.loadingGetOrders = true;
    this.apiTankerTruck
      .getTankerTruckOperations()
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
              "Internal server error while getting orders"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.loadingGetOrders = false;
      });
  }
  onEdit($event) {
 
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
          return new Date(value) >= new Date(searchValue) && new Date(value) <= new Date(endDate);
        },
      },
   
    ]);
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
  onChange($event) {
    this.autoUploadForm.controls["legal_entity"].setValue("");

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
  onView($event) {
    this.dialogService
      .open(DialogRequestSingleClientComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "View Order",
          action: "View",
          id: $event.data.id,
          operation_type: 'real',
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
          client_type: $event.data.client_type,
        },
        autoFocus: false,
      })
  
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
    this.autoUploadForm.controls["balancing_zone_id"].setValue("");
    this.getbalanceZones(this.autoUploadForm.get("country_code").value, 2);

  }

  download() {
    this.apiTankerTruck
      .getTankerTruckOperationsWorksheetTemplate(
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
            "order_consumption_template"
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
  autoUpload(){
    this.loadingUpload = true;
    this.autoUploadForm.controls["logView"].setValue(true);
    this.logContainerDiv1 = true;
    this.apiTankerTruck
    .getTankerTruckOrdersTSO(
      this.autoUploadForm.get("balancing_zone_id").value,
      this.autoUploadForm.get("legal_entity").value,
      this.datepipe.transform(
        this.autoUploadForm.get("date").value.start,
        "yyyy-MM-dd"
      ),
      this.datepipe.transform(
        this.autoUploadForm.get("date").value.end,
        "yyyy-MM-dd"
      )
    )
    .subscribe({
      next: (res) => {

        this.successes1="";
        this.creation_errors1="";
        this.creation_errors_count1="";
         this.messageService.showToast(
           "info",
           "Info",
           "Orders have been uploaded, please check the log tab."
         );

         this.getOrders();
         this.timestamp1 = new Date(
           new Date().toString().replace(/GMT.*$/, "GMT+0000")
         )
           .toISOString()
           .replace("Z", "")
           .replace("T", " ")
           .split(".")[0];
         this.successes1 = res["successes"];
         if(res['errors']){
           this.creation_errors_count1 = Object.values(
             res["errors"]
           ).length;
           this.creation_errors1 = Object.values(res["errors"]);
         }
         if(res['successfully_operations']){
           this.successfully_operations1 = Object.values(res["successfully_operations"]);
         }
      
      

         this.logContainer1 = true;
       },
       error: (e) => {
         this.loadingUpload = false;
         if (e.error.title == "Internal Server Error") {
           this.messageService.showToast(
             "danger",
             "Error",
             "Internal server error while downloading orders"
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
             "Internal server error while downloading orders",
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
       this.loadingUpload = false;
     });
  }
  onCustom($event) {
    var action = $event.action;

    if (action == "view") {
      this.onView($event);
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
  refresh(){
    this.getOrders();
  }
 
  

}
