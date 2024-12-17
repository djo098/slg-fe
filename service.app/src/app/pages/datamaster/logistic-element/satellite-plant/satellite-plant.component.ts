import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../../../@core/services/sharedServices/excel.service";

import { DialogSatellitePlantComponent } from "./dialog-satellite-plant/dialog-satellite-plant.component";
import { LogisticElementService } from "../../../../@core/services/logisticElement.service";
import * as alertifyjs from "alertifyjs";
import { map } from "rxjs/operators";
import { messageService } from "../../../../@core/utils/messages";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { isEqual } from "date-fns";
import { NbAccessChecker } from "@nebular/security";

@Component({
  selector: 'ngx-satellite-plant',
  templateUrl: './satellite-plant.component.html',
  styleUrls: ['./satellite-plant.component.scss']
})
export class SatellitePlantComponent implements OnInit {

  defaultRowPerPage = 10;
  dataExport: any[];
  numeral = NumberColumnType.getNumeralInstance();
  optionsPager: any;
  selected: any;
  loading: boolean;
  ngOnInit(): void {
    this.accessChecker.isGranted('create', 'satellite-plants').subscribe(granted=> this.settings.actions.add = granted);
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
          field: "country_code",
          search: object['country_code'],
      
        },
        {
          field: "balance_zone_name",
          search: object['balancing_zone_label']
         
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
      tso_code: {
        title: "TSO Code",
        type: "string",
      },
      owner_id: {
        title: "Owner Id",
        type: "string",
        hide:true
      },
      owner: {
        title: "Owner",
        type: "string",
      },
      retail: {
        title: "Type",
        type: "string",
        valuePrepareFunction: (value) =>{ 
       
          if(value===true){
          return 'Retail';
        } else if(value===false){
          return 'Single-Client';
        } else{
          return '';
        } },
      },
      address: {
        title: "Address",
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
    this.getSatellitePlants();
  }

  getSatellitePlants() {
    this.loading = true;
    this.apiLogisticElement
      .getLogisticElementByType("satellite_plant", true)
      .pipe(
        map((data) =>
          data.map(
            ({
              id,
              name,
              balance_zone_id,
              balance_zone_name,
              country_code,
              owner_id,
              owner,
              address,
              retail,
              tso_code,
            }) => ({
              id,
              name,
              balance_zone_id,
              balance_zone_name,
              country_code,
              owner_id,
              owner,
              address,
              retail,
              tso_code,
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
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting satellite plants"
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
      .open(DialogSatellitePlantComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Satellite Plant",
          id: $event.data.id,
          name: $event.data.name,
          owner: $event.data.owner_id,
          country_code: $event.data.country_code,
          balance_zone_id: $event.data.balance_zone_id,
          tso_code: $event.data.tso_code,
          address: $event.data.address,
          retail: $event.data.retail,
          action: "Update",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getSatellitePlants();
        }
      });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  onAdd($event) {
    this.dialogService
      .open(DialogSatellitePlantComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Satellite Plant",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getSatellitePlants();
        }
      });
  }
  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "satellite_plants");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "satellite_plants");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }

  refresh() {
    this.loading = true;
    this.getSatellitePlants();
    }

}
