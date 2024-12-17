import { Component, OnInit } from "@angular/core";
import { NbDialogService, NbViewportRulerAdapter } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";
import { DialogLNGSupplyContractComponent } from "./dialog-lng-supply-contract/dialog-lng-supply-contract.component";
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

@Component({
  selector: 'ngx-lng-supply-contract',
  templateUrl: './lng-supply-contract.component.html',
  styleUrls: ['./lng-supply-contract.component.scss']
})
export class LNGSupplyContractComponent implements OnInit {

  numeral = NumberColumnType.getNumeralInstance();
  defaultRowPerPage = 10;
  dataExport: any[];
  filterForm!: FormGroup;
  errorDateFilter = false;
  data: any;
  start_date: any;
  end_date: any;
  submitExchangeScheduleForm!: FormGroup;
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
  }
  settings = {
    mode: "external",
    actions: {
      add: false,
      edit: true,
      delete: true,
    },
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
    },
    edit: {
      editButtonContent: '<i class="fas fa-pen fa-xs" title="Edit"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="far fa-eye"></i>',
    },

    columns: {
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
        hide: true
      },
      status: {
        title: "Status",
        type: "string",
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
      operation_type: {
        title: "P/S",
        type: "string",
      },
      hub: {
        title: "Hub",
        type: "string",
      },
      product: {
        title: "Product",
        type: "string",
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
        hide: true
      },
      currency: {
        title: "Currency",
        type: "string",
        hide: true
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
    private apiThirdPartyContract: ThirdPartyContractsService
  ) {
    this.getLNGSupplyContracts();
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

  getLNGSupplyContracts() {
    this.apiThirdPartyContract.getPurchasesSalesContracts().subscribe({
      next: (res) => {
        this.data = res;
        

        this.source.load(this.data);
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting LNG supply contracts"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  onEdit($event) {
    this.dialogService
      .open(DialogLNGSupplyContractComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit LNG Supply",
          id: $event.data.id,
          label: $event.data.label,
          registration_date: $event.data.registration_date,
          formalization_date: $event.data.formalization_date,
          status: $event.data.status,
          owner: $event.data.owner,
          venue_type: $event.data.venue_type,
          counterparty: $event.data.counterparty,
          market: $event.data.market,
          operation_type: $event.data.operation_type,
          hub: $event.data.hub,
          product: $event.data.product,
          start_date: $event.data.start_date,
          end_date: $event.data.end_date,
          quantity: $event.data.quantity,
          uom: $event.data.uom,
          price: $event.data.price,
          price_index: $event.data.price_index,
          currency: $event.data.currency,
        
          action: "Update",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getLNGSupplyContracts();
        }
      });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  onAdd($event) {
    this.dialogService
      .open(DialogLNGSupplyContractComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New LNG Supply",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getLNGSupplyContracts();
        }
      });
  }
  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "lngsupply_contracts");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  onView($event) {
    this.dialogService.open(DialogLNGSupplyContractComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        title: "View LNG Supply",
        id: $event.data.id,
        label: $event.data.label,
        registration_date: $event.data.registration_date,
        formalization_date: $event.data.formalization_date,
        status: $event.data.status,
        owner: $event.data.owner,
        venue_type: $event.data.venue_type,
        counterparty: $event.data.counterparty,
        market: $event.data.market,
        operation_type: $event.data.operation_type,
        hub: $event.data.hub,
        product: $event.data.product,
        start_date: $event.data.start_date,
        end_date: $event.data.end_date,
        quantity: $event.data.quantity,
        uom: $event.data.uom,
        price: $event.data.price,
        price_index: $event.data.price_index,
        currency: $event.data.currency,
        action: "View",
      },
      autoFocus: false,
    });
  }
  dateRange(beginDate: string, endDate: string) {
    this.source = new LocalDataSource(this.data);
    this.source.setFilter([
      {
        field: "formalization_date",
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
            ) <
              new Date(
                Number(endDateTemp.split("-")[0]),
                Number(endDateTemp.split("-")[1]) - 1,
                Number(endDateTemp.split("-")[2]) + 1
              )
          );
        },
      },
      /*    
           field: "registration_date",
           search: endDate,
           filter: (value: string, searchValue: string) => {


             return new Date(value) <= new Date(searchValue);
           },
         }, */
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
        this.excelService.exportToCsv(value, "lng_supply_contracts");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
}
