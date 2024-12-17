import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { FormGroup, FormBuilder, Validators, Form, FormControl } from '@angular/forms';
import { CountryService } from '../../../../@core/services/country.service';
import { BalanceRuleService } from '../../../../@core/services/balanceRule.service';
import { BalanceRuleParameterService } from '../../../../@core/services/balanceRuleParameter.service';
import { formatDate } from '@angular/common';
import * as alertifyjs from 'alertifyjs';
@Component({
  selector: 'ngx-dialog-rule',
  templateUrl: './dialog-rule.component.html',
  styleUrls: ['./dialog-rule.component.scss'],
})
export class DialogRuleComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() label: string;
  @Input() min: string;
  @Input() max: string;
  @Input() startDate: string;


  balanceRuleForm !: FormGroup;
  paramsOptions: any;

  ngOnInit(): void {
    this.balanceRuleForm = this.formBuilder.group({

      label: new FormControl('',
        Validators.required,

      ),
      start_date: new FormControl('', [
        Validators.required,

      ]),
      min_value_id: new FormControl('', [
        Validators.required,

      ]),
      max_value_id: new FormControl('', [
        Validators.required,

      ]),


    });
    if (this.action == 'Update') {
      this.balanceRuleForm.controls['label'].setValue(this.label);
      this.balanceRuleForm.controls['label'].disable();
      this.balanceRuleForm.controls['start_date'].setValue(formatDate(new Date(this.startDate), 'yyyy-MM-dd', 'en'));
      this.balanceRuleForm.controls['min_value_id'].setValue(this.min);
      this.balanceRuleForm.controls['max_value_id'].setValue(this.max);
    }



  }


  constructor(private formBuilder: FormBuilder, protected ref: NbDialogRef<DialogRuleComponent>, private apiBalanceRule: BalanceRuleService, private apiBalanceRuleParameter: BalanceRuleParameterService) {
    this.getBalanceRuleParameters();
  }

  cancel() {
    this.ref.close();
  }
  add() {
    if (this.balanceRuleForm.valid) {
      if (this.action == 'Add') {
        this.apiBalanceRule.addBalanceRule(this.balanceRuleForm.value).subscribe({
          next: (res) => {
            alertifyjs.success('Balance Rule added successfully!');
            this.balanceRuleForm.reset();
            this.ref.close('save');
          },
          error: (e) => {
            if (e.error.title == 'Internal Server Error') {
              alertifyjs.error('Internal Server Error');
              } else {
                alertifyjs.error(e.error);
              }
          },
        });
      } else {
        this.update();
      }
    }

  }

  update() {
    const data = { label: 'rule 7', start_date: '2008-01-01 10:00:00', min_value_id: 1, max_value_id: 2, logistic_element_id: 1 };

    this.apiBalanceRule.updateBalanceRule(data).subscribe({
      next: (res) => {
        alertifyjs.error('Balance Rule updated successfully!');
        this.balanceRuleForm.reset();
        this.ref.close('update');
      },
      error: (e) => {
        if (e.error.title == 'Internal Server Error') {
          alertifyjs.error('Internal Server Error');
          } else {
            alertifyjs.error(e.error);
          }
      },
    });
  }

  getBalanceRuleParameters() {
    this.apiBalanceRuleParameter.getBalanceRuleParameters()
      .subscribe({
        next: (res) => {


          this.paramsOptions = res;



        },
        error: (e) => {
          alert(e.error);
        },
      });
  }
}
