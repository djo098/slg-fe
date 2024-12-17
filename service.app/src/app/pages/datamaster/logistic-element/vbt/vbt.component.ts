import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../../../@core/services/sharedServices/excel.service";

import { DialogVbtComponent } from "./dialog-vbt/dialog-vbt.component";
import { LogisticElementService } from "../../../../@core/services/logisticElement.service";
import * as alertifyjs from "alertifyjs";
import { map } from "rxjs/operators";
import { BalanceRuleService } from "../../../../@core/services/balanceRule.service";
import { messageService } from "../../../../@core/utils/messages";
import { NbAccessChecker } from "@nebular/security";
@Component({
  selector: "ngx-vbt",
  templateUrl: "./vbt.component.html",
  styleUrls: ["./vbt.component.scss"],
})
export class VbtComponent implements OnInit {
  defaultRowPerPage = 10;
  dataExport: any[];
  items: any;
  optionsPager : any;
  selected : any;
  loading: boolean;
  ngOnInit(): void {
    this.accessChecker.isGranted('create', 'LNG-tanks').subscribe(granted=> this.settings.actions.add = granted);
    this.accessChecker.isGranted('create', 'LNG-tanks').subscribe(granted=> this.settings.actions.edit = granted);

    this.optionsPager = [
      { value: 5 },
      { value: 10 },
      { value: 20 },
      { value: 50 },
      { value: 100 },
    ];
    this.selected = this.optionsPager[0];
    var object = localStorage.getItem('settings_parameters');
    if(object){
      object= JSON.parse(localStorage.getItem('settings_parameters'));
       this.source.setFilter([
        {
          field: "country_code",
          search: object['country_code'],
           filter: (value: string, searchValue: string) => {
            return new Date(value) == new Date(searchValue);
          }, 
        },
        {
          field: "balance_zone_name",
          search: object['balancing_zone_label'].toString(),
           filter: (value: string, searchValue: string) => {
;
            return value== searchValue
          }, 
        }]) 
    }
  }
  settings = {
    mode: "external",
    actions: {
      add: true,
      edit: true,
      delete: false,
      view: true,
    },
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
    },
    edit: {
      editButtonContent: '<i class="fas fa-pen fa-xs" title="Edit"></i>',
    },
    columns: {
      id: {
        title: "Id",
        type: "number",
        hide: true,
      },
      name: {
        title: "Name",
        type: "string",
      },
      parent_id: {
        title: "Balance Point",
        type: "string",
        hide: true,
      },
      parent_name: {
        title: "Virtual Balancing Point",
        type: "string",
      },
      balance_zone_id: {
        title: "Balance Zone",
        type: "string",
        hide: true,
      },
      balance_zone_name: {
        title: "Balancing Zone",
        type: "string",
      },
      country_code: {
        title: "Country",
        type: "string",
      },
      eic: {
        title: "EIC Code",
        type: "string",
      },
      /*   balance_zone_name: {
        title: 'Balance Zone',
        type: 'string'
      },
      country_code: {
        title: 'Country',
        type: 'string'
      },
      rule: {
        title: 'Rule',
        type: 'string'
      } */
    },
    pager: {
      display: true,
      perPage: this.defaultRowPerPage,
    },
  };

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private messageService: messageService,
    private dialogService: NbDialogService,
    private excelService: ExcelService,
    private apiLogisticElement: LogisticElementService,
    private apiBalanceRule: BalanceRuleService,
    public accessChecker: NbAccessChecker
  ) {
    this.getVBT();
  }

  getVBT() {
    this.apiLogisticElement
      .getLogisticElementByType("tank", false)
      .pipe(
        map((data) =>
          data.map(
            ({
              id,
              name,
              parent_id,
              parent_name,
              balance_zone_id,
              balance_zone_name,
              country_code,
              eic
            }) => ({
              id,
              name,
              parent_id,
              parent_name,
              balance_zone_id,
              balance_zone_name,
              country_code,
              eic
            })
          )
        )
      )
      .subscribe({
        next: (res) => {
          const data = res;
          this.source.load(data);
        },
        error: (e) => {
          if (e.error.title == 'Internal Server Error') {
            this.messageService.showToast('danger','Error','Internal server error while getting LNG tanks')
            } else {
              this.messageService.showToast('danger','Error',e.error);
       
            }
        },
      }).add(()=>{
        this.loading=false;
      });;
  }
  onEdit($event) {
    this.dialogService
      .open(DialogVbtComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit LNG Tank",
          id: $event.data.id,
          name: $event.data.name,
          vbp_id: $event.data.parent_id,
          balance_zone_id: $event.data.balance_zone_id,
          eic: $event.data.eic,
          action: "Update",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getVBT();
        }
      });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  onAdd($event) {
    this.dialogService
      .open(DialogVbtComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New LNG Tank",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getVBT();
        }
      });
  }
  exportAsXLSX() {
    this.source
      .getElements()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "LNG_tanks");
      })
      .catch((e) => {
        this.messageService.showToast('danger','Error',e);
      });
  }
  exportAsCSV() {
    this.source
      .getElements()
      .then((value) => {
        this.excelService.exportToCsv(value, "LNG_tanks");
      })
      .catch((e) => {
        this.messageService.showToast('danger','Error',e);
      });
  }
refresh(){
  this.loading = true;
  this.getVBT();
}
}
