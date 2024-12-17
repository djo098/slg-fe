import { Component, OnInit } from "@angular/core";
import { NbDialogService, NbViewportRulerAdapter } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";
import { DialogVirtualExchangesComponent } from "./dialog-virtual-exchanges/dialog-virtual-exchanges.component";
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
  selector: 'ngx-virtual-exchanges',
  templateUrl: './virtual-exchanges.component.html',
  styleUrls: ['./virtual-exchanges.component.scss']
})
export class VirtualExchangesComponent implements OnInit {

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
  loading = false;
  ngOnInit(): void {
    this.accessChecker.isGranted('create', 'virtual-swaps-contracts').subscribe(granted=> this.settings.actions.add = granted);
    this.accessChecker.isGranted('create', 'virtual-swaps-contracts').subscribe(granted=> this.settings.actions.edit = granted);
    this.accessChecker.isGranted('view', 'virtual-swaps-contracts').subscribe(granted=> this.settings.actions.delete = granted);
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
    this.submitExchangeScheduleForm = this.formBuilder.group({
      date: new FormControl("", [
        Validators.required,
        this.dateRangeValidatorSubmit,
      ]),
      extension: new FormControl(""),
    });
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

    /*       custom: [
            {
              name: 'edit',
              title: '<i class="fas fa-pen fa-xs" title="Edit"></i>',
            },
            {
              name: 'view',
              title: '<i class="far fa-eye"></i>',
            },
            {
              name: 'trash',
              title: '<i class="nb-trash"></i>',
            },
          ],
         */

    columns: {
      id: {
        title: "id",
        type: "number",
        hide: true,
      },
      formalization_date: {
        title: "Registration Date",
        type: "string",
        valuePrepareFunction: (value) => {
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
        },
        filter: false,
      },
      label: {
        title: "Contract Label",
        type: "string",
      },
      owner: {
        title: "Legal Entity",
        type: "string",
      },
      owner_id: {
        title: "Legal Entity Id",
        type: "string",
        hide: true,
      },
      counterparty: {
        title: "Counterparty",
        type: "string",
      },
      counterparty_id: {
        title: "Counterparty Id",
        type: "string",
        hide: true,
      },
 /*      fee: {
        title: "Fee",
        type: "number",
        valuePrepareFunction: (value) => {
          return this.numeral(value).format("0,0.[0000000000]");
        },
      },
      fee_currency: {
        title: "Currency",
        type: "string",
      }, */
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
    this.getExchanges();
  }
  private dateRangeValidatorSubmit: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date =
      this.submitExchangeScheduleForm &&
      this.submitExchangeScheduleForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.submitExchangeScheduleForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.submitExchangeScheduleForm.get("date").value.end,
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
      this.errorDateRangeSubmit = true;
    } else {
      this.errorDateRangeSubmit = false;
    }

    return invalid
      ? {
          invalidRange: {},
        }
      : null;
  };
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

  getExchanges() {
    this.loading = true;
    this.apiThirdPartyContract.getAllThirdPartyContractsVirtual('third_party_swap').subscribe({
      next: (res) => {
        this.data = res;

        this.source.load(this.data);
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting gas exchanges contracts"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    }).add(()=>{
      this.loading = false;
    });
  }
  onEdit($event) {
    this.dialogService
      .open(DialogVirtualExchangesComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Swap",
          id: $event.data.id,
          registration_date: $event.data.formalization_date,
          contract_label: $event.data.label,
          contract_id: $event.data.swap_code,
          legal_entity: $event.data.owner_id,
          country_code: $event.data.country_code,
          balancing_zone: $event.data.balancing_zone_id,
          counterparty: $event.data.counterparty_id,
          counterparty_label: $event.data.counterparty,
          fee: $event.data.fee,
          fee_unit: $event.data.fee_currency,
          action: "Update",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getExchanges();
        }
      });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  onAdd($event) {
    this.dialogService
      .open(DialogVirtualExchangesComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Swap",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getExchanges();
        }
      });
  }
  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "swap_contracts");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  onView($event) {
    this.dialogService.open(DialogVirtualExchangesComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        title: "View Swap",
        id: $event.data.id,
        registration_date: $event.data.formalization_date,
        contract_label: $event.data.label,
        contract_id: $event.data.exchange_code,
        legal_entity: $event.data.owner_id,
        country_code: $event.data.country_code,
        balancing_zone: $event.data.balancing_zone_id,
        counterparty: $event.data.counterparty_id,
        counterparty_label: $event.data.counterparty,
        fee: $event.data.fee,
        fee_unit: $event.data.fee_currency,
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
        this.excelService.exportToCsv(value, "swap_contracts");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }

  
  refresh(){
    this.loading= true;
    this.getExchanges();
  }

  /* ... */


}
