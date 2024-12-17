import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";
import { DialogCurrencyComponent } from "./dialog-currency/dialog-currency.component";
import { CountryService } from "../../../@core/services/country.service";
import * as alertifyjs from "alertifyjs";
import { messageService } from "../../../@core/utils/messages";
import { FormGroup } from "@angular/forms";
import { CurrencyService } from "../../../@core/services/currency.service";
import { NbAccessChecker } from "@nebular/security";

@Component({
  selector: "ngx-currency",
  templateUrl: "./currency.component.html",
  styleUrls: ["./currency.component.scss"],
})
export class CurrencyComponent implements OnInit {
  optionsPager: any;
  selected: any;
  loading: boolean;
  ngOnInit(): void {
    this.accessChecker.isGranted('create', 'currencies').subscribe(granted=> this.settings.actions.add = granted);
    this.accessChecker.isGranted('create', 'currencies').subscribe(granted=> this.settings.actions.edit = granted);

    this.optionsPager = [
      { value: 5 },
      { value: 10 },
      { value: 20 },
      { value: 50 },
      { value: 100 },
    ];
    this.selected = this.optionsPager[0];
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
      description: {
        title: "Description",
        type: "string",
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
    private apiCurrency: CurrencyService,
    public accessChecker: NbAccessChecker
  ) {
    this.getCurrencies();
  }

  getCurrencies() {
    this.loading = true;
    this.apiCurrency
      .getCurrencies()
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
              "Internal server error while getting currencies"
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
      .open(DialogCurrencyComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Currency",
          id: $event.data.id,
          code: $event.data.code,
          description: $event.data.description,
          action: "Update",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getCurrencies();
        }
      });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  onAdd($event) {
    this.dialogService
      .open(DialogCurrencyComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Currency",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getCurrencies();
        }
      });
  }
  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "currencies");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }

  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "currencies");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  refresh() {
    this.loading = true;
    this.getCurrencies();
  }
}
