import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";

import { DialogConnectionPointComponent } from "./dialog-connection-point/dialog-connection-point.component";
import { CountryService } from "../../../@core/services/country.service";
import * as alertifyjs from "alertifyjs";
import { messageService } from "../../../@core/utils/messages";
import { FormGroup } from "@angular/forms";
import { ConnectionPointService } from "../../../@core/services/connectionPoint.service";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { NbAccessChecker } from "@nebular/security";

@Component({
  selector: "ngx-connection-point",
  templateUrl: "./connection-point.component.html",
  styleUrls: ["./connection-point.component.scss"],
})
export class ConnectionPointComponent implements OnInit {
  defaultRowPerPage = 10;
  dataExport: any[];
  toggleNgModel = false;
  optionsPager : any;
  selected : any;
  numeral = NumberColumnType.getNumeralInstance();
  loading: boolean;
  ngOnInit(): void {
    this.accessChecker.isGranted('create', 'connection-points').subscribe(granted=> this.settings.actions.add = granted);
    this.accessChecker.isGranted('create', 'satellite-plants').subscribe(granted=> this.settings.actions.edit = granted);

    this.optionsPager = [
      { value: 5 },
      { value: 10 },
      { value: 20 },
      { value: 50 },
      { value: 100 },
    ];
    this.selected = this.optionsPager[0];
    this.numeral.locale("es");
    var object = localStorage.getItem('settings_parameters');
    if(object){
      object= JSON.parse(localStorage.getItem('settings_parameters'));
    
        this.source.setFilter([
          {
            field: "country_code_le",
            search: object['country_code'],
             filter: (value: string, searchValue: string) => {
              return new Date(value) == new Date(searchValue);
            }, 
          },
          {
            field: "balance_zone_le",
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
        title: "Id",
        type: "number",
        hide: true,
      },
      name: {
        title: "Name",
        type: "string",
      },
      connection_type: {
        title: "Connection Type",
        type: "number",
      },
      src_dest_losses: {
        title: 'Losses Source (%)',
        type: 'number',
        valuePrepareFunction: (value) =>{ return this.numeral(value*100).format('0,0.[0000000000]')  },
      }, 
      dest_src_losses: {
        title: 'Losses Destination (%)',
        type: 'number',
        valuePrepareFunction: (value) =>{ return this.numeral(value*100).format('0,0.[0000000000]')  },
      },
      eic: {
        title: "EIC Code",
        type: "string", 
      },
      le_label: {
        title: "Logistic Element 1 (Source)",
        type: "number",
      },
      logistic_element_id: {
        title: "Logistic Element Id",
        type: "number",
        hide: true,
      },
      logistic_element_adjacent_id: {
        title: "Logistic Element Adjacent",
        type: "number",
        hide: true,
      },
      le_adjacent_label: {
        title: "Logistic Element 2 (Destination)",
        type: "number",
      },
      country_code_le: {
        title: "Country 1 (Source)",
        type: "string",
      },
      country_code_le_adj: {
        title: "Country 2 (Destination)",
        type: "string",
        hide: this.toggleNgModel
      },
      balance_zone_id_le: {
        title: "Balance Zone",
        type: "number",
        hide: true,
      },
      balance_zone_le: {
        title: "Balance Zone 1 (Source)",
        type: "string",
      },
      balance_zone_id_le_adj: {
        title: "Balance Zone ",
        type: "number",
        hide: true,
      },
      balance_zone_le_adj: {
        title: "Balance Zone 2 (Destination)",
        type: "label",
        hide: this.toggleNgModel,
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
    private apiConnectionPoint: ConnectionPointService,
    public accessChecker: NbAccessChecker
  ) {
    this.getConnectionPoints();
  }

  getConnectionPoints() {
    this.loading = true;
    this.apiConnectionPoint.getConnectionPoints().subscribe({
      next: (res) => {
        const data = res;


        this.source.load(data);
      
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting connection points"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    }).add(()=>{
      this.loading=false;
    });;
  }

  onEdit($event) {
   
    this.dialogService
      .open(DialogConnectionPointComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Connection Point",
          id: $event.data.id,
          label: $event.data.name,
          connection_type: $event.data.connection_type,
          eic: $event.data.eic,
          country_code: $event.data.country_code_le,
          country_code_adj: $event.data.country_code_le_adj,
          logistic_element_id: $event.data.logistic_element_id,
          logistic_element_adjacent_id: $event.data.logistic_element_adjacent_id,
          balance_zone_id: $event.data.balance_zone_id_le,
          balance_zone_id_adj: $event.data.balance_zone_id_le_adj,
          losses_src: $event.data.src_dest_losses,
          losses_dest: $event.data.dest_src_losses,
          cf_src: $event.data.src_dest_temp_factor,
          cf_dest: $event.data.dest_src_temp_factor,
          mirrored_point: $event.data.mirrored_point,
          action: "Update",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getConnectionPoints();
        }
      });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  onAdd($event) {
    this.dialogService
      .open(DialogConnectionPointComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Connection Point",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getConnectionPoints();
        }
      });
  }
  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "Connection Points");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "Connection Points");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  onToggle($event) {
 
   this.settings.columns.balance_zone_le_adj.hide=!this.toggleNgModel
   this.settings.columns.country_code_le_adj.hide=!this.toggleNgModel
   this.settings = Object.assign({}, this.settings);

    
  }
  refresh() {
    this.loading = true;
    this.getConnectionPoints();
    }
}
