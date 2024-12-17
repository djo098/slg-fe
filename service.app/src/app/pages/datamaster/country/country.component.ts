import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";
import { DialogCountryComponent } from "./dialog-country/dialog-country.component";
import { CountryService } from "../../../@core/services/country.service";
import * as alertifyjs from "alertifyjs";
import { messageService } from "../../../@core/utils/messages";
import { FormGroup } from "@angular/forms";
import { NbAccessChecker } from "@nebular/security";
@Component({
  selector: "ngx-country",
  templateUrl: "./country.component.html",
  styleUrls: ["./country.component.scss"],
})
export class CountryComponent implements OnInit {
  defaultRowPerPage = 10;
  dataExport: any[];
  optionsPager: any;
  selected: any;
  columns = [
    {
      name: "Greeting",
      prop: "name",
    },
    {
      prop: "details",
    },
  ];
  rows = [
    {
      name: "I am",
      details: "Angular",
    },
    {
      name: "Hello",
      details: "Angular",
    },
  ];
  loading: boolean;
  ngOnInit(): void {
    this.accessChecker.isGranted('create', 'countries').subscribe(granted=> this.settings.actions.add = granted);
    this.accessChecker.isGranted('create', 'countries').subscribe(granted=> this.settings.actions.edit = granted);

    this.optionsPager = [
      { value: 5 },
      { value: 10 },
      { value: 20 },
      { value: 50 },
      { value: 100 },
    ];
    this.selected = this.optionsPager[0];
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
      code: {
        title: "Code",
        type: "string",
      },
      name: {
        title: "Name",
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
    private apiCountry: CountryService,
    public accessChecker: NbAccessChecker
  ) {
    this.getcountries();

 
  }

  getcountries() {
    this.loading = true;
    this.apiCountry.getcountries().subscribe({
      next: (res) => {
        const data = res;

        this.source.load(data);
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting countries"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    })
    .add(()=>{
            this.loading=false;
          });;
  }
  onEdit($event) {
    this.dialogService
      .open(DialogCountryComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Country",
          code: $event.data.code,
          description: $event.data.name,
          action: "Update",
        },
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getcountries();
        }
      });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  onAdd($event) {
    this.dialogService
      .open(DialogCountryComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Country",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getcountries();
        }
      });
  }
  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "countries");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "countries");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  refresh() {
    this.loading = true;
    this.getcountries();
    }
}
