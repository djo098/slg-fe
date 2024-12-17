import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import {
  FormGroup,
  FormBuilder,
  Validators,
  Form,
  FormControl,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { LegalEntityService } from "../../../../@core/services/legalEntity.service";
import { LegalEntity } from "../legalEntity";
import * as alertifyjs from "alertifyjs";
import { CountryService } from "../../../../@core/services/country.service";
import { messageService } from "../../../../@core/utils/messages";
import { BalanceZoneService } from "../../../../@core/services/balanceZone.service";

@Component({
  selector: 'ngx-dialog-association',
  templateUrl: './dialog-association.component.html',
  styleUrls: ['./dialog-association.component.scss']
})
export class DialogAssociationComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() id: number;
  @Input() code: string;
  @Input() legal_entity_id: string;
  @Input() legal_entity_label: string;
  @Input() balance_zone_id: string;
  @Input() country_code: string;
  @Input() primary: boolean;
  countriesOptions: any;
  entityAssociationForm!: FormGroup;
  entitiesOptions : any;
  errorLegalEntity = false;
  zoneOptions : any;
  errorBalanceZone = false;
  settingsEntity = {
    singleSelection: true,
    text: "",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    enableSearchFilter: true,
    position: "bottom",
    autoPosition: false,
    labelKey: "name",
    primaryKey: "id",
  };
  ngOnInit(): void {

    this.entityAssociationForm = this.formBuilder.group({
      id: new FormControl(),
      tso_code: new FormControl("", [Validators.required]),
      legal_entity_id: new FormControl("", [Validators.required]),
      balance_zone_id: new FormControl("", [Validators.required]),
      country_code: new FormControl("", Validators.required),
      primary: new FormControl(false),
  
    });  if (this.action == "Update") {
    
      this.getbalanceZones(this.country_code);
      this.entityAssociationForm.controls["id"].setValue(this.id);
      this.entityAssociationForm.controls["id"].disable();
      this.entityAssociationForm.controls["tso_code"].setValue(this.code);
      this.entityAssociationForm.controls["balance_zone_id"].setValue(this.balance_zone_id);
      this.entityAssociationForm.controls["legal_entity_id"].setValue([{id: this.legal_entity_id, name: this.legal_entity_label}]);
      this.entityAssociationForm.controls["country_code"].setValue(this.country_code);
      this.entityAssociationForm.controls["primary"].setValue(this.primary);
    } else if (this.action == "Add") {
      this.entityAssociationForm.controls["id"].disable();
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object= JSON.parse(localStorage.getItem('settings_parameters'));
        this.entityAssociationForm
          .get("country_code")
          .setValue(object["country_code"]);
          this.entityAssociationForm
          .get("balance_zone_id")
          .setValue(object["balancing_zone"]);
          this.getbalanceZones(object["country_code"]);
          this.getLegalEntities();

      }
    }

    this.entityAssociationForm.controls["id"].disable();
  }
  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogAssociationComponent>,
    private apiLegalEntity: LegalEntityService,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
  ) {
    this.getCountries();
    this.getLegalEntities();
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
onChangeCountry($event){
  this.entityAssociationForm.controls['balance_zone_id'].setValue("");
  
  this.getbalanceZones(this.entityAssociationForm.get('country_code').value);

}
getLegalEntities(){
  this.apiLegalEntity.getAllLegalEntitiesByCountry().subscribe({
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
            this.messageService.showToast("danger", "Error", "Internal server error while getting legal entities");
        } else {
            this.messageService.showToast("danger", "Error", e.error);
        }
    }
});
}
getbalanceZones(country, ) {
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
              this.messageService.showToast("danger", "Error", "Internal server error while getting balance");
          } else {
              this.messageService.showToast("danger", "Error", e.error);
          }
      }
  });
}
cancel() {
  this.ref.close();
}

add() {
  if (this.entityAssociationForm.valid) {
  var  object = {
    id: this.entityAssociationForm.get('id').value ?  this.entityAssociationForm.get('id').value : null,
    legal_entity_id :this.entityAssociationForm.get('legal_entity_id').value[0].id,
    balance_zone_id: this.entityAssociationForm.get('balance_zone_id').value,
    tso_code: this.entityAssociationForm.get('tso_code').value,
    primary: this.entityAssociationForm.get('primary').value
  }
    if (this.action == "Add") {
      this.apiLegalEntity.addTSOCodeLegalEntity(this.clean(object)).subscribe({
        next: (res) => {
          this.messageService.showToast(
            "success",
            "Success",
            "TSO code of legal entity added successfully!"
          );
          this.entityAssociationForm.reset();
          this.ref.close("save");
        },
        error: (e) => {
          this.ref.close();
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while adding TSO code of legal entity "
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
    } else {
      this.update(object);
    }
  }
}

update(object) {

  this.apiLegalEntity
    .updateTSOCodeLegalEntity((this.clean(object)))
    .subscribe({
      next: (res) => {
        this.messageService.showToast(
          "success",
          "Success",
          "TSO code of legal entity updated successfully!"
        );
        this.entityAssociationForm.reset();
        this.ref.close("update");
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while updating legal entity"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
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
