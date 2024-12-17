import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";

import { DialogSimulationComponent } from "./dialog-simulation/dialog-simulation.component";
import { CountryService } from "../../@core/services/country.service";
import * as alertifyjs from "alertifyjs";
import { messageService } from "../../@core/utils/messages";
import { FormGroup } from "@angular/forms";
import { TollService } from "../../@core/services/toll.service";
import { DatePipe, formatNumber, NumberFormatStyle } from "@angular/common";

import "@angular/common/locales/global/es";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { ListSimulationComponent } from "./list-simulation/list-simulation.component";
import { BalanceService } from "../../@core/services/balance.service";
import { HttpHeaders } from "@angular/common/http";
import { DialogConfirmationComponent } from "../../@theme/components/confirmation-dialog/dialog-confirmation-delete.component";
import { NbAccessChecker } from "@nebular/security";

@Component({
  selector: "ngx-simulation",
  templateUrl: "./simulation.component.html",
  styleUrls: ["./simulation.component.scss"],
})
export class SimulationComponent implements OnInit {
  defaultRowPerPage = 10;
  dataExport: any[];
  optionsPager: any;
  selected: any;
  numeral = NumberColumnType.getNumeralInstance();
  loading = false;
  ngOnInit(): void {
    this.accessChecker.isGranted('create', 'simulations').subscribe(granted=> this.settings.actions.add = granted);
    this.accessChecker.isGranted('remove', 'simulations').subscribe(granted=> this.settings.actions.delete = granted);
    this.accessChecker.isGranted('view', 'simulations').subscribe(granted=> this.settings.actions.edit = granted);
    this.optionsPager = [
      { value: 5 },
      { value: 10 },
      { value: 20 },
      { value: 50 },
      { value: 100 },
    ];
    this.selected = this.optionsPager[0];
    this.numeral.locale("es");
    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));

      this.source.setFilter([
  
        {
          field: "balance_zone_name",
          search: object["balancing_zone_label"].toString(),
          filter: (value: string, searchValue: string) => {
            return value == searchValue;
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
    delete: {
      deleteButtonContent: '<i class="fas fa-trash fa-xs" title="Delete"></i>',
    },
    edit: {
      editButtonContent: '<i class="fas fa-play fa-sm" title="Run"></i>',
    },

    columns: {
      id: {
        title: "Label",
        type: "string",
        hide: true,
      },
      label: {
        title: "Label",
        type: "string",
      },
      entity_id: {
        title: "Legal Entity Id",
        type: "number",
        hide: true,
      },
      entity_name: {
        title: "Legal Entity",
        type: "string",
      },
      start_date: {
        title: "Start Date",
        type: "string",
      },
      end_date: {
        title: "End Date",
        type: "string",
      },
   /*    country_code: {
        title: "Country",
        type: "string",
      }, */
      balance_zone_id: {
        title: "Balance Zone",
        type: "string",
        hide: true,
      },
      balance_zone_name: {
        title: "Balance Zone",
        type: "number",
      },
      timestamp: {
        title: "Last Synchronization",
        type: "string",
        hide: true
      }
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
    private apiBalance: BalanceService,
    public datepipe: DatePipe,
    public accessChecker: NbAccessChecker
  ) {
    this.getSimulations();
  }

  getSimulations() {
    this.loading=true;
    this.apiBalance.getAllBalanceSimulations().subscribe({
      next: (res) => {
        const data = res;

        this.source.load(data);
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting simulations"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    }).add(()=>{
      this.loading = false;
    });
  }

  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  onAdd($event) {
    this.dialogService
      .open(DialogSimulationComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Simulation",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getSimulations();
        }
      });
  }
  onDelete($event) {
    this.dialogService
    .open(DialogConfirmationComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        body: 'Are you sure you want to delete this balance simulation?',
        title: "Confirmation Delete",
        button: "Delete",
        status_cancel: 'basic',
        status_confirm: 'success'
      },
      autoFocus: false,
    })
    .onClose.subscribe((val) => {

      if (val === "yes") {
        this.loading= true;
        this.apiBalance.removeBalanceSimulation($event.data.id).subscribe({
          next: (res) => {
          this.getSimulations();
          this.messageService.showToast(
            "success",
            "Success",
            "Balance simulation deleted successfully!"
          );
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while getting simulations"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        })
        .add(() => {
          this.getSimulations();
          this.loading = false;
       
        });
      }
    });
    
  }
  onViewOperations($event) {
 
    this.dialogService.open(ListSimulationComponent, {
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

  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "simulations");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "simulations");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  refresh(){
    this.loading=true;
    this.getSimulations();
  }
}
