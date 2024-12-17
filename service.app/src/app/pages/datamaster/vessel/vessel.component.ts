import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";
import { CountryService } from "../../../@core/services/country.service";
import * as alertifyjs from "alertifyjs";
import { messageService } from "../../../@core/utils/messages";
import { FormGroup } from "@angular/forms";
import { CurrencyService } from "../../../@core/services/currency.service";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { VesselService } from "../../../@core/services/vessel.service";
import { DialogVesselComponent } from "./dialog-vessel/dialog-vessel.component";
import { NbAccessChecker } from "@nebular/security";
@Component({
  selector: 'ngx-vessel',
  templateUrl: './vessel.component.html',
  styleUrls: ['./vessel.component.scss']
})
export class VesselComponent implements OnInit {
  optionsPager: any;
  selected: any;
  numeral = NumberColumnType.getNumeralInstance();
  loading: boolean;
  ngOnInit(): void {
    this.accessChecker.isGranted('create', 'vessels').subscribe(granted=> this.settings.actions.add = granted);
    this.accessChecker.isGranted('create', 'vessels').subscribe(granted=> this.settings.actions.edit = granted);

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
        title: "IMO",
        type: "string",
      },
      name: {
        title: "Name",
        type: "string",
      },
      capacity: {
        title: "Capacity",
        type: 'number',
        valuePrepareFunction: (value) =>{ return this.numeral(value).format('0,0.[0000000000]') },
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
    this.getVessels();
  }

  getVessels() {
    this.loading= true;
    this.apiVessel.getVessels().subscribe({
      next: (res) => {
        const data = res;

        this.source.load(data);
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting vessels"
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
      .open(DialogVesselComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Vessel",
          id: $event.data.id,
          code: $event.data.code,
          name: $event.data.name,
          capacity: $event.data.capacity,
          action: "Update",
        },
        autoFocus: false
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getVessels();
        }
      });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  onAdd($event) {
    this.dialogService
      .open(DialogVesselComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Vessel",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getVessels();
        }
      });
  }
  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "vessels");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }

  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "vessels");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  refresh() {
    this.loading = true;
    this.getVessels();
    }

}
