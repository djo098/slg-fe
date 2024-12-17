import { Component, OnInit } from "@angular/core";
import { NbDialogService, NbViewportRulerAdapter } from "@nebular/theme"; 
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";
import { DialogWorkflowLogComponent } from "./dialog-workflow-log/dialog-workflow-log.component";
import { DialogWorkflowLogStructuredComponent } from "./dialog-workflow-log-structured/dialog-workflow-log-structured.component"; 
import { messageService } from "../../@core/utils/messages";
import { isThursday } from "date-fns";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import * as moment from "moment";
import { DatePipe } from "@angular/common";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { WorkflowService } from "../../@core/services/workflow.service";

@Component({
  selector: 'slg-workflow-log',
  templateUrl: './workflow-log.component.html',
  styleUrls: ['./workflow-log.component.scss']
})
export class WorkflowLogComponent implements OnInit {

  step_name: string;
  step_result: string;
  workflow_name: string;
  country: string;
  balancing_zone: string;
  legal_entity: string;
  timestamp_end: string;
  label: string;
  request_data: string;
  timestamp: string;
  user_id: string;
  status: string;
  //source: string;   Not needed in this page
  response_data: string;
  resource: string;
  method: string;
  endpoint: string;
  destination: string;

  numeral = NumberColumnType.getNumeralInstance();
  defaultRowPerPage = 10;
  dataExport: any[];
  filterForm!: FormGroup;
  errorDateFilter = false;
  data: any;
  start_date: any;
  loading = false;
  end_date: any;
  errorDateRangeSubmit = false;
  selected = 10;
  optionsPager: any;

  ngOnInit(): void {
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
      this.getLogs();
    } else {
      this.getLogs();
    }
  }
  settings = {
    mode: "external",
    actions: {
      add: false,
      edit: false,
      delete: true,
    },
    delete: {
      deleteButtonContent: '<i class="fas fa-search fa-sm" title="View"></i>',
    },
    columns: {
      
      step_name: {   
        title: "Step",
        type: "string",
        width: "200px",
      },
      step_result: {  
        title: "Step Result",
        type: "string",
        width: "225px",


      },
      start_time: {
        title: "Start Time",
        type: "string",
        valuePrepareFunction: (value) => {
          if (value) {
            return this.datepipe.transform(
              new Date(
                value.split("-")[0],
                value.split("-")[1] - 1,
                value.split("-")[2].split("T")[0],
                value.split("-")[2].split("T")[1].split(":")[0],
                value.split("-")[2].split("T")[1].split(":")[1],
                value.split("-")[2].split("T")[1].split(":")[2].replace("Z", "")
              ),
              "yyyy-MM-dd HH:mm"
            );
          } else {
            return "";
          }
        },
        filter: false,
        //sortDirection: 'desc',
      },

      end_time: {
        title: "End Time",
        type: "string",
        valuePrepareFunction: (value) => {
          if (value) {
            return this.datepipe.transform(
              new Date(
                value.split("-")[0],
                value.split("-")[1] - 1,
                value.split("-")[2].split("T")[0],
                value.split("-")[2].split("T")[1].split(":")[0],
                value.split("-")[2].split("T")[1].split(":")[1],
                value.split("-")[2].split("T")[1].split(":")[2].replace("Z", "")
              ),
              "yyyy-MM-dd HH:mm"
            );
          } else {
            return "";
          }
        },
        filter: false,
      },


      workflow: {
        title: "Workflow",
        type: "string",
        width: "155px",
        filter: {
          type: 'list',
          config: {
            selectText: 'All',
            list: [
              { value: 'Auto-nomination', title: 'Auto-nomination' },
            ],
          },
        },
        
      },

      label: {
        title: "Label",
        type: "string",
      },
      country: {
        title: "Country",
        type: "string",
        width: "140px",
      },
      balancing_zone: {
        title: "Balancing Zone",
        type: "string",
        width: "140px",

      },
      legal_entity: {
        title: "Legal Entity",
        type: "string",
      },

      status: {
        title: "Status",
        type: "html",
        width: "180px",
        valuePrepareFunction: (value) => {
          if (value) {
            return value==200 ? ' <i class="fas fa-check-circle fa-lg icon-success"></i>	&nbsp;	&nbsp;	&nbsp;Success' : '<i class="fas fa-times-circle fa-lg"></i>	&nbsp;	&nbsp;	&nbsp;Error'
          } else {
            return "";
          }
        },
        filter: {
          type: 'list',
          config: {
            selectText: 'All',
            list: [
              { value: 'success', title: 'Success' },
              { value: 'error', title: 'Error' },
              
            ],
          },
        },
        
        filterFunction(cell?: any, search?: string): boolean {        
          if (cell ==200  && search == 'success') {

            return true;
          } else if   (cell !=200  && search == 'error' && cell !== null) {

            return true;
          } else {
            return false;
          }          
        }
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

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private messageService: messageService,
    private dialogService: NbDialogService,
    private excelService: ExcelService,
    private formBuilder: FormBuilder,
    public datepipe: DatePipe,
    private apiWorkflow: WorkflowService,
  ) {

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

  getLogs() {
    this.numeral.locale("es");
    this.loading = true;
    this.apiWorkflow.getWorkflowLogs(8)
      .subscribe({
        next: (res) => {

          this.data = res.sort((a, b) => (new Date(a.start_time) < new Date(b.start_time)) ? 1 : -1); 
      
          
          if (this.data && this.data.length > 0) {

            this.data.map((m)=>{
              if(m["step_name"]== "Generate Balance" || m["step_name"]== "Imbalance Check"){

                const segments = m["step_result"].split(" // ");
                const result: { [key: string]: string } = {};
                
            
                segments.forEach(segment => {
                    const [name, value] = segment.split(": ");
                    const numericValue = this.numeral(Number(value.trim()).toFixed(0)).format("0,0.[0000]") 
                    
                    result[name.trim()] = numericValue;
                    return segment
                    
                });

                m["step_result"] = JSON.stringify(result).replaceAll('"','').replaceAll(/[{}]/g, '').replaceAll(/,(?=[a-zA-Z])/g, ' // ').replaceAll(':',': ');
              }
              
            })

          }   


          this.source.load(this.data);
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting logs"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.loading = false;
      });

 }

  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }

  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "logs");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }

  onView($event) {
    this.dialogService.open(DialogWorkflowLogStructuredComponent, { 
      
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        request_data:  $event.data.request_data,
        timestamp:  $event.data.start_time,
        user_id:  $event.data.user_id,
        status:  $event.data.status,
        source:  $event.data.source,
        response_data:  $event.data.response_data,
        resource:  $event.data.resource,
        method:  $event.data.method,
        endpoint:  $event.data.endpoint,
        destination:  $event.data.destination,
        id:  $event.data.id,
        title: "Step Result Details", 
        step_name: $event.data.step_name, 
        // step_result: $event.data.step_result, // If I need to Add step_result to the Dialog Window
        
      

        /*
        title: "View Contract",
        id: $event.data.id,
        label: $event.data.label,
        name: $event.data.name,
        registration_date: $event.data.registration_date,
        formalization_date: $event.data.formalization_date,
        status: $event.data.status,
        owner: $event.data.owner,
        venue_type: $event.data.venue_type,
        counterparty: $event.data.counterparty,
        market: $event.data.market,
        market_ccp: $event.data.market_ccp,
        operation_type: $event.data.operation_type,
        product: $event.data.product,
        start_date: $event.data.start_date,
        end_date: $event.data.end_date,
        quantity: $event.data.quantity,
        uom: $event.data.uom,
        price: $event.data.price,
        price_index: $event.data.price_index,
        currency: $event.data.currency,
        broker: $event.data.broker,
        source_infrastructure_id: $event.data.source_infrastructure_id,
        internal_mirrored: $event.data.internal_mirrored,
        action: "View", 
        */
      },
      autoFocus: false,
    });
  }

  

  getStructuredRequestData(id) {
    this.dialogService.open(DialogWorkflowLogStructuredComponent, {
      closeOnEsc: true,
      closeOnBackdropClick: false,
      context: {
        title: "Step Result - Details",
        action: "View",
        id: id,
        request_data: this.request_data,
        timestamp: this.timestamp,
        user_id: this.user_id,
        status: this.status,
        // source: this.source,
        response_data: this.response_data,
        resource: this.resource,
        method: this.method,
        endpoint: this.endpoint,
        destination: this.destination,
        // step_name: this.step_name, // If I need to Add step_name to the Dialog Window
        // step_result: this.step_result, // If I need to Add step_result to the Dialog Window
      },
      autoFocus: false,
    });
  }

  dateRange(beginDate: string, endDate: string) {
    this.source = new LocalDataSource(this.data);
    this.source.setFilter([
      {
        field: "timestamp",
        search: beginDate,
        filter: (value: string, searchValue: string) => {
          var beginDateTemp = this.datepipe.transform(beginDate, "yyyy-MM-dd");
          var endDateTemp = this.datepipe.transform(endDate, "yyyy-MM-dd");
          var valueTemp = this.datepipe.transform(value, "yyyy-MM-dd");

          return (
            new Date(
              Number(valueTemp.split("-")[0]),
              Number(valueTemp.split("-")[1]) - 1,
              Number(valueTemp.split("-")[2])
            ) >=
              new Date(
                Number(beginDateTemp.split("-")[0]),
                Number(beginDateTemp.split("-")[1]) - 1,
                Number(beginDateTemp.split("-")[2])
              ) &&
            new Date(
              Number(valueTemp.split("-")[0]),
              Number(valueTemp.split("-")[1]) - 1,
              Number(valueTemp.split("-")[2])
            ) <=
              new Date(
                Number(endDateTemp.split("-")[0]),
                Number(endDateTemp.split("-")[1]) - 1,
                Number(endDateTemp.split("-")[2]) + 1
              )
          );
        },
      },

    ]);
  }
  reset() {
    this.source = new LocalDataSource(this.data);
    this.filterForm.controls["date"].setValue("");
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

  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "logs");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  refresh(){
    this.getLogs();
  }

}
