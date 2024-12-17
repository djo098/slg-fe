import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
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
import { CountryService } from '../../../../../@core/services/country.service';
import { BalanceZoneService } from '../../../../../@core/services/balanceZone.service';
import { map } from 'rxjs/operators';
import {messageService} from '../../../../../@core/utils/messages';
import { formatNumber, NumberFormatStyle } from '@angular/common';
import NumberColumnType from '@revolist/revogrid-column-numeral';
@Component({
  selector: 'ngx-dialog-vbs',
  templateUrl: './dialog-vbs.component.html',
  styleUrls: ['./dialog-vbs.component.scss'],
})
export class DialogVbsComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() id: string;
  @Input() name: string;
  @Input() injection: number;
  @Input() extraction: number;
  @Input() vbp_id: number;
  @Input() balance_zone_id: number;
  @Input() eic: string;
  numeral = NumberColumnType.getNumeralInstance();
  maxId: number;
  vbsForm!: FormGroup;
  balanceZoneForm!: FormGroup;
  vbpOptions: any;
  countriesOptions: any;
  zoneOptions: any;
  errorBalancingPoint: boolean;

  ngOnInit(): void {
    this.vbsForm = this.formBuilder.group({
      id: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      injection_capacity: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/),
        Validators.min(0),
      ]),
      extraction_capacity: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/),  
        Validators.min(0),
      ]),
      type: new FormControl(''),
      parent_id: new FormControl('', Validators.required),
      eic: new FormControl('',),
    });
    this.balanceZoneForm = this.formBuilder.group({
      balance_zone_id: new FormControl('',


    ),
    });
    if (this.action == 'Update') {
      this.vbsForm.controls['id'].setValue(this.id);
      this.vbsForm.controls['id'].disable();
      this.vbsForm.controls['name'].setValue(this.name);
      this.vbsForm.controls['injection_capacity'].setValue(this.numeral(this.injection).format('0,0.[0000000000]'));
      this.vbsForm.controls['extraction_capacity'].setValue(this.numeral(this.extraction).format('0,0.[0000000000]'));
      this.vbsForm.controls['type'].setValue('underground_storage');
      this.vbsForm.controls['parent_id'].setValue(this.vbp_id);
      this.vbsForm.controls['eic'].setValue(this.eic);
      this.balanceZoneForm.controls['balance_zone_id'].setValue(this.balance_zone_id);
      this.getVBP(this.balanceZoneForm.get('balance_zone_id').value);
      this;
    } else if (this.action == 'Add') {
      this.vbsForm.controls['id'].disable();
      this.vbsForm.controls['type'].setValue('underground_storage');
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object= JSON.parse(localStorage.getItem('settings_parameters')); this.balanceZoneForm 
          .get("balance_zone_id")
          .setValue(object["balancing_zone"]);
          this.getVBP(object["balancing_zone"])

      }
    }
  }

  constructor(
    private messageService : messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogVbsComponent>,
    private apiLogisticElement: LogisticElementService,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
  ) {

    this.getbalanceZones();

  }

  cancel() {
    this.ref.close();
  }
  add() {  

    if (this.vbsForm.valid) {
      this.vbsForm.controls["injection_capacity"].clearValidators();
      this.vbsForm.controls["extraction_capacity"].clearValidators();
      this.vbsForm.controls["injection_capacity"].setValue(Number(this.vbsForm.get("injection_capacity").value.toString().replace(/\./g, "").replace(",", ".")));
      this.vbsForm.controls["extraction_capacity"].setValue(Number(this.vbsForm.get("extraction_capacity").value.toString().replace(/\./g, "").replace(",", ".")));
    
      if (this.action == 'Add') {
        this.apiLogisticElement
          .addLogisticElement(this.vbsForm.value)
          .subscribe({
            next: (res) => {
              this.messageService.showToast('success','Success','Underground storage added successfully!')
              this.vbsForm.reset();
              this.ref.close('save');
            },
            error: (e) => {
              if (e.error.title == 'Internal Server Error') {
                this.messageService.showToast('danger','Error','Internal server error while adding underground storage')
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
      .updateLogisticElement(this.vbsForm.getRawValue())
      .subscribe({
        next: (res) => {
          this.messageService.showToast('success','Success','Underground storage added successfully!')
          this.vbsForm.reset();
          this.ref.close('update');
        },
        error: (e) => {
          if (e.error.title == 'Internal Server Error') {
            this.messageService.showToast('danger','Error','Internal server error while updating underground storage')
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
          alertifyjs.error('Internal Server Error');
          } else {
            if (e.error.title == 'Internal Server Error') {
              this.messageService.showToast('danger','Error','Internal server error while getting countries')
              } else {
                this.messageService.showToast('danger','Error',e.error);
         
              }
          }
      },
    });
  }
  onChange($event) {
    this.vbpOptions = [];

    this.vbsForm.controls['parent_id'].setValue('');
   this.getVBP(this.balanceZoneForm.get('balance_zone_id').value);

  }


  getVBP(zone) {
    this.apiLogisticElement.getBalancingPointsByZone(zone)
    .subscribe({
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
        this.messageService.showToast('danger','Error','Internal server error while getting virtual balancing points')
        } else {
          this.messageService.showToast('danger','Error',e.error);
   
        }
     },
   });
   }
}
