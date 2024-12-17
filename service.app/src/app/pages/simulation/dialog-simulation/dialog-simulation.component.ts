import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { NbDialogRef } from "@nebular/theme";
import NumberColumnType from '@revolist/revogrid-column-numeral';
import { BalanceZoneService } from '../../../@core/services/balanceZone.service';
import { CountryService } from '../../../@core/services/country.service';
import { TollService } from '../../../@core/services/toll.service';
import { messageService } from "../../../@core/utils/messages";
import { LegalEntityService } from '../../../@core/services/legalEntity.service';
import * as moment from "moment";
import { DatePipe, formatNumber } from "@angular/common";
import { BalanceService } from '../../../@core/services/balance.service';
@Component({
  selector: 'ngx-dialog-simulation',
  templateUrl: './dialog-simulation.component.html',
  styleUrls: ['./dialog-simulation.component.scss']
})
export class DialogSimulationComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;

  numeral = NumberColumnType.getNumeralInstance();
  simulationForm!: FormGroup;
  columns: any;
  rows: any;
  errorBalanceZone=false;
  errorDateRange = false
  errorLegalEntity=false
  zoneOptions : any
  countriesOptions : any
  entitiesOptions: any;
  loading = false;
  layoutOptions : any;
  errorLayout = false;
  ngOnInit(): void {
    this.simulationForm = this.formBuilder.group({
      id: new FormControl("", [Validators.required]),
      label: new FormControl("", [Validators.required]),
      entity_id: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      balance_zone_id: new FormControl("", [Validators.required]),
      date: new FormControl("", [Validators.required,this.dateRangeValidator]),
      layout_id: new FormControl("", [Validators.required]),
    });


 if(this.action == 'Add'){
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object= JSON.parse(localStorage.getItem('settings_parameters'));
        this.simulationForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.getbalanceZones(object["country_code"]);
        this.simulationForm
          .get("balance_zone_id")
          .setValue(object["balancing_zone"]);
       
     
      }
    }
    this.simulationForm.controls["id"].disable();
  

  }

  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogSimulationComponent>,
    private apiBalanceZone: BalanceZoneService,
    private apiCountry: CountryService,
    private apiSimulation: BalanceService,
    private apiLegalEntity: LegalEntityService,
    public datepipe: DatePipe,
    private apiBalance: BalanceService,
  ) {
    this.getCountries();
    this.getLegalEntities();
  }

  cancel() {
    this.ref.close();
  }
  private dateRangeValidator: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date = this.simulationForm && this.simulationForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.simulationForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.simulationForm.get("date").value.end,
        "yyyy-MM-dd"
      );

      if (from && to) {
        if (
          (moment(from, "yyyy-MM-dd").isValid() == true ||
            moment(to, "yyyy-MM-dd").isValid() == true) &&
          new Date(from).valueOf() <= new Date(to).valueOf()
        ) {
          invalid = false;
        } else {
          invalid = true;
        }
      }
    } else {
      invalid = true;
    }

    if (invalid == true) {
      this.errorDateRange = true;
    } else {
      this.errorDateRange = false;
    }

    return invalid ? { invalidRange: {} } : null;
  };
  add() {
    if (this.simulationForm.valid) {
   if (this.action == "Add") {
    this.loading=true;
    var object = {
      id: this.simulationForm.get('id').value ? this.simulationForm.get('id').value : null,
      start_date:  this.datepipe.transform(
        this.simulationForm.get('date').value.start,
        "yyyy-MM-dd"
      ),
      end_date: this.datepipe.transform(
        this.simulationForm.get('date').value.end,
        "yyyy-MM-dd"
      ),
      label: this.simulationForm.get('label').value,
      balance_zone_id: this.simulationForm.get('balance_zone_id').value,
      entity_id: this.simulationForm.get('entity_id').value,
      layout_id: this.simulationForm.get('layout_id').value==0 ? null : this.simulationForm.get('layout_id').value
    }
        this.apiSimulation.createBalanceSimulation(this.clean(object)).subscribe({
          next: (res) => {
            this.messageService.showToast(
              "success",
              "Success",
              "Simulation added successfully!"
            );
            this.simulationForm.reset();
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
        }).add(()=>{
          this.loading=false;
        });
      } 
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
  getLegalEntities() {
    this.apiLegalEntity
      .getAllLegalEntitiesByCountry(null, "Internal")
      .subscribe({
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
  onChangeCountry($event) {
    this.simulationForm.controls["balance_zone_id"].setValue("");  
    this.getbalanceZones(this.simulationForm.get("country_code").value);
 

  }
  onChangeZone($event){
  this.getLayouts($event);
  this.simulationForm.controls["layout_id"].setValue("");
  }
  getLayouts(zone) {
    this.apiBalance.getBalanceLayoutConfiguration().subscribe({
      next: (res) => {
        this.layoutOptions = res;

        this.layoutOptions = this.layoutOptions.filter((item) => {
          return item["balance_zone_id"] == zone;
        });
   /*      if (this.layoutOptions.length == 0){
          this.errorLayout = true;
        } else {
          this.errorLayout = false;
        } */
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting list of columns"
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
