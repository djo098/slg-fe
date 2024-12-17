import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";
import { DialogSourceLocationComponent } from "./dialog-source-location/dialog-source-location.component";
import { CountryService } from "../../../@core/services/country.service";
import * as alertifyjs from "alertifyjs";
import { messageService } from "../../../@core/utils/messages";
import { FormGroup } from "@angular/forms";
import { CurrencyService } from "../../../@core/services/currency.service";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { VesselService } from "../../../@core/services/vessel.service";
import { NbAccessChecker } from "@nebular/security";
@Component({
  selector: "ngx-source-location",
  templateUrl: "./source-location.component.html",
  styleUrls: ["./source-location.component.scss"],
})
export class SourceLocationComponent implements OnInit {
  optionsPager: any;
  selected: any;
  numeral = NumberColumnType.getNumeralInstance();
  loading: boolean;
  ngOnInit(): void {
    this.accessChecker.isGranted('create', 'sources').subscribe(granted=> this.settings.actions.add = granted);
    this.accessChecker.isGranted('create', 'sources').subscribe(granted=> this.settings.actions.edit = granted);

    this.optionsPager = [
      { value: 5 },
      { value: 10 },
      { value: 20 },
      { value: 50 },
      { value: 100 },
    ];
    this.selected = this.optionsPager[0];
    this.numeral.locale("es");
   
  }
  defaultRowPerPage = 10;
  dataExport: any[];

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
        hide: true,
      },
      code: {
        title: "Code",
        type: "string",
      },
      name: {
        title: "Name",
        type: "string",
      },
      country_code: {
        title: "Country",
        type: "string",
      },
      gas_density: {
        title: "Higher Calorific Value (kWh/m3)",
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
    attr: {
      class: "table",
    },
  };

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private messageService: messageService,
    private dialogService: NbDialogService,
    private excelService: ExcelService,
    private apiVessel: VesselService,
    public accessChecker: NbAccessChecker
  ) {
    this.getSources();
  }

  getSources() {
    this.loading = true;
    this.apiVessel.getSources().subscribe({
      next: (res) => {
        const data = res;

        this.source.load(data);
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting sources"
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
      .open(DialogSourceLocationComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Source",
          id: $event.data.id,
          code: $event.data.code,
          name: $event.data.name,
          country_code: $event.data.country_code,
          gas_density: $event.data.gas_density,
          action: "Update",
        },
        autoFocus: false
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getSources();
        }
      });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  onAdd($event) {
    this.dialogService
      .open(DialogSourceLocationComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Source",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getSources();
        }
      });
  }
  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "sources");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }

  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "sources");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  refresh() {
    this.loading = true;
    this.getSources();
    }
}
