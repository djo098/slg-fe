import { Component, Input, OnInit } from "@angular/core";
import { NbDialogService, NbViewportRulerAdapter } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";
import { DialogExchangesComponent } from "./dialog-exchanges/dialog-exchanges.component";
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
import { DialogScheduleComponent } from "./dialog-schedule/dialog-schedule.component";
import { NbAccessChecker } from "@nebular/security";
import { DialogConfirmationComponent } from "../../@theme/components/confirmation-dialog/dialog-confirmation-delete.component";
@Component({
  selector: "button-view",
  template: `
  <nb-actions size="small">
  <nb-action class='more-action'
    icon="more-vertical-outline"
    [matMenuTriggerFor]="actionMenu"
  ></nb-action>
</nb-actions>
<mat-menu #actionMenu="matMenu" yPosition="below" xPosition="before">
<button mat-menu-item [matMenuTriggerFor]="TSOMenu" class="action-button" *nbIsGranted="['create', 'swap-contracts']">
TSO Action
</button>
</mat-menu>
<mat-menu #TSOMenu="matMenu" yPosition="below" xPosition="before">
<button
mat-menu-item
class="action-button"
(click)="openDialogScheduling3()"
>
Submit Scheduling
</button>
<button
mat-menu-item
class="action-button"
[matMenuTriggerFor]="TSOExportMenu"
>
Export Data
</button>
</mat-menu>
<mat-menu #TSOExportMenu="matMenu" yPosition="below" xPosition="before">
<button
mat-menu-item
class="action-button"
(click)="openDialogScheduling1()"
>
XLS Scheduling
</button>
<button
mat-menu-item
class="action-button"
(click)="openDialogScheduling2()"
>
XML Scheduling
</button>
</mat-menu>
  `,
})
export class ButtonViewComponent implements OnInit {
  renderValue: string;

  @Input() value: string | number;
  @Input() rowData: any;
  ngOnInit() {

  }
  constructor(
    private dialogService: NbDialogService,
 
  ) {
   
  }
  openDialogScheduling1() {
    this.dialogService.open(DialogScheduleComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        title: "Export to XLS",
        contractCode : this.rowData.swap_code,
        startDate : this.rowData.start_date,
        endDate : this.rowData.end_date,
        action: "Export",
      },
      autoFocus: false,
    });
  }
  openDialogScheduling2() {
    this.dialogService.open(DialogScheduleComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        title: "Export to XML",
        contractCode : this.rowData.swap_code,
        startDate : this.rowData.start_date,
        endDate : this.rowData.end_date,
        action: "Export",
      },
      autoFocus: false,
    });
  }
  openDialogScheduling3() {
    this.dialogService.open(DialogScheduleComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        title: "Submit to TSO",
        contractCode : this.rowData.swap_code,
        startDate : this.rowData.start_date,
        endDate : this.rowData.end_date,
        action: "Submit",
      },
      autoFocus: false,
    });
  }
}
@Component({
  selector: "ngx-exchanges",
  templateUrl: "./exchanges.component.html",
  styleUrls: ["./exchanges.component.scss"],
})
export class ExchangesComponent implements OnInit {
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
    this.accessChecker.isGranted('create', 'swap-contracts').subscribe(granted=> this.settings.actions.add = granted);
    this.accessChecker
      .isGranted('create', 'swap-contracts')
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
      .isGranted('remove', 'swap-contracts')
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
/*     this.accessChecker.isGranted('create', 'swap-contracts').subscribe(granted=> this.settings.actions.edit = granted); */
    this.accessChecker.isGranted('create', 'swap-contracts').subscribe(granted=> this.settings.columns.button.hide = !granted);
/*     this.accessChecker.isGranted('view', 'swap-contracts').subscribe(granted=> this.settings.actions.delete = granted); */
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
        sortDirection: 'desc',
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
      swap_code: {
        title: "Contract Code",
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
      fee: {
        title: "Fee",
        type: "number",
        valuePrepareFunction: (value) => {
          return this.numeral(value).format("0,0.[0000000000]");
        },
      },
      fee_currency: {
        title: "Currency",
        type: "string",
      },
      button: {
        title: "",
        hide: true,
        type: "custom",
        filter: false,
        renderComponent: ButtonViewComponent,
     /*     onComponentInitFunction(instance) {
          instance.save.subscribe(row => {
            alert(`${row.name} saved!`)
          });
        }  */
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
    this.apiThirdPartyContract.getGasSwapContracts().subscribe({
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
      .open(DialogExchangesComponent, {
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
      .open(DialogExchangesComponent, {
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
    this.dialogService.open(DialogExchangesComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        title: "View Swap",
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
  openDialogScheduling1() {
    this.dialogService.open(DialogScheduleComponent, {
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
    this.dialogService.open(DialogScheduleComponent, {
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
    this.dialogService.open(DialogScheduleComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        title: "Submit to TSO",

        action: "Submit",
      },
      autoFocus: false,
    });
  }
  onDelete($event){
    this.dialogService
    .open(DialogConfirmationComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        body: 'Are you sure you want to delete this swap contract? This contract will be removed in SLG and will be cancelled in ETRM.',
        title: "Confirmation Delete",
        button: "Delete",
        status_cancel: 'basic',
        status_confirm: 'danger'
      },
      autoFocus: false,
    })
    .onClose.subscribe((val) => {

      if (val === "yes") {
        this.loading= true;
        this.apiThirdPartyContract
        .removeGasSwapContract(Number($event.data.id))
        .subscribe({
          next: (res) => {
            
            this.messageService.showToast(
              "success",
              "Success",
              "Swap contract deleted successfully!"
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
          this.getExchanges();
       
        });
      }
    });

  }
  refresh(){
    this.loading= true;
    this.getExchanges();
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
  /* ... */
}
