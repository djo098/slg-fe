import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { NbDialogRef } from "@nebular/theme";
import { BalanceZoneService } from "../../../../@core/services/balanceZone.service";
import { CountryService } from "../../../../@core/services/country.service";
import { messageService } from "../../../../@core/utils/messages"
@Component({
  selector: "ngx-dialog-header-settings",
  templateUrl: "./dialog-header-settings.component.html",
  styleUrls: ["./dialog-header-settings.component.scss"],
})
export class DialogHeaderSettingsComponent implements OnInit {

  settingsForm!: FormGroup;
  countriesOptions: any;
  zoneOptions: any;
  errorBalanceZone=false;
  labelZone : any;

  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogHeaderSettingsComponent>,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService
  ) {
    this.getCountries();
  }

  ngOnInit(): void {
    this.settingsForm = this.formBuilder.group({
      country_code: new FormControl("", [Validators.required]),
      balancing_zone: new FormControl("", [Validators.required]),
    });
    var object = localStorage.getItem('settings_parameters');
    if(object){
      object= JSON.parse(localStorage.getItem('settings_parameters'));
      this.settingsForm.get('country_code').setValue(object['country_code']);
      this.getbalanceZones(object['country_code']);
      this.settingsForm.get('balancing_zone').setValue(object['balancing_zone']);
      this.labelZone=object['balancing_zone_label'];
    }
  }
  onChangeCountry($event) {
    this.settingsForm.controls["balancing_zone"].setValue("");
    this.getbalanceZones(this.settingsForm.get("country_code").value);
  }
  onChangeZone($event) {
    let selectedValue = this.zoneOptions.find(
      (item) => item.id === $event
    );

    this.labelZone = selectedValue.label;

  
  }
  getCountries() {
    this.apiCountry.getcountries().subscribe({
      next: (res) => {
        this.countriesOptions = res;
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
    });
  }
  add(){
  localStorage.setItem('settings_parameters',JSON.stringify({country_code : this.settingsForm.get('country_code').value, balancing_zone: this.settingsForm.get('balancing_zone').value, balancing_zone_label: this.labelZone }))
  this.ref.close();
  if (typeof window !== 'undefined') {
    window.location.reload();
  }

  }
  cancel(){
    this.ref.close();

  }
  clear(){
    localStorage.setItem('settings_parameters','');
    this.settingsForm.get('country_code').setValue('');
    this.settingsForm.get('balancing_zone').setValue('');
    this.labelZone=null;
    this.ref.close();
    if (typeof window !== 'undefined') {
      window.location.reload();
    }

  }
}
