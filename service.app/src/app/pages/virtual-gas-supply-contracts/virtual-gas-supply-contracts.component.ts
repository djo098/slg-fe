import { Component, OnInit } from "@angular/core";
import { NbDialogService, NbViewportRulerAdapter } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";
import { DialogVirtualGasSupplyContractsComponent } from "./dialog-virtual-gas-supply-contracts/dialog-virtual-gas-supply-contracts.component";
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
import { ThirdPartyContractsService } from "../../@core/services/thirdPartyContracts.service";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { NbAccessChecker } from "@nebular/security";



@Component({
  selector: 'ngx-virtual-gas-supply-contracts',
  templateUrl: './virtual-gas-supply-contracts.component.html',
  styleUrls: ['./virtual-gas-supply-contracts.component.scss']
})
export class VirtualGasSupplyContractsComponent implements OnInit {
  numeral = NumberColumnType.getNumeralInstance();
  defaultRowPerPage = 10;
  dataExport: any[];
  filterForm!: FormGroup;
  errorDateFilter = false;
  data: any;
  start_date: any;
  loading = false;
  end_date: any;
  submitExchangeScheduleForm!: FormGroup;
  errorDateRangeSubmit = false;
  selected = 10;
  optionsPager: any;
  filterEvent = false;
  ngOnInit(): void {
   this.accessChecker.isGranted('create', 'virtual-purchase-sale-contracts').subscribe(granted=> this.settings.actions.add = granted); 
    this.accessChecker.isGranted('create', 'virtual-purchase-sale-contracts').subscribe(granted=> this.settings.actions.edit = granted);
    this.accessChecker.isGranted('view', 'virtual-purchase-sale-contracts').subscribe(granted=> this.settings.actions.delete = granted);
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
  
    } else {
      this.getContracts();
    }
  }
  settings = {
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
      deleteButtonContent: '<i class="fas fa-eye fa-sm" title="View"></i>',
    },
    columns: {
      supply_type: {
        title: "Supply Contract Type",
        type: "string",
        hide: true,
      },
      name: {
        title: "Name",
        type: "string",
        valuePrepareFunction: (value) => {
          if (value) {
            return value.replaceAll('_',' ')
          } else {
            return "";
          }
        },
      },
      label: {
        title: "Trade ID",
        type: "number",
      },
      formalization_date: {
        title: "Trade Date",
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
      registration_date: {
        title: "Registration Date",
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
        hide: true,
      },
 
      owner: {
        title: "Legal Entity",
        type: "string",
      },

      venue_type: {
        title: "Contract Type",
        type: "string",
      },
      market: {
        title: "Market",
        type: "string",
      },
      counterparty: {
        title: "Counter Party",
        type: "string",
      },
      broker: {
        title: "Broker",
        type: "string",
      },
      operation_type: {
        title: "P/S",
        type: "string",
      },

      product: {
        title: "Product",
        type: "string",
      },
      source_infrastructure_id: {
        title: "Source Infrastructure Id",
        type: "string",
        hide: true
      },
      source_infrastructure: {
        title: "Source Infrastructure",
        type: "string"
      },
      internal_mirrored_id: {
        title: "Internal Mirrored id",
        type: "string",
        hide: true
      },
      internal_mirrored: {
        title: "Internal Mirrored",
        type: "string",
        hide: true
      },
      start_date: {
        title: "Start Period",
        type: "string",

        filter: false,
      },
      end_date: {
        title: "End Period",
        type: "string",
        filter: false,
      },

      quantity: {
        title: "Quantity",
        type: "number",
        valuePrepareFunction: (value) => {
          return this.numeral(value).format("0,0.[0000000000]");
        },
      },
      uom: {
        title: "UOM",
        type: "string",
      },
      price: {
        title: "Price",
        type: "number",
        hide: true,
        valuePrepareFunction: (value) => {
          return this.numeral(value).format("0,0.[0000000000]");
        },
      },
      price_index: {
        title: "Price Index",
        type: "string",
        hide: true,
      },
      currency: {
        title: "Currency",
        type: "string",
        hide: true,
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
    private apiThirdPartyContract: ThirdPartyContractsService,
    public accessChecker: NbAccessChecker
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

  getContracts() {
    this.loading = true;
    this.apiThirdPartyContract
      .getAllThirdPartyContractsVirtual("third_party_purchase_sale")
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
              "Internal server error while getting gas virtual purcahse/sale contracts"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.loading = false;
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
      .open(DialogVirtualGasSupplyContractsComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Contract",
          id: $event.data.id,
          label: $event.data.label,
          name: $event.data.name,
          formalization_date: $event.data.formalization_date,
          owner: $event.data.owner_id,
          venue_type: $event.data.venue_type,
          counterparty: $event.data.counterparty_id,
          counterparty_label: $event.data.counterparty,
          market: $event.data.market_id,
          operation_type: $event.data.operation_type,
          product: $event.data.product,
          start_date: $event.data.start_date,
          end_date: $event.data.end_date,
          quantity: $event.data.quantity,
          uom: $event.data.uom,
          broker: $event.data.broker_id,
          broker_label: $event.data.broker,
          source_infrastructure_id: $event.data.source_infrastructure_id,
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
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  onAdd($event) {
    this.dialogService
      .open(DialogVirtualGasSupplyContractsComponent, {
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
  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "spot_contracts");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  onView($event) {
    this.dialogService.open(DialogVirtualGasSupplyContractsComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        title: "View Contract",
        id: $event.data.id,
        label: $event.data.label,
        name: $event.data.name,
        formalization_date: $event.data.formalization_date,
        owner: $event.data.owner_id,
        venue_type: $event.data.venue_type,
        counterparty: $event.data.counterparty_id,
        counterparty_label: $event.data.counterparty,
        market: $event.data.market_id,
        operation_type: $event.data.operation_type,
        product: $event.data.product,
        start_date: $event.data.start_date,
        end_date: $event.data.end_date,
        quantity: $event.data.quantity,
        uom: $event.data.uom,
        broker: $event.data.broker_id,
        broker_label: $event.data.broker,
        source_infrastructure_id: $event.data.source_infrastructure_id,
        action: "View",
      },
      autoFocus: false,
    });
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
  reset() {
    this.filterEvent=false;
    this.source = new LocalDataSource(this.data);
    this.filterForm.controls["date"].setValue("");
  }
  filter() {
    this.filterEvent=true;
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
        this.excelService.exportToCsv(value, "spot_contracts");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  refresh(){
    this.getContracts();
  }
}
