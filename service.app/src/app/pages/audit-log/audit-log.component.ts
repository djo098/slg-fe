import { Component, OnInit } from "@angular/core";
import { NbDialogService, NbViewportRulerAdapter } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";
import { DialogAuditLogComponent } from "./dialog-audit-log/dialog-audit-log.component";
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
import { AuditService } from "../../@core/services/audit.service";
import NumberColumnType from "@revolist/revogrid-column-numeral";

@Component({
  selector: 'ngx-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss']
})
export class AuditLogComponent implements OnInit {

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
     
      timestamp: {
        title: "Time",
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
        sortDirection: 'desc',
      },
      user_id: {
        title: "User",
        type: "string",
      },
      source: {
        title: "Source",
        type: "string",
      },
      destination: {
        title: "Destination",
        type: "string",
      },
      endpoint: {
        title: "Endpoint",
        type: "string",
      },
      method: {
        title: "Method",
        type: "string",
      },
      status: {
        title: "status",
        type: "html",
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
          } else if   (cell !=200  && search == 'error') {

            return true;
          }else {
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
    private apiAuditService: AuditService
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
    this.loading = true;
    this.apiAuditService
      .getLogs(8)
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
    this.dialogService.open(DialogAuditLogComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        request_data:  $event.data.request_data,
        timestamp:  $event.data.timestamp,
        user_id:  $event.data.user_id,
        status:  $event.data.status,
        source:  $event.data.source,
        response_data:  $event.data.response_data,
        resource:  $event.data.resource,
        method:  $event.data.method,
        endpoint:  $event.data.endpoint,
        destination:  $event.data.destination,
        id:  $event.data.id,
        title: "Audit log detail"
/*         title: "View Contract",
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
        action: "View", */
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
