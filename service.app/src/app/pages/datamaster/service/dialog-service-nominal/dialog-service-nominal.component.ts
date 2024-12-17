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
import { CountryService } from "../../../../@core/services/country.service";
import { messageService } from "../../../../@core/utils/messages";
import { BalanceZoneService } from "../../../../@core/services/balanceZone.service";
import { DialogAssociationComponent } from "../../entity/dialog-association/dialog-association.component";
import { ConnectionPointService } from "../../../../@core/services/connectionPoint.service";
@Component({
  selector: "ngx-dialog-service-nominal",
  templateUrl: "./dialog-service-nominal.component.html",
  styleUrls: ["./dialog-service-nominal.component.scss"],
})
export class DialogServiceNominalComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() id: number;
  @Input() service_id: number;
  @Input() country: string;
  @Input() balance_zone_id: number;
  @Input() nominable: boolean;
  @Input() granularity: string;
  countriesOptions: any;
  serviceNominableForm!: FormGroup;
  entitiesOptions: any;
  errorLegalEntity = false;
  zoneOptions: any;
  errorBalanceZone = false;
  serviceOptions: any;
  granularityOptions: any;
  ngOnInit(): void {
    this.granularityOptions = [{id: 'daily', label: 'Daily'},{id: 'hourly', label: 'Hourly'}];
    this.serviceNominableForm = this.formBuilder.group({
      id: new FormControl(),
      nominable: new FormControl(true, [Validators.required]),
      balance_zone_id: new FormControl("", [Validators.required]),
      country: new FormControl("", Validators.required),
      service_id: new FormControl("", Validators.required),
      granularity: new FormControl("", Validators.required),
    });
    if (this.action == "Update") {
      this.getbalanceZones(this.country);
      this.serviceNominableForm.controls["id"].setValue(this.id);
      this.serviceNominableForm.controls["id"].disable();
      this.serviceNominableForm.controls["service_id"].setValue(this.service_id);
      this.serviceNominableForm.controls["balance_zone_id"].setValue(
        this.balance_zone_id
      );
      this.serviceNominableForm.controls["country"].setValue(
        this.country
      );
      this.serviceNominableForm.controls["nominable"].setValue(
        this.nominable
      );

      this.serviceNominableForm.controls["granularity"].setValue(
        this.granularity
      );
    } else if (this.action == "Add") {
      this.serviceNominableForm.controls["id"].disable();
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object= JSON.parse(localStorage.getItem('settings_parameters'));
        this.serviceNominableForm
          .get("country")
          .setValue(object["country_code"]);
        this.getbalanceZones(object["country_code"]);
        this.serviceNominableForm
          .get("balance_zone_id")
          .setValue(object["balancing_zone"]);
     
      }
    }

    this.serviceNominableForm.controls["id"].disable();
  }
  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogAssociationComponent>,
    private apiLegalEntity: LegalEntityService,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
    private apiConnectionPoint: ConnectionPointService
  ) {
    this.getCountries();
    this.getLegalEntities();
    this.getServices();
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
    this.serviceNominableForm.controls["balance_zone_id"].setValue("");
    this.getbalanceZones(this.serviceNominableForm.get("country").value);
  }
  getLegalEntities() {
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
  cancel() {
    this.ref.close();
  }

  add() {
    if (this.serviceNominableForm.valid) {
      if (this.action == "Add") {
        var country =    this.serviceNominableForm.get("country").value;
       this.serviceNominableForm.controls["country"].setValue(null);

        this.apiConnectionPoint
          .addLogisticServiceBalanceZone(
            this.clean(this.serviceNominableForm.value)
          )
          .subscribe({
            next: (res) => {
              this.messageService.showToast(
                "success",
                "Success",
                "Nominable service added successfully!"
              );
              this.serviceNominableForm.reset();
              this.ref.close("save");
            },
            error: (e) => {
              this.serviceNominableForm.controls["country"].setValue(country);
              if (e.error.title == "Internal Server Error") {
                this.messageService.showToast(
                  "danger",
                  "Error",
                  "Internal server error while adding service configuration"
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
    this.serviceNominableForm.controls["country"].setValue(null);

    this.apiConnectionPoint.updateLogisticServiceBalanceZone(
        this.clean(this.serviceNominableForm.getRawValue())
      )
      .subscribe({
        next: (res) => {
          this.messageService.showToast(
            "success",
            "Success",
            "Nominable service updated successfully!"
          );
          this.serviceNominableForm.reset();
          this.ref.close("update");
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while updating service configuration"
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
  toggle($event) {}
  getServices(connection_type?) {
    this.apiConnectionPoint.getLogisticServices().subscribe({
      next: (res) => {
        this.serviceOptions = res;
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting services"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
}
