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
import { CountryService } from "../../../../@core/services/country.service";
import * as alertifyjs from "alertifyjs";

import { messageService } from "../../../../@core/utils/messages";
import { VesselService } from "../../../../@core/services/vessel.service";
import { Country } from "../../country/country";
import NumberColumnType from "@revolist/revogrid-column-numeral";

@Component({
  selector: "ngx-dialog-vessel",
  templateUrl: "./dialog-vessel.component.html",
  styleUrls: ["./dialog-vessel.component.scss"],
})
export class DialogVesselComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() code: string;
  @Input() id: number;
  @Input() capacity: number;
  @Input() name: string;
  vesselForm!: FormGroup;
  countriesOptions: any;
  numeral = NumberColumnType.getNumeralInstance();

  ngOnInit(): void {
    this.numeral.locale("es");
    this.vesselForm = this.formBuilder.group({
      id: new FormControl(""),
      name: new FormControl("", [Validators.required]),
      code: new FormControl(""),
      capacity: new FormControl("", [
        Validators.required,
        Validators.pattern(
          /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/
        ),
      ]),
    });

    if (this.action == "Update") {
      this.vesselForm.controls["id"].setValue(this.id);

      this.vesselForm.controls["code"].setValue(this.code);

      this.vesselForm.controls["name"].setValue(this.name);
      this.vesselForm.controls["capacity"].setValue(
        this.numeral(this.capacity).format("0,0.[0000000000]")
      );
    }
    this.vesselForm.controls["id"].disable();
  }

  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogVesselComponent>,
    private apiVessel: VesselService,
    private apiCountry: CountryService
  ) {}

  cancel() {
    this.ref.close();
  }
  add() {
    if (this.vesselForm.valid) {
      this.vesselForm.controls["capacity"].clearValidators();
      this.vesselForm.controls["capacity"].setValue(
        Number(
          this.vesselForm
            .get("capacity")
            .value.toString()
            .replace(/\./g, "")
            .replace(",", ".")
        )
      );
      if (this.action == "Add") {
        this.apiVessel.addVessel(this.vesselForm.value).subscribe({
          next: (res) => {
            this.messageService.showToast(
              "success",
              "Success",
              "Vessel added successfully!"
            );

            this.vesselForm.reset();
            this.ref.close("save");
          },
          error: (e) => {
            this.vesselForm.reset();
            this.ref.close("save");
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while adding vessel"
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
    if (this.vesselForm.valid) {
      this.apiVessel.updateVessel(this.vesselForm.getRawValue()).subscribe({
        next: (res) => {
          this.messageService.showToast(
            "success",
            "Success",
            "Vessel updated successfully!"
          );
          this.vesselForm.reset();
          this.ref.close("update");
        },
        error: (e) => {
          this.vesselForm.reset();
          this.ref.close("update");
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while updating vessel"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
    }
  }
}
