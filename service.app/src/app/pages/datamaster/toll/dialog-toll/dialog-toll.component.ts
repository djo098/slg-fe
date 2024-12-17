import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from "@nebular/theme";
import NumberColumnType from '@revolist/revogrid-column-numeral';
import { BalanceZoneService } from '../../../../@core/services/balanceZone.service';
import { CountryService } from '../../../../@core/services/country.service';
import { TollService } from '../../../../@core/services/toll.service';
import { messageService } from "../../../../@core/utils/messages";
@Component({
  selector: 'ngx-dialog-toll',
  templateUrl: './dialog-toll.component.html',
  styleUrls: ['./dialog-toll.component.scss']
})
export class DialogTollComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() label: string;
  @Input() id: number;
  @Input() min_pressure: number;
  @Input() max_pressure: number;
  @Input() min_capacity: number;
  @Input() max_capacity: number;
  @Input() fixed_total: number;
  @Input() variable_total: number;
  @Input() balance_zone_id: number;
  @Input() country_code: number;
  numeral = NumberColumnType.getNumeralInstance();
  tollForm!: FormGroup;
  columns: any;
  rows: any;
  errorBalanceZone=false
  zoneOptions : any
  countriesOptions : any
  ngOnInit(): void {
    this.tollForm = this.formBuilder.group({
      id: new FormControl("", [Validators.required]),
      label: new FormControl("", [Validators.required]),
      min_pressure: new FormControl("", [
        Validators.required,
        Validators.pattern(/^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/),
        Validators.min(0),
      ]),
      max_pressure: new FormControl("", [
        Validators.required,
        Validators.pattern(/^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/),
        Validators.min(0),
      ]),
      min_capacity: new FormControl("", [
        Validators.required,
        Validators.pattern(/^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/),
        Validators.min(0),
      ]),
      max_capacity: new FormControl("", [
        Validators.required,
        Validators.pattern(/^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/),
        Validators.min(0),
      ]),
      fixed_total: new FormControl("", [
        Validators.required,
        Validators.pattern(/^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/),
        Validators.min(0),
      ]),
      variable_total: new FormControl("", [
        Validators.required,
        Validators.pattern(/^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/),
        Validators.min(0),
      ]),
      country_code: new FormControl("", [Validators.required]),
      balance_zone_id: new FormControl("", [Validators.required]),
    });


    if (this.action == "Update") {
      this.getbalanceZones(this.country_code)
      this.tollForm.controls["id"].setValue(this.id);
      this.tollForm.controls["label"].setValue(this.label);
      this.tollForm.controls["min_pressure"].setValue(this.numeral(this.min_pressure).format('0,0.[0000000000]'));
      this.tollForm.controls["max_pressure"].setValue(this.numeral(this.max_pressure).format('0,0.[0000000000]'));
      this.tollForm.controls["min_capacity"].setValue(this.numeral(this.min_capacity).format('0,0.[0000000000]'));
      this.tollForm.controls["max_capacity"].setValue(this.numeral(this.max_capacity).format('0,0.[0000000000]'));
      this.tollForm.controls["fixed_total"].setValue(this.numeral(this.fixed_total).format('0,0.[0000000000]'));
      this.tollForm.controls["variable_total"].setValue(this.numeral(this.variable_total).format('0,0.[0000000000]'));
      this.tollForm.controls["country_code"].setValue(this.country_code);
      this.tollForm.controls["balance_zone_id"].setValue(this.balance_zone_id);
    } else if(this.action == 'Add'){
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object= JSON.parse(localStorage.getItem('settings_parameters'));
        this.tollForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.getbalanceZones(object["country_code"]);
        this.tollForm
          .get("balance_zone_id")
          .setValue(object["balancing_zone"]);
     
      }
    }
    this.tollForm.controls["id"].disable();
  

  }

  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogTollComponent>,
    private apiBalanceZone: BalanceZoneService,
    private apiCountry: CountryService,
    private apiToll: TollService,
  ) {
    this.getCountries()
  }

  cancel() {
    this.ref.close();
  }
  add() {
    if (this.tollForm.valid) {
      this.tollForm.controls["min_pressure"].clearValidators();
      this.tollForm.controls["max_pressure"].clearValidators();
      this.tollForm.controls["min_capacity"].clearValidators();
      this.tollForm.controls["max_capacity"].clearValidators();
      this.tollForm.controls["fixed_total"].clearValidators();
      this.tollForm.controls["variable_total"].clearValidators();
    
      this.tollForm.controls["min_pressure"].setValue(Number(this.tollForm.get("min_pressure").value.toString().replace(/\./g, "").replace(",", ".")));
      this.tollForm.controls["max_pressure"].setValue(Number(this.tollForm.get("max_pressure").value.toString().replace(/\./g, "").replace(",", ".")));
      this.tollForm.controls["min_capacity"].setValue(Number(this.tollForm.get("min_capacity").value.toString().replace(/\./g, "").replace(",", ".")));
      this.tollForm.controls["max_capacity"].setValue(Number(this.tollForm.get("max_capacity").value.toString().replace(/\./g, "").replace(",", ".")));
      this.tollForm.controls["fixed_total"].setValue(Number(this.tollForm.get("fixed_total").value.toString().replace(/\./g, "").replace(",", ".")));
      this.tollForm.controls["variable_total"].setValue(Number(this.tollForm.get("variable_total").value.toString().replace(/\./g, "").replace(",", ".")));
      if (this.action == "Add") {
      
        this.apiToll.addTollTypes(this.tollForm.value).subscribe({
          next: (res) => {
            this.messageService.showToast(
              "success",
              "Success",
              "Logistic contract added successfully!"
            );
            this.tollForm.reset();
            this.ref.close("save");
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while adding toll type"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        });
      } else if (this.action == "Update") {
        this.update();
      }
    }
  }

  update() {
    if (this.tollForm.valid) {
    
      this.apiToll.updateTollTypes(this.tollForm.getRawValue()).subscribe({
        next: (res) => {
          this.messageService.showToast(
            "success",
            "Success",
            "Logistic contract updated successfully!"
          );
          this.tollForm.reset();
          this.ref.close("update");
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while updating toll type"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
    }
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
            "Internal server error while getting balance"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  getCountries() {
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
    this.tollForm.controls["balance_zone_id"].setValue("");
    this.getbalanceZones(this.tollForm.get("country_code").value);

  }
}
