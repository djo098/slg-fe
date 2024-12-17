import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
} from "@angular/forms";
import { DatePipe } from "@angular/common";

import { NbDialogRef, NbDialogService } from "@nebular/theme";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { AuditService } from "../../../@core/services/audit.service";
import { DarkModeService } from "../../../@core/services/sharedServices/darkMode.service";
import { messageService } from "../../../@core/utils/messages";

@Component({
  selector: "ngx-dialog-audit-log-structured",
  templateUrl: "./dialog-audit-log-structured.component.html",
  styleUrls: ["./dialog-audit-log-structured.component.scss"],
})
export class DialogAuditLogStructuredComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() id: number;
  operationForm!: FormGroup;
  columns: any;
  rows = [];
  validateRevogrid = true;
  errorSatelital = false;
  satelitalOptions: any;
  labelSatelital: any;
  logisticContractsOptions: any;
  regasificationPlantOptions: any;
  errorRegasificationPlant = false;
  entitiesOptions: any;
  entitiesOptions2: any;
  errorLegalEntity = false;
  errorLegalEntity2 = false;
  zoneOptions: any;
  errorBalanceZone = false;
  countriesOptions: any;
  errorLogisticContract = false;
  loading = false;
  selectedLogisticContracts: any;
  numeral = NumberColumnType.getNumeralInstance();
  isDuplicate = false;
  start_date: any;
  end_date: any;
  balanceZone: any;
  legalEntity: any;
  connection_point: any;
  settings = {
    singleSelection: true,
    text: "",
    enableSearchFilter: true,
    badgeShowLimit: 2,
  };
  revogridTheme: string;
  eventTimes1 = [];
  constructor(
    private formBuilder: FormBuilder,
    public datepipe: DatePipe,
    protected ref: NbDialogRef<DialogAuditLogStructuredComponent>,
    private apiAuditService: AuditService,
    private darkModeService: DarkModeService,
    private messageService: messageService
  ) { }

  ngOnInit(): void {
    this.numeral.locale("es");
    this.darkModeService.isDarkMode == true
      ? (this.revogridTheme = "darkMaterial")
      : (this.revogridTheme = "material");
    this.darkModeService.darkModeChange.subscribe((value) => {
      value == true
        ? (this.revogridTheme = "darkMaterial")
        : (this.revogridTheme = "material");
    });
    this.operationForm = this.formBuilder.group({
      id: new FormControl("")
    });
    this.loading = true;
    this.operationForm.get("id").setValue(this.id);
    this.getStructuredLog(this.id);
    this.operationForm.disable();
    this.columns = [
      {
        prop: "date",
        name: "Date",
        size: 120,
        readonly: true,
        sortable: true,
      },
      {
        prop: "counterparty",
        name: "Counterparty",
        size: 200,
        readonly: true,
        sortable: true,
      },
      {
        prop: "service",
        name: "Service",
        size: 275,
        readonly: true,
        sortable: true,
      },
      {
        prop: "infrastructure",
        name: "Infrastructure",
        size: 150,
        readonly: true,
        sortable: true,
      },
      {
        prop: "value",
        name: "Energy (Kwh)",
        size: 120,
        readonly: true,
        sortable: true,
        cellProperties: ({ prop, model, data, column }) => {
          return {
            class: {
              numeric: true,
            },
          };
        },
      },
    ];
    this.settings = Object.assign({ disabled: true }, this.settings);
    this.loading = false
  }
  getStructuredLog(id) {
    this.apiAuditService
      .getLogStructure(id)
      .subscribe({
        next: (res) => {
          res = res.map((c) => {
            c.value = this.numeral(Number(c.value)).format(
              "0,0.[00]"
            );
            return c;
          });
          this.rows = res;
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting structured log"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        document.querySelector("revo-grid").source = [];
        document.querySelector("revo-grid").source = this.rows;
      });
  }
  onAfterEdit($event) { }
  onBeforeEditStart(e, { detail }) { }
  onBeforeEdit(e, { detail }) { }
  onBeforeRangeEdit(e, { detail }) { }
  cancel() {
    this.ref.close();
  }
  clean(obj) {
    for (var propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      }
    }
    return obj;
  }

}
