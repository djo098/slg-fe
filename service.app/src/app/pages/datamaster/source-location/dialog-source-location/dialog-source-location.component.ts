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
import { VesselService } from "../../../../@core/services/vessel.service"
import { Country } from "../../country/country";
import NumberColumnType from "@revolist/revogrid-column-numeral";

@Component({
  selector: 'ngx-dialog-source-location',
  templateUrl: './dialog-source-location.component.html',
  styleUrls: ['./dialog-source-location.component.scss']
})
export class DialogSourceLocationComponent implements OnInit {

  @Input() action: string;
  @Input() title: string;
  @Input() code: string;
  @Input() id: number;
  @Input() name: string;
  @Input() country_code: string;
  @Input() gas_density: string;
  sourceForm!: FormGroup;
  countriesOptions: any;
  numeral = NumberColumnType.getNumeralInstance();

  ngOnInit(): void {
    this.numeral.locale("es");
    this.sourceForm = this.formBuilder.group({
      id: new FormControl("", ),
      name: new FormControl("", [Validators.required, ]),
      code: new FormControl("", ),
      country_code: new FormControl("", [
        Validators.required,

      ]),
      gas_density: new FormControl("",[Validators.pattern(/^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/),  
    ]),
    });

    if (this.action == "Update") {
      this.sourceForm.controls["id"].setValue(this.id);
     
      this.sourceForm.controls["code"].setValue(this.code);
 
      this.sourceForm.controls["name"].setValue(this.name);
      this.sourceForm.controls["country_code"].setValue(this.country_code);
      this.sourceForm.controls["gas_density"].setValue(this.numeral(this.gas_density).format('0,0.[0000000000]'));
    }
    this.sourceForm.controls["id"].disable();
  }

  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogSourceLocationComponent>,
    private apiVessel: VesselService,
    private apiCountry: CountryService
  ) {
    this.getCountries();
  }

  cancel() {
    this.ref.close();
  }
  add() {
    if (this.sourceForm.valid) {
      this.sourceForm.controls["gas_density"].clearValidators();
       this.sourceForm.controls["gas_density"].setValue(Number(this.sourceForm.get("gas_density").value.toString().replace(/\./g, "").replace(",", ".")));
    
     
      if (this.action == "Add") {
       
     
         this.apiVessel.addSource(this.sourceForm.value).subscribe({
          next: (res) => {
            this.messageService.showToast(
              "success",
              "Success",
              "Source added successfully!"
            );

            this.sourceForm.reset();
            this.ref.close("save");
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while adding source"
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
    if (this.sourceForm.valid) {
     

      this.apiVessel
        .updateSource(this.sourceForm.getRawValue())
        .subscribe({
          next: (res) => {
            this.messageService.showToast(
              "success",
              "Success",
              "Source updated successfully!"
            );
            this.sourceForm.reset();
            this.ref.close("update");
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while updating source"
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
        if (e.error.title == 'Internal Server Error') {
          this.messageService.showToast('danger', 'Error', 'Internal server error while getting countries')
        } else {
          this.messageService.showToast('danger', 'Error', e.error)

        }
      },
    });
  }

}
