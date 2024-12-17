import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  NbComponentStatus,
  NbDialogRef,
  NbGlobalPhysicalPosition,
  NbGlobalPosition,
  NbToastrConfig,
  NbToastrService,
} from "@nebular/theme";
import {
  FormGroup,
  FormBuilder,
  Validators,
  Form,
  FormControl,
} from "@angular/forms";
import { SupplyPointsAreaService } from "../../../../@core/services/supplyPointsArea.service";
import * as alertifyjs from "alertifyjs";
import { messageService } from "../../../../@core/utils/messages";
import { CountryService } from "../../../../@core/services/country.service";
import { BalanceZoneService } from "../../../../@core/services/balanceZone.service";
import { LogisticElementService } from "../../../../@core/services/logisticElement.service";
@Component({
  selector: "ngx-dialog-supplyArea",
  templateUrl: "./dialog-supply-area.component.html",
  styleUrls: ["./dialog-supply-area.component.scss"],
})
export class DialogSupplyAreaComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() id: number;
  @Input() label: string;
  @Input() balance_zone_id: number;
  @Input() balancing_point_id: number;
  @Input() country_code: string;
  supplyAreaForm!: FormGroup;
  additionalForm!: FormGroup;
  countriesOptions: any;
  zoneOptions: any;
  vbpOptions: any;
  errorBalanceZone: any;
  errorBalancingPoint: any;

  ngOnInit(): void {

    this.supplyAreaForm = this.formBuilder.group({
      id: new FormControl("", []),
      label: new FormControl("", [
        Validators.required,
       
      ]),
      balancing_point_id: new FormControl("", [Validators.required]),
    });
    this.additionalForm = this.formBuilder.group({
      country_code: new FormControl("", [Validators.required]),
      balance_zone_id: new FormControl("", [Validators.required]),
    });
    if (this.action == "Update") {
      this.supplyAreaForm.controls["id"].setValue(this.id);
      this.supplyAreaForm.controls["id"].disable();
      this.supplyAreaForm.controls["label"].setValue(this.label);
      this.additionalForm.controls["country_code"].setValue(this.country_code);
      this.getbalanceZones(this.country_code);
      this.additionalForm.controls["balance_zone_id"].setValue(
        this.balance_zone_id
      );
      this.getVBP(this.balance_zone_id);
      this.supplyAreaForm.controls["balancing_point_id"].setValue(
        this.balancing_point_id
      );
    } else if(this.action=='Add'){
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object= JSON.parse(localStorage.getItem('settings_parameters'));
        this.additionalForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.getbalanceZones(object["country_code"]);
        this.additionalForm
          .get("balance_zone_id")
          .setValue(object["balancing_zone"]);
        this.getVBP(object["balancing_zone"]);
      }
    }
    this.supplyAreaForm.controls["id"].disable();
  }

  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogSupplyAreaComponent>,
    private apiSupplyAreasAndPoints: SupplyPointsAreaService,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
    private apiLogisticElement: LogisticElementService
  ) {
    this.getCountries();
  }

  cancel() {
    this.ref.close();
  }
  add() {
    if (this.supplyAreaForm.valid) {
      if (this.action == "Add") {
        this.apiSupplyAreasAndPoints
          .addSupplyArea(this.supplyAreaForm.value)
          .subscribe({
            next: (res) => {
              this.messageService.showToast(
                "success",
                "Success",
                "supply area added successfully!"
              );

              this.supplyAreaForm.reset();
              this.ref.close("save");
            },
            error: (e) => {
              if (e.error.title == "Internal Server Error") {
                this.messageService.showToast(
                  "danger",
                  "Error",
                  "Internal server error while adding supply area"
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
    if (this.supplyAreaForm.valid) {
      this.apiSupplyAreasAndPoints
        .updateSupplyArea(this.supplyAreaForm.getRawValue())
        .subscribe({
          next: (res) => {
            this.messageService.showToast(
              "success",
              "Success",
              "supply area updated successfully!"
            );
            this.supplyAreaForm.reset();
            this.ref.close("update");
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while updating supply area"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        });
    }
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
  onChangeCountry($event) {
    this.zoneOptions = [];
    this.additionalForm.controls["balance_zone_id"].setValue("");
    this.supplyAreaForm.controls["balancing_point_id"].setValue("");
    this.getbalanceZones(this.additionalForm.get("country_code").value);
  }
  onChangeZone($event) {
    this.vbpOptions = [];

    this.supplyAreaForm.controls["balancing_point_id"].setValue("");
    this.getVBP(this.additionalForm.get("balance_zone_id").value);
  }
  getVBP(zone) {
    this.apiLogisticElement.getBalancingPointsByZone(zone).subscribe({
      next: (res) => {
        this.vbpOptions = res;
        if (this.vbpOptions.length == 0) {
          this.errorBalancingPoint = true;
        } else {
          this.errorBalancingPoint = false;
        }
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting virtual balancing points"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
}
