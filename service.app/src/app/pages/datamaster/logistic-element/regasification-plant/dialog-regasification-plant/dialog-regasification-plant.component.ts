import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import {messageService} from '../../../../../@core/utils/messages';
import {
  FormGroup,
  FormBuilder,
  Validators,
  Form,
  FormControl,
} from '@angular/forms';
import { LogisticElementService } from '../../../../../@core/services/logisticElement.service';
import * as alertifyjs from 'alertifyjs';
import { BalanceRuleService } from '../../../../../@core/services/balanceRule.service';
import { BalanceZoneService } from '../../../../../@core/services/balanceZone.service';
import { CountryService } from '../../../../../@core/services/country.service';
import NumberColumnType from '@revolist/revogrid-column-numeral';
@Component({
  selector: 'ngx-dialog-regasification-plant',
  templateUrl: './dialog-regasification-plant.component.html',
  styleUrls: ['./dialog-regasification-plant.component.scss'],
})
export class DialogRegasificationPlantComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() id: string;
  @Input() name: string;
  //@Input() losses: number;
  @Input() country_code: string;
  @Input() balance_zone_id: string;
  @Input() vbt_id: number;
  @Input() eic: string;
  numeral = NumberColumnType.getNumeralInstance();
  maxId: number;
  regasificationPlantForm!: FormGroup;
  tankForm!: FormGroup;
  vbtOptions: any;
  countriesOptions: any;
  vbpOptions: any;
  zoneOptions: any;
  errorBalancingPoint: any;
  errorTank: any;

  ngOnInit(): void {
    this.regasificationPlantForm = this.formBuilder.group({
      id: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
    /*   losses_rp: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/),
        Validators.min(0),
        Validators.max(100),
      ]), */
      type: new FormControl(''),
      parent_id: new FormControl('', Validators.required),
      eic: new FormControl('',),
    });
    this.tankForm = this.formBuilder.group({
      balance_zone_id: new FormControl('', Validators.required),
      balancing_point_id: new FormControl('', Validators.required),
    
    });
    if (this.action == 'Update') {
      this.regasificationPlantForm.controls['id'].setValue(this.id);
      this.regasificationPlantForm.controls['id'].disable();
      this.regasificationPlantForm.controls['name'].setValue(this.name);
      //this.regasificationPlantForm.controls['losses_rp'].setValue(this.numeral(this.losses).format('0,0.[0000000000]'));
      this.regasificationPlantForm.controls['type'].setValue(
        'regasification_plant',
      );
   
        this.regasificationPlantForm.controls['eic'].setValue(
         this.eic
        );
    
  
      this.tankForm.controls['balance_zone_id'].setValue(this.balance_zone_id);
      this.getVBP(this.balance_zone_id);
      this.tankForm.controls['balance_zone_id'].setValue(this.balance_zone_id);
      this.getPointByTank(this.id);

      this.regasificationPlantForm.controls['parent_id'].setValue(this.vbt_id);

      /*   this.regasificationPlantForm.controls['country_code'].setValue(this.country_code)
  this.getbalanceZones(this.country_code);
  this.regasificationPlantForm.controls['balance_zone_name'].setValue(this.balance_zone_name); */
    } else if (this.action == 'Add') {
      this.regasificationPlantForm.controls['id'].disable();
      this.regasificationPlantForm.controls['type'].setValue(
        'regasification_plant',
      );
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object= JSON.parse(localStorage.getItem('settings_parameters'));
      
   
        this.tankForm
          .get("balance_zone_id")
          .setValue(object["balancing_zone"]);
          this.getVBP(object["balancing_zone"])
    

      }
    }
  }

  constructor(
    private messageService : messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogRegasificationPlantComponent>,
    private apiLogisticElement: LogisticElementService,
    private apiBalanceRule: BalanceRuleService,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
  ) {
    this.getbalanceZones();
  }

  cancel() {
    this.ref.close();
  }
  add() {
    if (this.regasificationPlantForm.valid) {
     /*  this.regasificationPlantForm.controls["losses_rp"].clearValidators();
      this.regasificationPlantForm.controls["losses_rp"].setValue(Number(this.regasificationPlantForm.get("losses_rp").value.toString().replace(/\./g, "").replace(",", ".")));

      
      this.regasificationPlantForm.controls['losses_rp'].setValue(this.regasificationPlantForm.get('losses_rp').value / 100); */
      if (this.action == 'Add') {
        this.apiLogisticElement
          .addLogisticElement(this.regasificationPlantForm.value)
          .subscribe({
            next: (res) => {
              this.messageService.showToast('success','Success','Regasification plant added successfully!')
              this.regasificationPlantForm.reset();
              this.ref.close('save');
            },
            error: (e) => {
              if (e.error.title == 'Internal Server Error') {
                this.messageService.showToast('danger','Error','Internal server error while adding regasification plant')
                } else {
                  this.messageService.showToast('danger','Error',e.error);
           
                }
            },
          });
      } else {
        this.update();
      }
    }
  }

  update() {
    this.apiLogisticElement
      .updateLogisticElement(this.regasificationPlantForm.getRawValue())
      .subscribe({
        next: (res) => {
          this.messageService.showToast('success','Success','Regasification plant updated successfully!')
      
          this.regasificationPlantForm.reset();
          this.ref.close('update');
        },
        error: (e) => {
          if (e.error.title == 'Internal Server Error') {
            this.messageService.showToast('danger','Error','Internal server error while updating regasification plant')
            } else {
              this.messageService.showToast('danger','Error',e.error);
       
            }
        },
      });
  }
  getVBT(id) {
    this.apiLogisticElement
      .getLogisticElementChildrenByType(id, 'tank')
      .subscribe({
        next: (res) => {
          this.vbtOptions = res;
          if (this.vbtOptions.length == 0) {
            this.errorTank = true;
          } else {
            this.errorTank = false;
          }
        },
        error: (e) => {
          if (e.error.title == 'Internal Server Error') {
            this.messageService.showToast('danger','Error','Internal server error while getting LNG tanks')
            } else {
              this.messageService.showToast('danger','Error',e.error);
       
            }
        },
      });
  }

  getbalanceZones() {
    this.apiBalanceZone.getBalanceZones().subscribe({
      next: (res) => {
        this.zoneOptions = res;
      },
      error: (e) => {
        if (e.error.title == 'Internal Server Error') {
          this.messageService.showToast('danger','Error','Internal server error while getting balancing zones')
          } else {
            this.messageService.showToast('danger','Error',e.error);
     
          }
      },
    });
  }
  getcountries() {
    this.apiCountry.getcountries().subscribe({
      next: (res) => {
        this.countriesOptions = res;
      },
      error: (e) => {
        if (e.error.title == 'Internal Server Error') {
          this.messageService.showToast('danger','Error','Internal server error while getting countries')
          } else {
            this.messageService.showToast('danger','Error',e.error);
     
          }
      },
    });
  }

  onChangeBalanceZone($event) {
    this.vbpOptions = [];

    this.regasificationPlantForm.controls['parent_id'].setValue('');
    this.tankForm.controls['balancing_point_id'].setValue('');
    this.getVBP(this.tankForm.get('balance_zone_id').value);
  }
  onChangeBalancingPoint($event) {
    this.vbtOptions = [];

    this.regasificationPlantForm.controls['parent_id'].setValue('');
    this.getVBT(this.tankForm.get('balancing_point_id').value);
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
        if (e.error.title == 'Internal Server Error') {
          this.messageService.showToast('danger','Error','Internal server error while getting balance points')
          } else {
            this.messageService.showToast('danger','Error',e.error);
     
          }
      },
    });
  }

  getPointByTank(id) {
    this.apiLogisticElement.getLogisticElementBP(id).subscribe({
      next: (res) => {
        const data = res;
        data.map((x) =>
          this.tankForm.controls['balancing_point_id'].setValue(x.id),

        );
        this.getVBT(this.tankForm.get('balancing_point_id').value);
      },
      error: (e) => {
        if (e.error.title == 'Internal Server Error') {
          this.messageService.showToast('danger','Error','Internal server error while getting balance points')
          } else {
            this.messageService.showToast('danger','Error',e.error);
     
          }
      },
    });
  }
}
