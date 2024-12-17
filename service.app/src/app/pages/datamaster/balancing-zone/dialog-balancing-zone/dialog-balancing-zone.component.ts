import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import {
  FormGroup,
  FormBuilder,
  Validators,
  Form,
  FormControl,
} from "@angular/forms";
import { CountryService } from "../../../../@core/services/country.service";
import { BalanceZoneService } from "../../../../@core/services/balanceZone.service";
import { LogisticElementService } from "../../../../@core/services/logisticElement.service";
import { map } from "leaflet";
import * as alertifyjs from "alertifyjs";
import { BalanceRuleService } from "../../../../@core/services/balanceRule.service";
import { messageService } from "../../../../@core/utils/messages";
import { LegalEntityService } from "../../../../@core/services/legalEntity.service";
import NumberColumnType from "@revolist/revogrid-column-numeral";
@Component({
  selector: "ngx-dialog-balancing-zone",
  templateUrl: "./dialog-balancing-zone.component.html",
  styleUrls: ["./dialog-balancing-zone.component.scss"],
})
export class DialogBalancingZoneComponent implements OnInit {
  @Input() action: string;
  @Input() id: number;
  @Input() loss_type: string;
  @Input() title: string;
  @Input() label: string;
  @Input() country: string;
  @Input() tso: string;
  @Input() day_start_time: string;
  @Input() timezone: string;
  @Input() renomination_delta: string;
  BalancingZoneForm!: FormGroup;
  ruleForm!: FormGroup;
  countriesOptions: any;
  ruleVBTOptions: any;
  ruleVBSOptions: any;
  ruleVBPOptions: any;
  rulePlantsOptions: any;
  tsoOptions: any;
  selectedVBPItems: any;
  selectedVBTItems: any;
  selectedVBSItems: any;
  selectedPlantsItems: any;
  selectedItems: any;
  arrayRules = [];
  numeral = NumberColumnType.getNumeralInstance();
  errorTSO = false;
  offsets_utc: any;
  settings = {
    singleSelection: true,
    text: "",
    enableSearchFilter: true,
    position: "bottom",
    autoPosition: false,
  };
  ngOnInit(): void {
    this.numeral.locale("es");
    this.BalancingZoneForm = this.formBuilder.group({
      id: new FormControl(""),
      label: new FormControl("", [
        Validators.required,
        Validators.maxLength(30),
      ]),
      country_code: new FormControl("", Validators.required),
      //  loss_type: new FormControl('', Validators.required),
      tso_id: new FormControl("", Validators.required),
      start_time: new FormControl("", Validators.required),
      timezone: new FormControl("", Validators.required),
      renomination_delta: new FormControl("", [
        Validators.required,
        Validators.pattern(
          /^[+-]?([1-9]{1}[0-9]{0,0}(\.\d{3})*(\,\d{0,0})?|[1-9]{1}\d{0,}(\,\d{0,0})?|0(\,\d{0,0})?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d{0,0}(\.\d{3})*(\,\d{0,0})?|[1-9]{1}\d{0,}(\,\d{0,0})?|0(\,\d{0,0})?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d{0,0}(\.\d{3})*(\,\d{0,0})?|[1-9]{1}\d{0,}(\,\d{0,0})?|0(\,\d{0,0})?|(\,\d{1,2}))\)$/
        ),
      ]),
    });
    this.ruleForm = this.formBuilder.group({
      labelVBP: new FormControl([], Validators.required),
      labelVBT: new FormControl([], Validators.required),
      labelVBS: new FormControl([], Validators.required),
      labelPlants: new FormControl([], Validators.required),
    });
    if (this.action == "Update") {
      this.ruleVBTOptions = [];
      this.ruleVBPOptions = [];
      this.ruleVBSOptions = [];
      this.rulePlantsOptions = [];
      this.arrayRules = [];
      this.selectedPlantsItems = [];
      this.selectedVBPItems = [];
      this.selectedVBTItems = [];
      this.selectedVBSItems = [];
      this.BalancingZoneForm.controls["label"].setValue(this.label);
      this.BalancingZoneForm.controls["label"].disable();
      this.BalancingZoneForm.controls["country_code"].setValue(this.country);
      this.BalancingZoneForm.controls["id"].setValue(this.id);
      this.BalancingZoneForm.controls["id"].disable();
      this.BalancingZoneForm.controls["renomination_delta"].setValue(
        this.numeral(this.renomination_delta).format("0,0.[0000000000]")
      );

      //  this.BalancingZoneForm.controls['loss_type'].setValue(this.loss_type);
      this.getBalanceRulesByType();
      this.getBalanceRulesByElement(
        this.BalancingZoneForm.get("id").value,
        "virtual_balancing_point"
      );
      this.getBalanceRulesByElement(
        this.BalancingZoneForm.get("id").value,
        "tank"
      );
      this.getBalanceRulesByElement(
        this.BalancingZoneForm.get("id").value,
        "underground_storage"
      );
      this.getBalanceRulesByElement(
        this.BalancingZoneForm.get("id").value,
        "regasification_plant"
      );
      this.BalancingZoneForm.get("start_time").setValue(
        new Date(
          2022,
          1,
          1,
          Number(this.day_start_time.toString().split(":")[0]),
          Number(this.day_start_time.toString().split(":")[1]),
          0
        )
      );
      this.getTSO(this.country);
      this.BalancingZoneForm.controls["tso_id"].setValue(this.tso);
    } else if (this.action == "Add") {
      this.ruleVBTOptions = [];
      this.ruleVBPOptions = [];
      this.ruleVBSOptions = [];
      this.rulePlantsOptions = [];
      this.arrayRules = [];
      this.selectedPlantsItems = [];
      this.selectedVBPItems = [];
      this.selectedVBTItems = [];
      this.selectedVBSItems = [];
      this.getBalanceRulesByType();
      this.BalancingZoneForm.controls["id"].disable();
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object = JSON.parse(localStorage.getItem("settings_parameters"));
        this.BalancingZoneForm.get("country_code").setValue(
          object["country_code"]
        );
        this.getTSO(object["country_code"]);
      }
    }
  }

  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogBalancingZoneComponent>,
    private apiBalanceZone: BalanceZoneService,
    private apiCountry: CountryService,
    private apiLogisticElement: LogisticElementService,
    private apiBalanceRule: BalanceRuleService,
    private apiLegalEntity: LegalEntityService
  ) {
    this.getcountries();
    this.getTimesZones();
  }

  cancel() {
    this.ref.close();
  }
  add() {
    if (this.BalancingZoneForm.valid) {
      this.BalancingZoneForm.controls["renomination_delta"].clearValidators();

      this.BalancingZoneForm.controls["renomination_delta"].setValue(
        Number(
          this.BalancingZoneForm.get("renomination_delta")
            .value.toString()
            .replace(/\./g, "")
            .replace(",", ".")
        )
      );

      function pad(num) {
        num = num.toString();

        while (num.length === 1) num = "0" + num;
        return num;
      }

      if (this.action == "Add") {
        var object = {};
        var start_time =
          pad(this.BalancingZoneForm.get("start_time").value.getHours()) +
          ":" +
          pad(this.BalancingZoneForm.get("start_time").value.getMinutes());

        object["label"] = this.BalancingZoneForm.get("label").value;
        object["country_code"] =
          this.BalancingZoneForm.get("country_code").value;
        //  object['loss_type'] = this.BalancingZoneForm.get('loss_type').value;
        object["tso_id"] = this.BalancingZoneForm.get("tso_id").value;
        object["day_start_time"] = start_time;
        object["timezone"] = this.BalancingZoneForm.get("timezone").value[0].id;
        object["renomination_delta"] =
          this.BalancingZoneForm.get("renomination_delta").value;

        this.apiBalanceZone.addBalanceZone(object).subscribe({
          next: (res) => {
            this.assignBalanceRules(res.id);
            this.messageService.showToast(
              "success",
              "Success",
              "Balancing zone added successfully!"
            );

            this.BalancingZoneForm.reset();
            this.ref.close("save");
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while adding balancing zone"
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
    function pad(num) {
      num = num.toString();

      while (num.length === 1) num = "0" + num;
      return num;
    }
    var object = {};
    var start_time =
      pad(this.BalancingZoneForm.get("start_time").value.getHours()) +
      ":" +
      pad(this.BalancingZoneForm.get("start_time").value.getMinutes());
    object["id"] = this.BalancingZoneForm.get("id").value;
    object["label"] = this.BalancingZoneForm.get("label").value;
    object["country_code"] = this.BalancingZoneForm.get("country_code").value;
    //  object['loss_type'] = this.BalancingZoneForm.get('loss_type').value;
    object["tso_id"] = this.BalancingZoneForm.get("tso_id").value;
    object["day_start_time"] = start_time;
    object["renomination_delta"] =
      this.BalancingZoneForm.get("renomination_delta").value;
    this.BalancingZoneForm.get("timezone").value.map((x) => {
      object["timezone"] = x["id"];
    });
    this.apiBalanceZone.updateBalanceZone(object).subscribe({
      next: (res) => {
        this.assignBalanceRules(res.id);
        this.messageService.showToast(
          "success",
          "Success",
          "Balancing zone updated successfully!"
        );
        this.BalancingZoneForm.reset();
        this.ref.close("update");
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while updating balancing zone"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
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
  getBalanceRulesByType() {
    this.apiBalanceRule.getBalanceRuleByLogisticType("tank").subscribe({
      next: (res) => {
        this.ruleVBTOptions = res;
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          alertifyjs.error("Internal Server Error");
        } else {
          alertifyjs.error(e.error);
        }
      },
    });
    this.apiBalanceRule
      .getBalanceRuleByLogisticType("virtual_balancing_point")
      .subscribe({
        next: (res) => {
          this.ruleVBPOptions = res;
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
    this.apiBalanceRule
      .getBalanceRuleByLogisticType("underground_storage")
      .subscribe({
        next: (res) => {
          this.ruleVBSOptions = res;
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
    this.apiBalanceRule
      .getBalanceRuleByLogisticType("regasification_plant")
      .subscribe({
        next: (res) => {
          this.rulePlantsOptions = res;
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
  assignBalanceRules(zone) {
    for (const label of this.selectedVBPItems) {
      const object = {};
      object["label"] = label;
      object["logistic_element_type"] = "virtual_balancing_point";
      this.arrayRules.push(object);
    }

    for (const label of this.selectedVBTItems) {
      const object = {};
      object["label"] = label;
      object["logistic_element_type"] = "tank";
      this.arrayRules.push(object);
    }

    for (const label of this.selectedVBSItems) {
      const object = {};
      object["label"] = label;
      object["logistic_element_type"] = "underground_storage";
      this.arrayRules.push(object);
    }

    for (const label of this.selectedPlantsItems) {
      const object = {};
      object["label"] = label;
      object["logistic_element_type"] = "regasification_plant";
      this.arrayRules.push(object);
    }

    this.apiBalanceRule.assignBalanceRules(zone, this.arrayRules).subscribe({
      next: (res) => {},
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while assigning balance rules"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  getBalanceRulesByElement(zone, type) {
    this.apiBalanceRule.getBalanceRuleByTypeAndZone(zone, type).subscribe({
      next: (res) => {
        if (type == "virtual_balancing_point") {
          this.selectedVBPItems = res.map((x) => {
            return x.label;
          });
        } else if (type == "tank") {
          this.selectedVBTItems = res.map((x) => {
            return x.label;
          });
        } else if (type == "underground_storage") {
          this.selectedVBSItems = res.map((x) => {
            return x.label;
          });
        } else if (type == "regasification_plant") {
          this.selectedPlantsItems = res.map((x) => {
            return x.label;
          });
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
  getTSO(country) {
    this.apiLegalEntity
      .getAllLegalEntitiesByCountry(country, "External")
      .subscribe({
        next: (res) => {
          this.tsoOptions = res;
          if (this.tsoOptions.length == 0) {
            this.errorTSO = true;
          } else {
            this.errorTSO = false;
          }
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting TSO"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }
  onChangeCountry($event) {
    this.BalancingZoneForm.controls["tso_id"].setValue("");
    this.getTSO(this.BalancingZoneForm.get("country_code").value);
  }
  getTimesZones() {
    const offsets_utc = [];
    this.apiBalanceZone
      .getTimezones()
      .subscribe({
        next: (res) => {
          res.map((x) => {
            offsets_utc.push({ id: x, itemName: x });
          });

          this.offsets_utc = offsets_utc;
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting time zones"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.BalancingZoneForm.controls["timezone"].setValue([
          { id: this.timezone, itemName: this.timezone },
        ]);
      });
  }
}
