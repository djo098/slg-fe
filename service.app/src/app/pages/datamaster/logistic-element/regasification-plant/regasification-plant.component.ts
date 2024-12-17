import { Component, Input, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../../../@core/services/sharedServices/excel.service";

import { DialogRegasificationPlantComponent } from "./dialog-regasification-plant/dialog-regasification-plant.component";
import { LogisticElementService } from "../../../../@core/services/logisticElement.service";
import * as alertifyjs from "alertifyjs";
import { map, take } from "rxjs/operators";
import { stringify } from "querystring";
import { messageService } from "../../../../@core/utils/messages";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { NbAccessChecker } from "@nebular/security";
@Component({
  selector: "ngx-regasification-plant",
  templateUrl: "./regasification-plant.component.html",
  styleUrls: ["./regasification-plant.component.scss"],
})
export class RegasificationPlantComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() id: string;
  @Input() name: string;
  @Input() injection: number;
  @Input() extraction: number;
  numeral = NumberColumnType.getNumeralInstance();
  maxId: number;
  defaultRowPerPage = 10;
  dataExport: any[];
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
      /*  losses_rp: {
        title: 'Losses (%)',
        type: 'number',
        valuePrepareFunction: (value) =>{ return this.numeral(value).format('0,0.[0000000000]')  },
      }, */
      parent_id: {
        title: "Tank Id",
        type: "number",
        hide: true,
      },
      parent_name: {
        title: "Tank Label",
        type: "String",
      },
      /*      balancing_point_id: {
        title: "Balancing Point",
        type: "String",
      },  */
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
    this.getregasificationPlants();
  }

  getregasificationPlants() {
    this.loading= true;
    this.apiLogisticElement
      .getLogisticElementByType("regasification_plant", true)
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
              eic,
            }) => ({
              id,
              name,
              parent_id,
              parent_name,
              balance_zone_id,
              balance_zone_name,
              country_code,
              eic,
            })
          )
        )
        /*  map((data) => {
          return data.map((x) => {
           this.apiLogisticElement.getLogisticElementBP(x["id"]).subscribe({
            next: (res) => {
              res.map((j)=>{
                x["balancing_point_id"] = j['id']
                x["balancing_point_name"] = j['name']
              })

            }
           })
            return x;
          });
        }), */
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
              "Internal server error while getting regasification plants"
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
      .open(DialogRegasificationPlantComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit regasification Plant",
          id: $event.data.id,
          name: $event.data.name,
          //   losses: $event.data.losses_rp,
          country_code: $event.data.country_code,
          balance_zone_id: $event.data.balance_zone_id,
          vbt_id: $event.data.parent_id,
          eic: $event.data.eic,
          action: "Update",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getregasificationPlants();
        }
      });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }

  onAdd($event) {
    this.dialogService
      .open(DialogRegasificationPlantComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New regasification Plant",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getregasificationPlants();
        }
      });
  }
  exportAsXLSX() {
    this.source
      .getElements()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "regasification_plants");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSV() {
    this.source
      .getElements()
      .then((value) => {
        this.excelService.exportToCsv(value, "regasification_plants");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  
refresh() {
  this.loading = true;
  this.getregasificationPlants();
  }
}
