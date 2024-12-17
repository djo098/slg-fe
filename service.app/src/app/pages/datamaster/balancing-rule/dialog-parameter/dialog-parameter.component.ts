import { DatePipe, formatDate } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import { NbDialogRef } from "@nebular/theme";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import * as moment from "moment";
import { map } from "rxjs/operators";
import { BalanceRuleService } from "../../../../@core/services/balanceRule.service";
import { BalanceRuleParameterService } from "../../../../@core/services/balanceRuleParameter.service";
import { BalanceZoneService } from "../../../../@core/services/balanceZone.service";
import { CountryService } from "../../../../@core/services/country.service";
import { messageService } from "../../../../@core/utils/messages";

import { DarkModeService } from "../../../../@core/services/sharedServices/darkMode.service";
@Component({
  selector: "ngx-dialog-parameter",
  templateUrl: "./dialog-parameter.component.html",
  styleUrls: ["./dialog-parameter.component.scss"],
})
export class DialogParameterComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() id: number;
  @Input() label: string;
  @Input() balance_zone_id: number;
  @Input() country_code: string;
  @Input() balance_rule_label: string;
  balanceRuleParameterForm!: FormGroup;
  numeral = NumberColumnType.getNumeralInstance();
  maxId: number;
  zoneOptions: any;
  errorBalanceZone: any;
  errorRule: any;
  validateRevoGrid: boolean = true;
  validateValue: boolean = true;
  validateDate: boolean = true;
  rows = [];
  columns: any[];
  countriesOptions: any;
  ruleOptions: any;
  selectedItems: any;
  valuesParameters: any;
  unit = "";
  isDuplicate: boolean;
  revogridTheme: string;
  eventTimes1 = [];
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
    this.balanceRuleParameterForm = this.formBuilder.group({
      id: new FormControl("", Validators.required),
      label: new FormControl("", Validators.required),
      country_code: new FormControl("", Validators.required),
      balance_zone_id: new FormControl("", Validators.required),
      balance_rule_label: new FormControl("", Validators.required),
    });
    this.columns = [
      {
        name: "Start Date (YYYY-MM-DD)",
        prop: "start_date",
        sortable: true,
        order: "asc",
        size: 140,
      },
      {
        name: "Value",
        prop: "value",
        size: 140,
        cellProperties: ({ prop, model, data, column }) => {
          return {
            class: {
              numeric: true,
            },
          };
        },
      },
      {
        size: 80,
        readonly: true,
        cellTemplate: (createElement, props) => {
          return createElement(
            "button",
            {
              onClick: () => this.doDelete(props.rowIndex),
              class: {
                "btn-delete": true,
              },
            },
            "DELETE"
          ); /* h(
            "button",
            {
              onClick: () => this.doDelete(props.rowIndex),
             
            },
            "delete"
          ); */
        },
      },
    ];

    if (this.action == "Update") {
      this.ruleOptions = [];
      this.getcountries();
      this.getbalanceZones(this.country_code);
      this.getRuleByBalanceZone(this.balance_zone_id);
      this.balanceRuleParameterForm.controls["balance_rule_label"].setValue(
        this.balance_rule_label
      );
      this.balanceRuleParameterForm.controls["id"].setValue(this.id);
      this.balanceRuleParameterForm.controls["id"].disable();
      this.balanceRuleParameterForm.controls["label"].setValue(this.label);
      this.balanceRuleParameterForm.controls["label"].disable();
      this.balanceRuleParameterForm.controls["country_code"].setValue(
        this.country_code
      );
      this.balanceRuleParameterForm.controls["balance_zone_id"].setValue(
        this.balance_zone_id
      );

      this.getAditionalParameters(this.id);
    } else if (this.action == "Add") {
      this.getcountries();
      this.balanceRuleParameterForm.controls["id"].disable();
      document.querySelector("revo-grid").source = this.rows;
      document.querySelector("revo-grid").useClipboard = false;
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object = JSON.parse(localStorage.getItem("settings_parameters"));
        this.balanceRuleParameterForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.getbalanceZones(object["country_code"]);
        this.balanceRuleParameterForm
          .get("balance_zone_id")
          .setValue(object["balancing_zone"]);
        this.getRuleByBalanceZone(object["balancing_zone"]);
      }
    }

    this.balanceRuleParameterForm.controls["id"].disable();
  }

  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogParameterComponent>,
    private apiBalanceRuleParameter: BalanceRuleParameterService,
    private apiBalanceZone: BalanceZoneService,
    private apiBalanceRule: BalanceRuleService,
    private apiCountry: CountryService,
    public datepipe: DatePipe,
    private darkModeService: DarkModeService
  ) {}

  cancel() {
    this.ref.close();
  }
  add() {
    if (this.balanceRuleParameterForm.valid) {
      if (this.action == "Add") {

        this.apiBalanceRuleParameter
          .addBalanceRuleParameter(this.balanceRuleParameterForm.value)
          .subscribe({
            next: (res) => {
              document
                .querySelector("revo-grid")
                .getSource()
                .then((value) => {
                  this.valuesParameters = value;

                  this.valuesParameters.map((data) => {
                    data["value"] = Number(
                      data["value"]
                        .toString()
                        .replace(/\./g, "")
                        .replace(",", ".")
                    );
                    data["param_id"] = res.id;
                    return data;
                  });
                })
                .then((v) => {
                  this.apiBalanceRule
                    .setBalanceParameterValues(res.id, this.valuesParameters)
                    .subscribe({
                      next: (res) => {
                        this.ref.close("save");
                        this.messageService.showToast(
                          "success",
                          "Success",
                          "Balance rule parameter added successfully!"
                        );
                      },
                      error: (e) => {
                        if (e.error.title == "Internal Server Error") {
                          this.messageService.showToast(
                            "danger",
                            "Error",
                            "Internal server error while adding balance rule parameter"
                          );
                        } else {
                          this.messageService.showToast(
                            "danger",
                            "Error",
                            e.error
                          );
                        }
                      },
                    });
                });
            },
            error: (e) => {
              if (e.error.title == "Internal Server Error") {
                this.messageService.showToast(
                  "danger",
                  "Error",
                  "Internal server error while adding balance rule parameter"
                );
              } else {
                this.messageService.showToast("danger", "Error", e.error);
              }
            },
          });
      } else {
        this.update();
      }
    }
  }

  update() {
    document
      .querySelector("revo-grid")
      .getSource()
      .then((value) => {
        this.valuesParameters = value;

        this.valuesParameters.map((data) => {
          data["value"] = Number(
            data["value"].toString().replace(/\./g, "").replace(",", ".")
          );
          data["param_id"] = this.id;
          return data;
        });
      });

    this.apiBalanceRuleParameter
      .updateBalanceRuleParameter(this.balanceRuleParameterForm.getRawValue())
      .subscribe({
        next: (res) => {
          this.apiBalanceRule
            .setBalanceParameterValues(
              this.balanceRuleParameterForm.get("id").value,
              this.valuesParameters
            )
            .subscribe({
              next: (res) => {
                this.ref.close("update");
                this.messageService.showToast(
                  "success",
                  "Success",
                  "Balance rule parameter updated successfully!"
                );
              },
              error: (e) => {
                if (e.error.title == "Internal Server Error") {
                  this.messageService.showToast(
                    "danger",
                    "Error",
                    "Internal server error while updating balance rule parameter"
                  );
                } else {
                  this.messageService.showToast("danger", "Error", e.error);
                }
              },
            });
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while updating balance rule parameter"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }
  validateTable() {
    document
      .querySelector("revo-grid")
      .getSource()
      .then((value) => {});
  }
  onAfterEdit({ detail }) {
    document
      .querySelector("revo-grid")
      .getSource()
      .then((value) => {
        var valueArr = value.map(function (item) {
          return item.start_date;
        });
        this.isDuplicate = valueArr.some(function (item, idx) {
          return valueArr.indexOf(item) != idx;
        });
      });
  }
  onBeforeEditStart(e, { detail }) {
    this.eventTimes1.push("Called");
    if (this.eventTimes1.length == 1) {


     if(detail.val == ''){
      detail.val = detail.model[detail.prop].toString().replace(/\./g, "");
     } else {
      detail.val=detail.val
     }

    }
  }
  onBeforeEdit({ detail }, e) {
    if (detail.prop == "value") {
      if (
        isNaN(
          Number(detail.val.toString().replace(/\./g, "").replace(",", "."))
        ) &&
        /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/.test(
          detail.val
        ) == false
      ) {
        this.validateValue = false;
        e.preventDefault();
      } else {
        detail.val = this.numeral(
          Number(detail.val.toString().replace(/\./g, "").replace(",", "."))
        ).format("0,0.[0000000000]");
        this.validateValue = true;
      }
    }

    if (detail.prop == "start_date") {
      if (moment(detail.val, "yyyy-MM-dd").isValid() == true) {
        this.validateDate = true;
      } else {
        e.preventDefault();
        this.validateDate = false;
      }
    }

    if (this.validateDate == true && this.validateValue == true) {
      this.validateRevoGrid = true;
    } else {
      this.validateRevoGrid = false;
    }
  }

  getAditionalParameters(id) {
    this.apiBalanceRule
      .getBalanceParameterValues(id)
      .pipe(
        map((data) => {
          return data.map((x, index) => {
            x["value"] = this.numeral(x["value"]).format("0,0.[0000000000]");
            return x;
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.rows = res;
          document.querySelector("revo-grid").source = this.rows;
          document.querySelector("revo-grid").useClipboard = false;
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
        this.getUnit(this.balance_rule_label);
      });
  }
  addRow() {
    this.rows.push({
      start_date: formatDate(new Date(), "yyyy-MM-dd", "en-US"),
      value: 0,
    });
    document.querySelector("revo-grid").source = [];
    document.querySelector("revo-grid").source = this.rows;
    document
      .querySelector("revo-grid")
      .getSource()
      .then((value) => {
        var valueArr = value.map(function (item) {
          return item.start_date;
        });
        this.isDuplicate = valueArr.some(function (item, idx) {
          return valueArr.indexOf(item) != idx;
        });
      });
  }
  getcountries() {
    this.apiCountry.getcountries().subscribe({
      next: (res) => {
        this.countriesOptions = res;
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
    });
  }
  onChangeCountry($event) {
    this.zoneOptions = [];
    this.balanceRuleParameterForm.controls["balance_zone_id"].setValue("");
    this.getbalanceZones(
      this.balanceRuleParameterForm.get("country_code").value
    );
  }
  onChangeRule($event) {
    this.getUnit(this.balanceRuleParameterForm.get("balance_rule_label").value);
  }
  getbalanceZones(country) {
    this.apiBalanceZone.getAllBalanceZonesByCountry(country).subscribe({
      next: (res) => {
        this.zoneOptions = res;
        if (this.zoneOptions.length == 0) {
          this.errorBalanceZone = true;
        } else {
          this.errorBalanceZone = false;
        }
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting balance zones"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  getRuleByBalanceZone(zone) {
    this.apiBalanceRule.getBalanceRuleByTypeAndZone(zone).subscribe({
      next: (res) => {
        this.ruleOptions = res;
        if (this.ruleOptions.length == 0) {
          this.errorRule = true;
        } else {
          this.errorRule = false;
        }
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
    });
  }
  onChangeZone($event) {
    this.ruleOptions = [];
    this.balanceRuleParameterForm.controls["balance_rule_label"].setValue("");
    this.getRuleByBalanceZone(
      this.balanceRuleParameterForm.get("balance_zone_id").value
    );
  }
  doDelete(rowIndex) {
    this.rows.splice(rowIndex, 1);
    document.querySelector("revo-grid").source = [];
    document.querySelector("revo-grid").source = this.rows;
    document
      .querySelector("revo-grid")
      .getSource()
      .then((value) => {
        var valueArr = value.map(function (item) {
          return item.start_date;
        });
        this.isDuplicate = valueArr.some(function (item, idx) {
          return valueArr.indexOf(item) != idx;
        });
      });
  }
  getUnit(rule) {
    this.apiBalanceRule
      .getRuleMeasurementUnit(rule)
      .subscribe({
        next: (res) => {
          this.unit = res;
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting measurement unit"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.columns = [];
        this.columns = [
          {
            name: "Start Date (YYYY-MM-DD)",
            prop: "start_date",
            sortable: true,
            order: "asc",
            size: 140,
          },
          {
            name: "Value",
            prop: "value",
            size: 140,
            cellProperties: ({ prop, model, data, column }) => {
              return {
                class: {
                  numeric: true,
                },
              };
            },
          },
          {
            size: 80,
            readonly: true,
            cellTemplate: (createElement, props) => {
              return createElement(
                "button",
                {
                  onClick: () => this.doDelete(props.rowIndex),
                  class: {
                    "btn-delete": true,
                  },
                },
                "DELETE"
              ); /* h(
                "button",
                {
                  onClick: () => this.doDelete(props.rowIndex),
                 
                },
                "delete"
              ); */
            },
          },
        ];
      });
  }
}
