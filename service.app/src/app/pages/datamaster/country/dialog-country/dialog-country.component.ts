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
import { Country } from "../country";
import { messageService } from "../../../../@core/utils/messages";
@Component({
  selector: "ngx-dialog-country",
  templateUrl: "./dialog-country.component.html",
  styleUrls: ["./dialog-country.component.scss"],
})
export class DialogCountryComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() code: string;
  @Input() description: string;
  countryForm!: FormGroup;

  ngOnInit(): void {
    this.countryForm = this.formBuilder.group({
      code: new FormControl("", [Validators.required, Validators.maxLength(3)]),
      name: new FormControl("", [
        Validators.required,
        Validators.maxLength(35),
      ]),
    });

    if (this.action == "Update") {
      this.countryForm.controls["code"].setValue(this.code);
      this.countryForm.controls["code"].disable();
      this.countryForm.controls["name"].setValue(this.description);
    }
  }

  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogCountryComponent>,
    private apiCountry: CountryService
  ) {}

  cancel() {
    this.ref.close();
  }
  add() {
    if (this.countryForm.valid) {
      if (this.action == "Add") {
        this.apiCountry.addCountry(this.countryForm.value).subscribe({
          next: (res) => {
            this.messageService.showToast(
              "success",
              "Success",
              "Country added successfully!"
            );

            this.countryForm.reset();
            this.ref.close("save");
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while adding country"
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
    if (this.countryForm.valid) {
      this.apiCountry.updateCountry(this.countryForm.getRawValue()).subscribe({
        next: (res) => {
          this.messageService.showToast(
            "success",
            "Success",
            "Country updated successfully!"
          );
          this.countryForm.reset();
          this.ref.close("update");
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while updating country"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
    }
  }
}
