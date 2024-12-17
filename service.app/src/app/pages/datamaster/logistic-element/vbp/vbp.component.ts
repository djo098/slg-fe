import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../../../@core/services/sharedServices/excel.service";

import { DialogVbpComponent } from "./dialog-vbp/dialog-vbp.component";
import { LogisticElementService } from "../../../../@core/services/logisticElement.service";
import * as alertifyjs from "alertifyjs";
import { map } from "rxjs/operators";
import { messageService } from "../../../../@core/utils/messages";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { NbAccessChecker } from "@nebular/security";
@Component({
  selector: "ngx-vbp",
  templateUrl: "./vbp.component.html",
  styleUrls: ["./vbp.component.scss"],
})
export class VbpComponent implements OnInit {
  defaultRowPerPage = 10;
  dataExport: any[];
  numeral = NumberColumnType.getNumeralInstance();
  optionsPager: any;
  selected: any;
  loading: boolean;
  ngOnInit(): void {
    this.accessChecker.isGranted('create', 'balancing-points').subscribe(granted=> this.settings.actions.add = granted);
    this.accessChecker.isGranted('create', 'balancing-points').subscribe(granted=> this.settings.actions.edit = granted);

    
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
        }
      ]) 
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
      /*   losses_vp: {
        title: 'Losses (%)',
        type: 'number',
        valuePrepareFunction: (value) =>{ return this.numeral(value).format('0,0.[0000000000]') },
      }, */
      /*    linepack: {
        title: 'Line Pack',
        type: 'number',
        valuePrepareFunction: (value) =>{ return this.numeral(value).format('0,0.[0000000000]')  },
      }, */
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
      /*   rule_id: {
        title: 'Name',
        type: 'number',
        hide: true
      },
      rule_label: {
        title: 'Rules',
        type: 'string',
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
    public accessChecker: NbAccessChecker
  ) {
    this.getVBP();
  }

  getVBP() {
    this.loading=true;
    this.apiLogisticElement
      .getLogisticElementByType("virtual_balancing_point", true)
      .pipe(
        map((data) =>
          data.map(
            ({
              id,
              name,
              balance_zone_id,
              balance_zone_name,
              country_code,
              linepack,
              eic,
            }) => ({
              id,
              name,
              balance_zone_id,
              balance_zone_name,
              country_code,
              linepack,
              eic,
            })
          )
        )
      )

      .subscribe({
        next: (res) => {
          const data = res;
;
          this.source.load(data);
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting virtual balancing points"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      }).add(()=>{
        this.loading=false;
      });
  }
  onEdit($event) {
    this.dialogService
      .open(DialogVbpComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Virtual Balancing Point",
          id: $event.data.id,
          name: $event.data.name,
          linepack: $event.data.linepack,
          country_code: $event.data.country_code,
          balance_zone_id: $event.data.balance_zone_id,
          eic: $event.data.eic,
          action: "Update",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getVBP();
        }
      });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  onAdd($event) {
    this.dialogService
      .open(DialogVbpComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Virtual Balancing Point",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getVBP();
        }
      });
  }
  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "virtual_balancing_points");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "virtual_balancing_points");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  refresh(){
    this.loading = true;
    this.getVBP();
  }
}
