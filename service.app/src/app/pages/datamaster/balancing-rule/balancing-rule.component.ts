import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";

import { DialogRuleComponent } from "./dialog-rule/dialog-rule.component";
import { BalanceRuleService } from "../../../@core/services/balanceRule.service";
import { BalanceRuleParameterService } from "../../../@core/services/balanceRuleParameter.service";
import { DialogParameterComponent } from "./dialog-parameter/dialog-parameter.component";
import * as alertifyjs from "alertifyjs";
import { map } from "rxjs/operators";
import { messageService } from "../../../@core/utils/messages";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { NbAccessChecker } from "@nebular/security";
@Component({
  selector: "ngx-balancing-rule",
  templateUrl: "./balancing-rule.component.html",
  styleUrls: ["./balancing-rule.component.scss"],
})
export class BalancingRuleComponent implements OnInit {
  defaultRowPerPageRule = 10;
  defaultRowPerPageParameter = 10;
  dataExport: any[];
  paramsOptions: any;
  optionsPager: any;
  selectedRule: any;
  selectedParameter: any;
  numeral = NumberColumnType.getNumeralInstance();
  loading: boolean;
  ngOnInit(): void {
    this.accessChecker
      .isGranted("create", "balancing-rules")
      .subscribe((granted) => (this.settingsParameters.actions.add = granted));
    this.accessChecker
      .isGranted("create", "balancing-rules")
      .subscribe((granted) => (this.settingsParameters.actions.edit = granted));
   /*    this.accessChecker
      .isGranted("create", "balancing-rules")
      .subscribe((granted) => (this.settingsRules.actions.add = granted));
    this.accessChecker
      .isGranted("create", "balancing-rules")
      .subscribe((granted) => (this.settingsRules.actions.edit = granted));
    this.accessChecker
      .isGranted("remove", "balancing-rules")
      .subscribe((granted) => (this.settingsRules.actions.delete = granted)); */

    this.optionsPager = [
      { value: 5 },
      { value: 10 },
      { value: 20 },
      { value: 50 },
      { value: 100 },
    ];
    this.selectedRule = this.optionsPager[0];
    this.selectedParameter = this.optionsPager[0];
    this.numeral.locale("es");
    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.sourceParameters.setFilter([
        {
          field: "country_code",
          search: object["country_code"],
          filter: (value: string, searchValue: string) => {
            return value == searchValue;
          },
        },
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
  settingsRules = {
    mode: "external",
    actions: {
      add: false,
      edit: false,
      delete: false,
    },
    edit: {
      editButtonContent: '<i class="fas fa-pen fa-xs" title="Edit"></i>',
    },

    columns: {
      logistic_element_type: {
        title: "Logistic Element Type",
        type: "string",
      },
      label: {
        title: "Label",
        type: "string",
      },
      description: {
        title: "Description",
        type: "string",
      },

      /*    start_date: {
        title: 'Start Date',
        type: 'string',
        valuePrepareFunction: (value: Date) => {
          return new Date(value).toUTCString();
        }
      },
      param_id: {
        title: 'Parameter Id',
        type: 'number',
        hide: true
      },
      param_label: {
        title: 'Parameter',
        type: 'string',

      },
      type: {
        title: 'Type',
        type: 'string'
      }, */
    },
    pager: {
      display: true,
      perPage: this.defaultRowPerPageRule,
    },
  };
  settingsParameters = {
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
      label: {
        title: "Label",
        type: "string",
      },
      balance_rule_label: {
        title: "Balancing Rule",
        type: "string",
      },
      balance_zone_id: {
        title: "Balance Zone Id",
        type: "number",
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
    },
    pager: {
      display: true,
      perPage: this.defaultRowPerPageParameter,
    },
    attr: {
      class: "table",
    },
  };

  sourceParameters: LocalDataSource = new LocalDataSource();

  sourceRules: LocalDataSource = new LocalDataSource();

  constructor(
    private messageService: messageService,
    private dialogService: NbDialogService,
    private excelService: ExcelService,
    private apiBalanceRule: BalanceRuleService,
    private apiBalanceRuleParameter: BalanceRuleParameterService,
    public accessChecker: NbAccessChecker
  ) {
    this.getBalanceRules();
    this.getBalanceRuleParameters();
  }
  getBalanceRuleParameters() {
    this.loading = true;
    this.apiBalanceRuleParameter
      .getBalanceRuleParameters()
      .subscribe({
        next: (res) => {
          const data = res;

          this.sourceParameters.load(data);
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting balance rule parameters"
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

  getBalanceRules() {
    this.loading = true;
    this.apiBalanceRule
      .getBalanceRules()
      .pipe(
        map((data) =>
          data.map(({ label, description, logistic_element_type }) => ({
            label,
            description,
            logistic_element_type,
          }))
        )
      )
      .subscribe({
        next: (res) => {
          const data = res;

          this.sourceRules.load(data);
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting balance rules"
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
    this.sourceRules.setPaging(1, this.defaultRowPerPageRule, true);
    this.settingsRules = Object.assign({}, this.settingsRules);
    this.sourceParameters.setPaging(1, this.defaultRowPerPageParameter, true);
    this.settingsParameters = Object.assign({}, this.settingsParameters);
  }

  onEditRule($event) {
    this.dialogService
      .open(DialogRuleComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Parameter",
          label: $event.data.label,
          startDate: $event.data.start_date,
          min: $event.data.min_value_id,
          max: $event.data.max_value_id,
          action: "Update",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getBalanceRules();
        }
      });
  }
  onAddRule($event) {
    this.dialogService
      .open(DialogRuleComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Parameter",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getBalanceRules();
        }
      });
  }
  exportAsXLSXRules() {
    this.sourceRules
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "balance_rules");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSVRules() {
    this.sourceRules
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "balance_rules");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }

  onEditParameter($event) {
    this.dialogService
      .open(DialogParameterComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Parameter",
          id: $event.data.id,
          label: $event.data.label,
          balance_zone_id: $event.data.balance_zone_id,
          country_code: $event.data.country_code,
          balance_rule_label: $event.data.balance_rule_label,
          action: "Update",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getBalanceRuleParameters();
        }
      });
  }

  onAddParameter($event) {
    this.dialogService
      .open(DialogParameterComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Parameter",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getBalanceRuleParameters();
        }
      });
  }
  exportAsXLSXParameters() {
    this.sourceParameters
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "rule_parameters");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSVParameters() {
    this.sourceParameters
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "rule_parameters");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  refreshParameters() {
    this.loading = true;
    this.getBalanceRuleParameters();
  }
  refreshRules() {
    this.loading = true;
    this.getBalanceRules();
  }
}
