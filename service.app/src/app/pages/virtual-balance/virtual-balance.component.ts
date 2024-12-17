import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { BalanceService } from "../../@core/services/balance.service";

import { messageService } from "../../@core/utils/messages";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";
import { DialogVirtualBalanceComponent } from "./dialog-virtual-balance/dialog-virtual-balance.component";
import { VirtualBalanceDetailComponent } from "./virtual-balance-detail/virtual-balance-detail.component";
import { DialogConfirmationComponent } from "../../@theme/components/confirmation-dialog/dialog-confirmation-delete.component";
import { NbAccessChecker } from "@nebular/security";
import { ThirdPartyContractsService } from "../../@core/services/thirdPartyContracts.service";
@Component({
  selector: 'ngx-virtual-balance',
  templateUrl: './virtual-balance.component.html',
  styleUrls: ['./virtual-balance.component.scss']
})
export class VirtualBalanceComponent implements OnInit {
  defaultRowPerPage = 5;
  loading = false;
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
    delete: {
      deleteButtonContent: '<i class="fas fa-trash fa-xs" title="Delete"></i>',
    },
    edit: {
      editButtonContent: '<i class="fas fa-play fa-sm" title="Run"></i>',
    },

    columns: {
      id: {
        title: "id",
        type: "number",
        hide: true
      },
      label: {
        title: "Label",
        type: "string",
      },
      entity_id: {
        title: "Legal Entity Id",
        type: "number",
        hide: true
      },
      entity: {
        title: "Legal Entity",
        type: "number",
      },
      start_date: {
        title: "Start Date",
        type: "string",
      },
      end_date: {
        title: "End Date",
        type: "string",
      },
      balance_zone_id: {
        title: "Balancing Zone Id",
        type: "number",
        hide: true
      },
      balance_zone: {
        title: "Balancing Zone",
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

  source: LocalDataSource = new LocalDataSource();
  optionsPager: { value: number; }[];
  selected: any;
  constructor(
    private dialogService: NbDialogService,
    private apiBalance: BalanceService,
    private messageService: messageService,
    private excelService: ExcelService,
    public accessChecker: NbAccessChecker,

  ) {
    this.getVirtualBalances();
  }

  ngOnInit(): void {
    this.accessChecker.isGranted('create', 'virtual-balance').subscribe(granted=> this.settings.actions.add = granted);
    this.accessChecker.isGranted('remove', 'virtual-balance').subscribe(granted=> this.settings.actions.delete = granted);
    this.accessChecker.isGranted('view', 'virtual-balance').subscribe(granted=> this.settings.actions.edit = granted);
    this.optionsPager = [
      { value: 5 },
      { value: 10 },
      { value: 20 },
      { value: 50 },
      { value: 100 },
    ];
    var object = localStorage.getItem('settings_parameters');
    if(object){
      object= JSON.parse(localStorage.getItem('settings_parameters'));
       this.source.setFilter([
        {
          field: "country",
          search: object['country_code'],
           filter: (value: string, searchValue: string) => {
            return new Date(value) == new Date(searchValue);
          }, 
        },
        {
          field: "balance_zone",
          search: object['balancing_zone_label'],
           filter: (value: string, searchValue: string) => {
            return new Date(value) == new Date(searchValue);
          }, 
        }]) 
      
    }
  

  }
  getVirtualBalances() {
    this.loading = true;
    this.apiBalance.getAllVirtualBalances().subscribe({
      next: (res) => {

        const data = res;
        
        this.source.load(data);
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting list of columns"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    }).add(()=>{
      this.loading=false;
    }
     
    );
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  onAdd($event) {
    this.dialogService
      .open(DialogVirtualBalanceComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
         title: "Add Virtual Balance",
          action: "Add", 
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getVirtualBalances();
        }
      });
  }
  

  
  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "virtual_balances");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "virtual_balances");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  refresh(){
    this.loading=true;
    this.getVirtualBalances();
  }
  onViewOperations($event) {
 
    this.dialogService.open(VirtualBalanceDetailComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      autoFocus: false,
      context: {
        id: $event.data.id,
        start_date: $event.data.start_date,
        end_date: $event.data.end_date,
        label: $event.data.label
      
      }
    });
  }
  onDelete($event) {
    this.dialogService
    .open(DialogConfirmationComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        body: 'Are you sure you want to delete this virtual balance',
        title: "Confirmation Delete",
        button: "Delete",
        status_cancel: 'danger',
        status_confirm: 'success'
      },
      autoFocus: false,
    })
    .onClose.subscribe((val) => {

      if (val === "yes") {
        this.loading= true;
        this.apiBalance.removeVirtualBalance($event.data.id).subscribe({
          next: (res) => {
          this.getVirtualBalances();
          this.messageService.showToast(
            "success",
            "Success",
            "Virtual balance deleted successfully!"
          );
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while getting virtual balances"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        })
        .add(() => {
          this.getVirtualBalances();
          this.loading = false;
       
        });
      }
    });
    
  }
  

}
