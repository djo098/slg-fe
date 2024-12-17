import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { BalanceService } from "../../@core/services/balance.service";
import { DialogLayoutManagementComponent } from "./dialog-layout-management/dialog-layout-management.component";
import { messageService } from "../../@core/utils/messages";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";
import { NbAccessChecker } from "@nebular/security";
@Component({
  selector: "ngx-layout-management",
  templateUrl: "./layout-management.component.html",
  styleUrls: ["./layout-management.component.scss"],
})
export class LayoutManagementComponent implements OnInit {
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
    edit: {
      editButtonContent: '<i class="fas fa-pen fa-xs" title="Edit"></i>',
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
      legal_entity_id: {
        title: "Legal Entity Id",
        type: "number",
        hide: true
      },
      legal_entity: {
        title: "Legal Entity",
        type: "number",
      },
      oversea_trading_point_id: {
        title: "Oversea Trading Point Id",
        type: "number",
        hide: true
      },
     /*  oversea_trading_point_label: {
        title: "Oversea Trading Point",
        type: "number",
      }, */

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
    public accessChecker: NbAccessChecker
  ) {
    this.getLayouts();
  }

  ngOnInit(): void {
    this.accessChecker.isGranted('create', 'layout').subscribe(granted=> this.settings.actions.add = granted);
    this.accessChecker.isGranted('create', 'layout').subscribe(granted=> this.settings.actions.edit = granted);
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
  getLayouts() {
    this.loading = true;
    this.apiBalance.getBalanceLayoutConfiguration().subscribe({
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
      .open(DialogLayoutManagementComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Add Layout Configuration",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getLayouts();
        }
      });
  }
  onEdit($event) {
    this.dialogService
      .open(DialogLayoutManagementComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Layout Configuration",
          action: "Update",
          id: $event.data.id,
          label: $event.data.label,
          balance_zone: $event.data.balance_zone_id,
          legal_entity: $event.data.legal_entity_id,
          country: $event.data.country,
          connection_point: $event.data.connection_points,
          oversea_trading_point_id : $event.data.infrastructures
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getLayouts();
        }
      });
  }
  onDelete($event) {}
  
  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "layouts_balance");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "layouts_balance");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  refresh(){
    this.loading=true;
    this.getLayouts();
  }
}
