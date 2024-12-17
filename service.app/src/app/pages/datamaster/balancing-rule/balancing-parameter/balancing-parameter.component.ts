import { Component, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { LocalDataSource } from 'ng2-smart-table';
import {ExcelService} from '../../../../@core/services/sharedServices/excel.service';


import {  DialogRuleComponent } from '.././dialog-rule/dialog-rule.component';
import { BalanceRuleService } from '../../../../@core/services/balanceRule.service';
import { BalanceRuleParameterService } from '../../../../@core/services/balanceRuleParameter.service';
import { DialogParameterComponent } from '.././dialog-parameter/dialog-parameter.component';
import * as alertifyjs from 'alertifyjs';

@Component({
  selector: 'ngx-balancing-parameter',
  templateUrl: './balancing-parameter.component.html',
  styleUrls: ['./balancing-parameter.component.scss'],
})
export class BalancingParameterComponent implements OnInit {

  defaultRowPerPage = 10;
  dataExport: any[];
  ngOnInit(): void {
  }
  settings = {
    mode: 'external',
    actions: {
      add: false,
      edit: true,
      delete: false,
    },
    add: {
      addButtonContent: '<i class="nb-plus"></i>',

    },
    edit: {
      editButtonContent: '<i class="fas fa-pen fa-xs" title="Edit"></i>',

    },

    columns: {
      id: {
        title: 'Id',
        type: 'number',
      },
      label: {
        title: 'Label',
        type: 'string',
      },
      value: {
        title: 'Value',
        type: 'number',
      },
    },
    pager: {
      display: true,
      perPage: this.defaultRowPerPage,
    },
    attr: {
      class: 'table',
    },
  };

  source: LocalDataSource = new LocalDataSource();


  constructor(private dialogService: NbDialogService, private excelService: ExcelService, private apiBalanceRule: BalanceRuleService, private apiBalanceRuleParameter: BalanceRuleParameterService) {

this.getBalanceRuleParameters();

  }


  getBalanceRuleParameters() {
    this.apiBalanceRuleParameter.getBalanceRuleParameters()
      .subscribe({
       next: (res) => {


         const data = res;

         this.source.load(data);


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

  onEdit($event) {

    this.dialogService.open(DialogParameterComponent, {
      context: {
        title: 'Edit Parameter',
        id: $event.data.id,
        label: $event.data.label,
        action: 'Update',
      },
    }).onClose.subscribe(val => {
      if (val === 'update') {
        this.getBalanceRuleParameters();
      }
    });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);

  }
  onAdd($event) {

      this.dialogService.open(DialogParameterComponent, {
        context: {
          title: 'New Parameter',
          action: 'Add',

        },
        autoFocus: false,
      }).onClose.subscribe(val => {
        if (val === 'save') {
          this.getBalanceRuleParameters();
        }
      });



  }
  exportAsXLSX() {
    this.source.getFilteredAndSorted().then((value) => {

      this.excelService.exportAsExcelFile(value , 'Rule Parameters');
    }).catch((e) => {
      alertifyjs.error(e);
  });

 }






}
