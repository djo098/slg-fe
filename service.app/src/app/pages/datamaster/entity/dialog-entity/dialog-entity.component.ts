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
@Component({
  selector: "ngx-dialog-entity",
  templateUrl: "./dialog-entity.component.html",
  styleUrls: ["./dialog-entity.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DialogEntityComponent),
      multi: true,
    },
  ],
})
export class DialogEntityComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() id: number;
  @Input() name: string;
  @Input() code: string;
  @Input() country_code: string;
  @Input() eic: string;
  @Input() type: string;
  @Input() vat: string;
  @Input() address: string;
  @Input() email: string;
  @Input() active: boolean;
  @Input() source_type: string;

  countriesOptions: any;
  typeOptions: any;
  entityForm!: FormGroup;
  entities: LegalEntity[];
  maxId: number;
  countrySelected: number;
  text: string;
  ngOnInit(): void {
    this.typeOptions=["Internal","External"]
    this.entityForm = this.formBuilder.group({
      id: new FormControl(),
      name: new FormControl("",[Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      code: new FormControl(null),
      type: new FormControl("", Validators.required),
      eic: new FormControl(null),
      vat_code: new FormControl(null),
      address: new FormControl(null),
      email: new FormControl(null,[Validators.pattern(/.+@.+\..+/)]),
      active: new FormControl(true),
      source_type: new FormControl(null),
    });
    if (this.action == "Update") {
      this.entityForm.controls["id"].setValue(this.id);
      this.entityForm.controls["id"].disable();
      this.entityForm.controls["name"].setValue(this.name);
      this.entityForm.controls["code"].setValue(this.code);
      this.entityForm.controls["type"].setValue(this.type);
      this.entityForm.controls["country_code"].setValue(this.country_code);
      this.entityForm.controls["address"].setValue(this.address);
      this.entityForm.controls["email"].setValue(this.email);
      this.entityForm.controls["active"].setValue(this.active); 
      this.entityForm.controls["eic"].setValue(this.eic);
      this.entityForm.controls["vat_code"].setValue(this.vat);
      this.entityForm.controls["source_type"].setValue(this.source_type);
      if(this.source_type == 'External'){
        this.entityForm.disable();
        this.entityForm.controls["code"].enable();
      }
    } else if (this.action == "Add") {
      this.entityForm.controls["id"].disable();
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object= JSON.parse(localStorage.getItem('settings_parameters'));
        this.entityForm
          .get("country_code")
          .setValue(object["country_code"]);

      }
    }

    this.entityForm.controls["id"].disable();
  }

  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogEntityComponent>,
    private apiLegalEntity: LegalEntityService,
    private apiCountry: CountryService
  ) {
    this.getcountries();
  }

  cancel() {
    this.ref.close();
  }

  add() {
    if (this.entityForm.valid) {

      if (this.action == "Add") {
        this.entityForm.controls["source_type"].setValue('Internal');

        this.apiLegalEntity.addLegalEntity(this.clean(this.entityForm.value)).subscribe({
          next: (res) => {
            this.messageService.showToast(
              "success",
              "Success",
              "Legal entity added successfully!"
            );
            this.entityForm.reset();
            this.ref.close("save");
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while adding legal entity"
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
    this.apiLegalEntity
      .updateLegalEntity((this.clean(this.entityForm.getRawValue())))
      .subscribe({
        next: (res) => {
          this.messageService.showToast(
            "success",
            "Success",
            "Legal entity updated successfully!"
          );
          this.entityForm.reset();
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
  getId() {
    this.apiLegalEntity.getLegalEntities().subscribe((data) => {
      if (data.length > 0) {
        this.maxId =
          Math.max.apply(
            Math,
            data.map((obj) => obj.id)
          ) + 1;
      } else {
        this.maxId = 1;
      }
      this.entityForm.controls["id"].setValue(this.maxId);
      this.entityForm.controls["id"].disable();
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
  clean(obj) {
    for (var propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      }
    }
    return obj;
  }

}
