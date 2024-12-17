import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";

import { DialogTollComponent } from "./dialog-toll/dialog-toll.component";
import { CountryService } from "../../../@core/services/country.service";
import * as alertifyjs from "alertifyjs";
import { messageService } from "../../../@core/utils/messages";
import { FormGroup } from "@angular/forms";
import { TollService } from "../../../@core/services/toll.service";
import { formatNumber, NumberFormatStyle } from "@angular/common";

import "@angular/common/locales/global/es";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { NbAccessChecker } from "@nebular/security";
@Component({
  selector: "ngx-toll",
  templateUrl: "./toll.component.html",
  styleUrls: ["./toll.component.scss"],
})
export class TollComponent implements OnInit {
  defaultRowPerPage = 10;
  dataExport: any[];
  optionsPager: any;
  selected: any;
  numeral = NumberColumnType.getNumeralInstance();
  loading: boolean;
  ngOnInit(): void {
    this.accessChecker
      .isGranted("create", "tolls-types")
      .subscribe((granted) => (this.settings.actions.add = granted));
    this.accessChecker
      .isGranted("create", "tolls-types")
      .subscribe((granted) => (this.settings.actions.edit = granted));

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
          field: "country_code",
          search: object["country_code"],
          filter: (value: string, searchValue: string) => {
            return new Date(value) == new Date(searchValue);
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
    },
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
    },
    edit: {
      editButtonContent: '<i class="fas fa-pen fa-xs" title="Edit"></i>',
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
      min_pressure: {
        title: "Min Pressure",
        type: "number",
        valuePrepareFunction: (value) => {
          return this.numeral(value).format("0,0.[0000000000]");
        },
      },
      max_pressure: {
        title: "Max Pressure",
        type: "number",
        valuePrepareFunction: (value) => {
          return this.numeral(value).format("0,0.[0000000000]");
        },
      },
      min_capacity: {
        title: "Min Capacity",
        type: "number",
        valuePrepareFunction: (value) => {
          return this.numeral(value).format("0,0.[0000000000]");
        },
      },
      max_capacity: {
        title: "Max Capacity",
        type: "number",
        valuePrepareFunction: (value) => {
          return this.numeral(value).format("0,0.[0000000000]");
        },
      },
      fixed_total: {
        title: "Fixed Total",
        type: "number",
        valuePrepareFunction: (value) => {
          return this.numeral(value).format("0,0.[0000000000]");
        },
      },
      variable_total: {
        title: "Variable Total",
        type: "number",
        valuePrepareFunction: (value) => {
          return this.numeral(value).format("0,0.[0000000000]");
        },
      },
      country_code: {
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
    private apiToll: TollService,
    public accessChecker: NbAccessChecker
  ) {
    this.getTolls();
  }

  getTolls() {
    this.loading = true;
    this.apiToll
      .getAllTollTypes()
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
              "Internal server error while getting tolls"
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

  onEdit($event) {
    this.dialogService
      .open(DialogTollComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Toll",
          id: $event.data.id,
          label: $event.data.label,
          min_pressure: $event.data.min_pressure,
          max_pressure: $event.data.max_pressure,
          min_capacity: $event.data.min_capacity,
          max_capacity: $event.data.max_capacity,
          fixed_total: $event.data.fixed_total,
          variable_total: $event.data.variable_total,
          country_code: $event.data.country_code,
          balance_zone_id: $event.data.balance_zone_id,
          action: "Update",
        },
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getTolls();
        }
      });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  onAdd($event) {
    this.dialogService
      .open(DialogTollComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Toll",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getTolls();
        }
      });
  }
  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "tolls");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "tolls");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  refresh() {
    this.loading = true;
    this.getTolls();
  }
}
