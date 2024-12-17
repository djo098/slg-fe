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
import { CurrencyService } from "../../../../@core/services/currency.service";

@Component({
  selector: "ngx-dialog-currency",
  templateUrl: "./dialog-currency.component.html",
  styleUrls: ["./dialog-currency.component.scss"],
})
export class DialogCurrencyComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() code: string;
  @Input() id: number;
  @Input() description: string;
  currencyForm!: FormGroup;

  ngOnInit(): void {
    this.currencyForm = this.formBuilder.group({
      code: new FormControl("", [Validators.required, Validators.maxLength(3)]),
      description: new FormControl("", [
        Validators.required,
        Validators.maxLength(35),
      ]),
      id: new FormControl("",),
    });
  
    if (this.action == "Update") {
      this.currencyForm.controls["id"].setValue(this.id);
     
      this.currencyForm.controls["code"].setValue(this.code);
 
      this.currencyForm.controls["description"].setValue(this.description);
    }
    this.currencyForm.controls["id"].disable();
  }

  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogCurrencyComponent>,
    private apiCurrency: CurrencyService
  ) {}

  cancel() {
    this.ref.close();
  }
  add() {
    if (this.currencyForm.valid) {
      if (this.action == "Add") {
        this.apiCurrency.addCurrency(this.currencyForm.value).subscribe({
          next: (res) => {
            this.messageService.showToast(
              "success",
              "Success",
              "Currency added successfully!"
            );

            this.currencyForm.reset();
            this.ref.close("save");
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while adding currency"
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
    if (this.currencyForm.valid) {
      this.apiCurrency
        .updateCurrency(this.currencyForm.getRawValue())
        .subscribe({
          next: (res) => {
            this.messageService.showToast(
              "success",
              "Success",
              "Currency updated successfully!"
            );
            this.currencyForm.reset();
            this.ref.close("update");
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while updating currency"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        });
    }
  }
}
