import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";

import { DialogBalancingZoneComponent } from "./dialog-balancing-zone/dialog-balancing-zone.component";
import { BalanceZoneService } from "../../../@core/services/balanceZone.service";
import { Console } from "console";
import { LegalEntityService } from "../../../@core/services/legalEntity.service";
import * as alertifyjs from "alertifyjs";
import { map } from "rxjs/operators";
import { messageService } from "../../../@core/utils/messages";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { NbAccessChecker } from "@nebular/security";
@Component({
  selector: "ngx-balancing-zone",
  templateUrl: "./balancing-zone.component.html",
  styleUrls: ["./balancing-zone.component.scss"],
})
export class BalancingZoneComponent implements OnInit {
  optionsPager: any;
  selected: any;
  @Component({
    selector: "ngx-balancing-zone",
    templateUrl: "./entity.component.html",
    styleUrls: ["./entity.component.scss"],
  })
  numeral = NumberColumnType.getNumeralInstance();
  defaultRowPerPage = 10;
  dataExport: any[];
  loading: boolean;
  ngOnInit(): void {
    this.accessChecker.isGranted('create', 'balancing-zones').subscribe(granted=> this.settings.actions.add = granted);
    this.accessChecker.isGranted('create', 'balancing-zones').subscribe(granted=> this.settings.actions.edit = granted);

    this.numeral.locale("es");
    this.optionsPager = [
      { value: 5 },
      { value: 10 },
      { value: 20 },
      { value: 50 },
      { value: 100 },
    ];
    this.selected = this.optionsPager[0];
    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.source.setFilter([
        {
          field: "country_code",
          search: object["country_code"],
          filter: (value: string, searchValue: string) => {
            return new Date(value) == new Date(searchValue);
          },
        },
      ]);
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
        title: "id",
        type: "string",
        hide: true,
      },
      label: {
        title: "Label",
        type: "string",
      },
      country_code: {
        title: "Country",
        type: "string",
      },
      tso_id: {
        title: "TSO",
        type: "string",
        hide: true,
      },
      /*  loss_type: {
        title: 'Calculate Losses Mode',
        type: 'string',
      }, */
      day_start_time: {
        title: "Gas Day Start Time",
        type: "string",
      },
      timezone: {
        title: "Time Zone",
        type: "string",
      },
      renomination_delta: {
        title: "Renomination Delta",
        type: "number",
        valuePrepareFunction: (value) => {
          return this.numeral(value).format("0,0.[0000000000]");
        },
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
    private apiBalanceZone: BalanceZoneService,
    public accessChecker: NbAccessChecker
  ) {
    this.getbalanceZones();
  }

  getbalanceZones() {
    this.loading = true;
    this.apiBalanceZone
      .getBalanceZones()
      .pipe(
        map((data) =>
          data.map(
            ({
              id,
              label,
              country_code,
              loss_type,
              tso_id,
              day_start_time,
              timezone,
              renomination_delta,
            }) => ({
              id,
              label,
              country_code,
              loss_type,
              tso_id,
              day_start_time,
              timezone,
              renomination_delta,
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
              "Internal server error while getting balancing zones"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      }).add(()=>{
        this.loading=false
      });
  }
  onEdit($event) {
    this.dialogService
      .open(DialogBalancingZoneComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Balancing Zone",
          id: $event.data.id,
          label: $event.data.label,
          country: $event.data.country_code,
          loss_type: $event.data.loss_type,
          tso: $event.data.tso_id,
          day_start_time: $event.data.day_start_time,
          timezone: $event.data.timezone,
          renomination_delta: $event.data.renomination_delta,
          action: "Update",
        },
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getbalanceZones();
        }
      });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  onAdd($event) {
    this.dialogService
      .open(DialogBalancingZoneComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Balancing Zone",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getbalanceZones();
        }
      });
  }

  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "balancing_zones");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "balancing_zones");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  refresh(){
    this.loading = true;
    this.getbalanceZones();
  }
}
