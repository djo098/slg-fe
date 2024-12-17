import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";
import { CountryService } from "../../@core/services/country.service";
import * as alertifyjs from "alertifyjs";
import { messageService } from "../../@core/utils/messages";
import { FormGroup } from "@angular/forms";
import { TollService } from "../../@core/services/toll.service";
import { DatePipe, formatNumber, NumberFormatStyle } from "@angular/common";
import "@angular/common/locales/global/es";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { BalanceService } from "../../@core/services/balance.service";
import { HttpHeaders } from "@angular/common/http";
import { DialogConfirmationComponent } from "../../@theme/components/confirmation-dialog/dialog-confirmation-delete.component";
import { NbAccessChecker } from "@nebular/security";
import { DialogOptimizationComponent } from "./dialog-optimization/dialog-optimization.component";
import { DialogResultsComponent } from "./dialog-results/dialog-results.component";
import { OptimizationService } from "../../@core/services/optimization.service";

@Component({
  selector: "slg-optimization",
  templateUrl: "./optimization.component.html",
  styleUrls: ["./optimization.component.scss"],
})
export class OptimizationComponent implements OnInit {
  defaultRowPerPage = 10;
  dataExport: any[];
  optionsPager: any;
  selected: any;
  numeral = NumberColumnType.getNumeralInstance();
  loading = false;
  ngOnInit(): void {
    this.accessChecker
      .isGranted("create", "optimization")
      .subscribe((granted) => (this.settings.actions.add = granted));
      this.accessChecker
      .isGranted("remove", "logistic-contracts")
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
      this.accessChecker
      .isGranted("create", "logistic-contracts")
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
      .isGranted("create", "logistic-contracts")
      .subscribe((granted) =>
        granted == false
          ? this.settings.actions.custom.map((x, index) => {
              x.name == "execute"
                ? this.settings.actions.custom.splice(index, 1)
                : "";
              return x;
            })
          : ""
      );
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
          field: "country",
          search: object["country_code"],
          filter: (value: string, searchValue: string) => {
            return value == searchValue;
          },
        },
        {
          field: "balance_zone",
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
      custom: [
        {
          name: "edit",
          title: '<i class="fas fa-pen fa-xs" title="Edit"></i>',
        },
        {
          name: "execute",
          title: '<i class="fas fa-play fa-sm" title="Execute"></i>',
        },
        {
          name: "delete",
          title: '<i class="fas fa-trash fa-xs" title="Delete"></i>',
        },
      ],
    },
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
    },
    /*     delete: {
      deleteButtonContent: '<i class="fas fa-trash fa-xs" title="Delete"></i>',
    },
    edit: {
      editButtonContent: '<i class="fas fa-play fa-sm" title="Run"></i>',
    }, */

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
      legal_entity_id: {
        title: "Legal Entity Id",
        type: "number",
        hide: true,
      },
      legal_entity: {
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
      simulation: {
        title: "Simulation",
        type: "string",
      },
      simulation_id: {
        title: "Simulation Id",
        type: "string",
        hide: true,
      },
        country: {
        title: "Country",
        type: "string",
      }, 
      balance_zone_id: {
        title: "Balance Zone",
        type: "string",
        hide: true,
      },
      balance_zone: {
        title: "Balance Zone",
        type: "number",
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
    private apiOptimization: OptimizationService,
    public datepipe: DatePipe,
    public accessChecker: NbAccessChecker
  ) {
    this.getOptimizations();
  }

  getOptimizations() {
    this.loading = true;
    this.apiOptimization
      .getOptimizationScenarios()
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
              "Internal server error while getting optimizations"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.loading = false;
      });
  }

  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  onAdd($event) {
    this.dialogService
      .open(DialogOptimizationComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Optimization Scenario",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getOptimizations();
        }
      });
  }
  onDelete($event) {
    this.dialogService
      .open(DialogConfirmationComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          body: "Are you sure you want to delete this optimization scenario?",
          title: "Confirmation Delete",
          button: "Delete",
          status_cancel: "basic",
          status_confirm: "success",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "yes") {
          this.loading = true;
          this.apiOptimization
            .removeOptimizationScenario($event.data.id)
            .subscribe({
              next: (res) => {
                this.getOptimizations();
                this.messageService.showToast(
                  "success",
                  "Success",
                  "Optimization scenario deleted successfully!"
                );
              },
              error: (e) => {
                if (e.error.title == "Internal Server Error") {
                  this.messageService.showToast(
                    "danger",
                    "Error",
                    "Internal server error while getting optimizations"
                  );
                } else {
                  this.messageService.showToast("danger", "Error", e.error);
                }
              },
            })
            .add(() => {
              this.getOptimizations();
              this.loading = false;
            });
        }
      });
  }
  onExecute($event) {
    this.dialogService.open(DialogResultsComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      autoFocus: false,
      context: {
        id: $event.data.id,
        start_date: $event.data.start_date,
        end_date: $event.data.end_date,
        label: $event.data.label
    
      },
    });
  }
  onEdit($event) {
    this.dialogService
    .open(DialogOptimizationComponent, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
      context: {
        title: "Edit Optimization Scenario",
        action: "Update",
        id: $event.data.id,
        label: $event.data.label,
        country: $event.data.country,
        balancing_zone_id: $event.data.balance_zone_id,
        legal_entity_id: $event.data.legal_entity_id,
        start_date: $event.data.start_date,
        end_date: $event.data.end_date,
        simulation_id: $event.data.simulation_id,
        curves_ids: $event.data.price_curve_ids,
      },
      autoFocus: false,
    })
    .onClose.subscribe((val) => {
      if (val === "save") {
        this.getOptimizations();
      }
    });

  }

  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "optimizations");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "optimizations");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  refresh() {
    this.loading = true;
    this.getOptimizations();
  }
  onCustom($event) {
    var action = $event.action;

    if (action == "edit") {
      this.onEdit($event);
    }
    if (action == "execute") {
      this.onExecute($event);
    }
    if (action == "delete") {
      this.onDelete($event);
    }
  }
}
