import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import * as moment from "moment";
import {
  FormGroup,
  FormBuilder,
  Validators,
  Form,
  FormControl,
} from "@angular/forms";
import { LogisticElementService } from "../../../../../@core/services/logisticElement.service";
import * as alertifyjs from "alertifyjs";
import { BalanceRuleService } from "../../../../../@core/services/balanceRule.service";
import { BalanceZoneService } from "../../../../../@core/services/balanceZone.service";
import { CountryService } from "../../../../../@core/services/country.service";
import { messageService } from "../../../../../@core/utils/messages";
import { formatDate } from "@angular/common";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { map } from "rxjs/operators";
import { LegalEntityService } from "../../../../../@core/services/legalEntity.service";
import { Observable, of } from "rxjs";
import { ContractsService } from "../../../../../@core/services/contracts.service";
@Component({
  selector: "ngx-dialog-satellite-plant",
  templateUrl: "./dialog-satellite-plant.component.html",
  styleUrls: ["./dialog-satellite-plant.component.scss"],
})
export class DialogSatellitePlantComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() id: number;
  @Input() name: string;
  // @Input() lose: number;
  @Input() country_code: string;
  @Input() balance_zone_id: number;
  @Input() owner: number;
  @Input() address: string;
  @Input() retail: boolean;
  @Input() tso_code: string;
  numeral = NumberColumnType.getNumeralInstance();
  maxId: number;
  satellitePlantForm!: FormGroup;
  uncommittedForm!: FormGroup;
  linePackForm!: FormGroup;
  ruleOptions: any;
  countriesOptions: any;
  zoneOptions: any;
  errorBalanceZone: any;
  rowsUncommitted = [];
  columnsUncommitted: any[];
  rowsLinepack: any;
  columnsLinepack: any[];
  validateRevoGridLinepack: boolean = true;
  validateValueLinepack: boolean = true;
  validateDateLinepack: boolean = true;
  valuesParameters: any;
  valuesUncommitted: any;
  isDuplicateLinepack: boolean;
  validateRevoGridUncommitted: boolean = true;
  isDuplicateUncommitted: boolean;
  entitiesOptions: any;
  errorLegalEntity = false;
  filteredOptions$: Observable<string[]>;
  options: string[];
  labelEntity: any;
  contractOptions: any = [];
  errorContract = false;
  typeOptions: any;
  settings = {
    singleSelection: true,
    text: "",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    enableSearchFilter: true,
    badgeShowLimit: 2,
    maxHeight: 150,
    position: "bottom",
    autoPosition: false,
  };

  ngOnInit(): void {
    this.typeOptions = [
      { id: true, label: "Retail" },
      { id: false, label: "Single-Client" },
    ];
    this.satellitePlantForm = this.formBuilder.group({
      id: new FormControl(),
      name: new FormControl("", Validators.required),
      /*    losses_vp: new FormControl("", [
        Validators.required,
        Validators.pattern(/^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/),
        Validators.min(0),
        Validators.max(100),
      ]), */
      balance_zone_id: new FormControl("", Validators.required),
      country_code: new FormControl("", Validators.required),
      tso_code: new FormControl("", Validators.required),
      owner_id: new FormControl("", Validators.required),
      retail: new FormControl("", Validators.required),
      address: new FormControl("", Validators.required),
      type: new FormControl(""),

     
      /*    rule_id: new FormControl([],
      Validators.required

    ) */
    });

    if (this.action == "Update") {
;
      this.satellitePlantForm.controls["id"].setValue(this.id);
      this.satellitePlantForm.controls["id"].disable();
      this.satellitePlantForm.controls["name"].setValue(this.name);
      // this.satellitePlantForm.controls["losses_vp"].setValue(this.numeral(this.lose).format('0,0.[0000000000]'));
      this.satellitePlantForm.controls["type"].setValue("satellite_plant");
      this.satellitePlantForm.controls["country_code"].setValue(
        this.country_code
      );

      this.satellitePlantForm.controls["tso_code"].setValue(this.tso_code);
      this.satellitePlantForm.controls["address"].setValue(this.address);
      this.satellitePlantForm.controls["owner_id"].setValue(this.owner);
      this.satellitePlantForm.controls["retail"].setValue(this.retail);
      this.getbalanceZones(this.country_code);


      this.satellitePlantForm.controls["balance_zone_id"].setValue(
        this.balance_zone_id
      );

    } else if (this.action == "Add") {
      // this.getId();
      this.satellitePlantForm.controls["id"].disable();
      this.satellitePlantForm.controls["type"].setValue("satellite_plant");
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object = JSON.parse(localStorage.getItem("settings_parameters"));
        this.satellitePlantForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.getbalanceZones(object["country_code"]);
        this.satellitePlantForm
          .get("balance_zone_id")
          .setValue(object["balancing_zone"]);
     ;
      }
    }
    this.satellitePlantForm.controls["id"].disable();
  }

  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogSatellitePlantComponent>,
    private apiLogisticElement: LogisticElementService,
    private apiBalanceRule: BalanceRuleService,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
    private apiLegalEntity: LegalEntityService,
    private apiContract: ContractsService
  ) {
    this.getcountries();
    this.getLegalEntities();
  }

  cancel() {
    this.ref.close();
  }
  add() {
    if (this.satellitePlantForm.valid) {
      if (this.action == "Add") {
;
        this.apiLogisticElement
          .addLogisticElement(this.satellitePlantForm.value)
          .subscribe({
            next: (res) => {
              this.messageService.showToast(
                "success",
                "Success",
                "Satellite plant added successfully!"
              );
              this.ref.close("save");
            },
            error: (e) => {
              if (e.error.title == "Internal Server Error") {
                this.messageService.showToast(
                  "danger",
                  "Error",
                  "Internal server error while adding satellite plants"
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

    this.apiLogisticElement
      .updateLogisticElement(this.satellitePlantForm.getRawValue())
      .subscribe({
        next: (res) => {
          this.messageService.showToast(
            "success",
            "Success",
            "Satellite plant updated successfully!"
          );
          this.ref.close("update");
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while updating satellite plants"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
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
            "Internal server error while getting balancing zones"
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
  onChange($event) {
    this.zoneOptions = [];
    this.satellitePlantForm.controls["balance_zone_id"].setValue("");

    // this.linePackForm.get('owner_id').setValue("");
    this.getbalanceZones(this.satellitePlantForm.get("country_code").value);

  }

  getLegalEntities() {
    this.apiLegalEntity
      .getAllLegalEntitiesByCountry(null, "External")
      .subscribe({
        next: (res) => {
          this.entitiesOptions = res.sort((a, b) => (a.name > b.name) ? 1 : -1);
          if (this.entitiesOptions.length == 0) {
            this.errorLegalEntity = true;
          } else {
            this.errorLegalEntity = false;
          }
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting legal entities"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }

  /*  onChangeOwner2($event) {
    this.getValuesLinePack(this.id,$event);
  } */
}
