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
import { isThisQuarter } from 'date-fns';
import * as alertifyjs from 'alertifyjs';
import { BalanceRuleService } from '../../../../../@core/services/balanceRule.service';
import { CountryService } from '../../../../../@core/services/country.service';
import { BalanceZoneService } from '../../../../../@core/services/balanceZone.service';
import { map } from 'rxjs/operators';
import {messageService} from '../../../../../@core/utils/messages';

@Component({
  selector: 'ngx-dialog-vbt',
  templateUrl: './dialog-vbt.component.html',
  styleUrls: ['./dialog-vbt.component.scss'],
})
export class DialogVbtComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() id: string;
  @Input() name: string;
  @Input() country_code: string;
  @Input() balance_zone_id: string;
  @Input() vbp_id: string;
  @Input() eic: string;
  vbtForm!: FormGroup;
  balanceZoneForm!: FormGroup;
  maxId: number;
  ruleOptions: any;
  countriesOptions: any;
  vbpOptions: any;
  zoneOptions: any;
  errorBalancingPoint: any;
  selectedItems: any;
  ngOnInit(): void {
    this.vbtForm = this.formBuilder.group({
      id: new FormControl(),
      name: new FormControl('', Validators.required),
      type: new FormControl(''),
      parent_id: new FormControl('', Validators.required),
      eic: new FormControl('',),
    });

    this.balanceZoneForm = this.formBuilder.group({
      balance_zone_id: new FormControl(''),
    });
    if (this.action == 'Update') {
      this.vbtForm.controls['id'].setValue(this.id);
      this.ruleOptions = [];
      this.vbtForm.controls['id'].disable();
      this.vbtForm.controls['name'].setValue(this.name);
      this.vbtForm.controls['type'].setValue('tank');
      this.vbtForm.controls['parent_id'].setValue(this.vbp_id);
      this.vbtForm.controls['eic'].setValue(this.eic);
      this.balanceZoneForm.controls['balance_zone_id'].setValue(
        this.balance_zone_id,
      );
      this.getVBP(this.balanceZoneForm.get('balance_zone_id').value);
    } else if (this.action == 'Add') {
      this.ruleOptions = [];
      this.vbtForm.controls['id'].disable();
      this.vbtForm.controls['type'].setValue('tank');
      this.getBalanceRulesByType();
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object= JSON.parse(localStorage.getItem('settings_parameters'));
      
   
        this.balanceZoneForm 
          .get("balance_zone_id")
          .setValue(object["balancing_zone"]);
          this.getVBP(object["balancing_zone"])

      }
    }
    this.vbtForm.controls['id'].disable();
  }

  constructor(
    private messageService : messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogVbtComponent>,
    private apiLogisticElement: LogisticElementService,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
    private apiBalanceRule: BalanceRuleService,
  ) {
    this.getcountries();
    this.getbalanceZones();
  }

  cancel() {
    this.ref.close();
  }
  add() {
    if (this.vbtForm.valid) {
      if (this.action == 'Add') {
        this.apiLogisticElement
          .addLogisticElement(this.vbtForm.value)
          .subscribe({
            next: (res) => {
              this.vbtForm.reset();
              this.ref.close('save');
              this.messageService.showToast('success','Success','LNG tank added successfully!!')
            },
            error: (e) => {
              if (e.error.title == 'Internal Server Error') {
                this.messageService.showToast('danger','Error','Internal server error while adding LNG tank')
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
      .updateLogisticElement(this.vbtForm.getRawValue())
      .subscribe({
        next: (res) => {
          this.vbtForm.reset();
          this.ref.close('update');
          this.messageService.showToast('success','Success','LNG tank updated successfully!!')
             
        },
        error: (e) => {
          if (e.error.title == 'Internal Server Error') {
            this.messageService.showToast('danger','Error','Internal server error while updating LNG tank')
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
  getBalanceRulesByType() {
    this.apiBalanceRule.getBalanceRuleByLogisticType('tank').subscribe({
      next: (res) => {
        this.ruleOptions = res;
      },
      error: (e) => {
        if (e.error.title == 'Internal Server Error') {
          this.messageService.showToast('danger','Error','Internal server error while getting balancing rules')
          } else {
            this.messageService.showToast('danger','Error',e.error);
     
          }
      },
    });
  }

  onChange($event) {
    this.vbpOptions = [];

    this.vbtForm.controls['parent_id'].setValue('');
    this.getVBP(this.balanceZoneForm.get('balance_zone_id').value);
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
          this.messageService.showToast('danger','Error','Internal server error while getting virtual balancing points')
          } else {
            this.messageService.showToast('danger','Error',e.error);
     
          }
      },
    });
  }
}
