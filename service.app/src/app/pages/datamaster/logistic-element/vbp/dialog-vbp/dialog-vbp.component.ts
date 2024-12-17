import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import * as moment from "moment";
import {
  FormGroup,
  FormBuilder,
  Validators,
  Form,
  FormControl,
} from "@angular/forms";
import { LogisticElementService } from "../../../../../@core/services/logisticElement.service";
import * as alertifyjs from "alertifyjs";
import { BalanceRuleService } from "../../../../../@core/services/balanceRule.service";
import { BalanceZoneService } from "../../../../../@core/services/balanceZone.service";
import { CountryService } from "../../../../../@core/services/country.service";
import { messageService } from "../../../../../@core/utils/messages";
import { formatDate } from "@angular/common";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { map } from "rxjs/operators";
import { LegalEntityService } from "../../../../../@core/services/legalEntity.service";
import { Observable, of } from "rxjs";
import { ContractsService } from "../../../../../@core/services/contracts.service";
import { DarkModeService } from "../../../../../@core/services/sharedServices/darkMode.service";
@Component({
  selector: "ngx-dialog-vbp",
  templateUrl: "./dialog-vbp.component.html",
  styleUrls: ["./dialog-vbp.component.scss"],
})
export class DialogVbpComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() id: number;
  @Input() name: string;
  // @Input() lose: number;
  @Input() country_code: string;
  @Input() balance_zone_id: number;
  @Input() linepack: number;
  @Input() eic: string;
  numeral = NumberColumnType.getNumeralInstance();
  maxId: number;
  vbpForm!: FormGroup;
  uncommittedForm!: FormGroup;
  linePackForm!: FormGroup;
  ruleOptions: any;
  countriesOptions: any;
  zoneOptions: any;
  errorBalanceZone: any;
  rowsUncommitted = [];
  columnsUncommitted: any[];
  rowsLinepack : any;
  columnsLinepack: any[];
  validateRevoGridLinepack: boolean = true;
  validateValueLinepack: boolean = true;
  validateDateLinepack: boolean = true;
  valuesParameters: any;
  valuesUncommitted: any;
  isDuplicateLinepack: boolean;
  validateRevoGridUncommitted: boolean = true;
  isDuplicateUncommitted: boolean;
  entitiesOptions: any;
  errorLegalEntity = false;
  filteredOptions$: Observable<string[]>;
  options: string[];
  labelEntity: any;
  contractOptions : any = [];
  errorContract = false;
  revogridTheme: string;
  settings =  { 
    singleSelection: true, 
    text:"",
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: true,
    badgeShowLimit: 2,
    maxHeight: 150,
    position:'bottom',
    autoPosition: false,
  
  };    

  ngOnInit(): void {
    this.darkModeService.isDarkMode == true
    ? (this.revogridTheme = "darkMaterial")
    : (this.revogridTheme = "material");
  this.darkModeService.darkModeChange.subscribe((value) => {
    value == true
      ? (this.revogridTheme = "darkMaterial")
      : (this.revogridTheme = "material");
  });
    this.vbpForm = this.formBuilder.group({
      id: new FormControl(),
      name: new FormControl("", Validators.required),
      /*    losses_vp: new FormControl("", [
        Validators.required,
        Validators.pattern(/^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/),
        Validators.min(0),
        Validators.max(100),
      ]), */
      type: new FormControl(""),
      balance_zone_id: new FormControl("", Validators.required),
      country_code: new FormControl("", Validators.required),
      eic: new FormControl(""),
      /*    rule_id: new FormControl([],
      Validators.required

    ) */
    });
    this.uncommittedForm = this.formBuilder.group({
      owner_id: new FormControl("", Validators.required),
      contract_code: new FormControl("", Validators.required),
    });
    this.linePackForm = this.formBuilder.group({
      owner_id: new FormControl("", Validators.required),

    });
    this.columnsLinepack = [
      {
        prop: "legal_entity",
        name: "Legal Entity",
        size: 150,
        readonly: true,
      },
      {
        name: "Start Date (YYYY-MM-DD)",
        prop: "start_date",
        size: 150,
        readonly: true,
      },
      {
        name: "Value",
        prop: "value",
        columnType: "numeric",
        size: 150,
        readonly: true,
        cellProperties: ({ prop, model, data, column }) => {
          return {
            class: {
              numeric: true,
            },
          };
        },
      },
      {
        size: 80,
        readonly: true,
        cellTemplate: (createElement, props) => {
          return createElement(
            "button",
            {
              onClick: () => this.doDeleteLinepack(props.rowIndex),
              class: {
                "btn-delete": true,
              },
            },
            "DELETE"
          );
        },
      },
    ];

    document.querySelectorAll("revo-grid").forEach((element) => {
      if (element.id == "linepack") {
        element.source = this.rowsLinepack;
        element.useClipboard = false;
      }
    });
    this.columnsUncommitted = [
      /*    {
        name: "Start Date (YYYY-MM-DD)",
        prop: "start_date",
        size: 150,
      }, */
      {
        prop: "legal_entity",
        name: "Legal Entity",
        size: 150,
        readonly: true,
      },
      {
        prop: "contract_label",
        name: "Contract Code",
        size: 150,
        readonly: true,
      },
      /*   {
        name: "Value",
        prop: "value",
        columnType: "numeric",
        size: 150,
        cellProperties: ({ prop, model, data, column }) => {
          return {
            class: {
              numeric: true,
            },
          };
        }
      },  */
      {
        size: 80,
        readonly: true,
        cellTemplate: (createElement, props) => {
          return createElement(
            "button",
            {
              onClick: () => this.doDeleteUncommitted(props.rowIndex),
              class: {
                "btn-delete": true,
              },
            },
            "DELETE"
          );
        },
      },
    ];

    document.querySelectorAll("revo-grid").forEach((element) => {
      if (element.id == "uncommitted") {
        element.source = this.rowsUncommitted;
        element.useClipboard = false;
      }
    });

    if (this.action == "Update") {
      this.vbpForm.controls["id"].setValue(this.id);
      this.vbpForm.controls["id"].disable();
      this.vbpForm.controls["name"].setValue(this.name);
      // this.vbpForm.controls["losses_vp"].setValue(this.numeral(this.lose).format('0,0.[0000000000]'));
      this.vbpForm.controls["type"].setValue("virtual_balancing_point");
      this.vbpForm.controls["country_code"].setValue(this.country_code);

      this.vbpForm.controls["eic"].setValue(this.eic);
      this.getbalanceZones(this.country_code);
   
      this.getValuesUncommitted(this.id);
      this.vbpForm.controls["balance_zone_id"].setValue(this.balance_zone_id);



    } else if (this.action == "Add") {
      // this.getId();
      this.vbpForm.controls["id"].disable();
      this.vbpForm.controls["type"].setValue("virtual_balancing_point");
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object= JSON.parse(localStorage.getItem('settings_parameters'));
        this.vbpForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.getbalanceZones(object["country_code"]);
        this.vbpForm
          .get("balance_zone_id")
          .setValue(object["balancing_zone"]);

      }
    }
    this.vbpForm.controls["id"].disable();

  }

  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogVbpComponent>,
    private apiLogisticElement: LogisticElementService,
    private apiBalanceRule: BalanceRuleService,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
    private apiLegalEntity: LegalEntityService,
    private apiContract: ContractsService,
    private darkModeService: DarkModeService
  ) {
    this.getcountries();
    this.getLegalEntities();

  }

  cancel() {
    this.ref.close();
  }
  add() {
    if (this.vbpForm.valid) {
      /*    this.vbpForm.controls["losses_vp"].clearValidators();
      this.vbpForm.controls["losses_vp"].setValue(Number(this.vbpForm.get("losses_vp").value.toString().replace(/\./g, "").replace(",", ".")));
      this.vbpForm.controls["losses_vp"].setValue(
        this.vbpForm.get("losses_vp").value / 100
      );
      this.vbpForm.controls["losses_vp"].clearValidators() */

      if (this.action == "Add") {
        this.apiLogisticElement
          .addLogisticElement(this.vbpForm.value)
          .subscribe({
            next: (res) => {
              this.messageService.showToast(
                "success",
                "Success",
                "Virtual balancing point added successfully!"
              );

              document.querySelectorAll("revo-grid").forEach((element) => {
                if (element.id == "uncommitted") {
                  element
                    .getSource()
                    .then((value) => {
                      this.valuesUncommitted= value;
                      this.valuesUncommitted.map((data) => {
                        data["value"] = Number(
                          data["value"]
                            .toString()
                            .replace(/\./g, "")
                            .replace(",", ".")
                        );
                      
                        return data;
                      });

                    })
                    .then((v) => {
                      this.setValuesUncommitted(
                        res.id,
                        this.valuesUncommitted,
                        "Added"
                      );
                    });
                }
              });
            },
            error: (e) => {
              if (e.error.title == "Internal Server Error") {
                this.messageService.showToast(
                  "danger",
                  "Error",
                  "Internal server error while adding virtual balancing point"
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
   
    document.querySelectorAll("revo-grid").forEach((element) => {
      if(element.id=='uncommitted'){
        element.getSource().then((value) => {
          this.valuesUncommitted = value;
  
         /*  this.valuesUncommitted.map((data) => {
            data["value"] = Number(
              data["value"].toString().replace(/\./g, "").replace(",", ".")
            );
          
            return data;
          }); */
        });
      }
     
    });

    this.apiLogisticElement
      .updateLogisticElement(this.vbpForm.getRawValue())
      .subscribe({
        next: (res) => {
         // this.setValuesLinePack(res.id, this.valuesParameters, "Updated");
          this.setValuesUncommitted(res.id, this.valuesUncommitted, "Updated");
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while updating balaning point"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
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
            "Internal server error while getting balancing zones"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
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
  onChange($event) {
    this.zoneOptions = [];
    this.vbpForm.controls["balance_zone_id"].setValue("");

   // this.linePackForm.get('owner_id').setValue("");
    this.getbalanceZones(this.vbpForm.get("country_code").value);

  }
  doDeleteLinepack(rowIndex) {
    this.rowsLinepack.splice(rowIndex, 1);
    document.querySelectorAll("revo-grid").forEach((element) => {
      if (element.id == "linepack") {
        element.source = [];
        element.source = this.rowsLinepack;
      }
    });
    document.querySelectorAll("revo-grid").forEach((element) => {
      if (element.id == "linepack") {
        element.getSource().then((value) => {
          var valueArr = value.map(function (item) {
            return item.start_date;
          });
          this.isDuplicateLinepack = valueArr.some(function (item, idx) {
            return valueArr.indexOf(item) != idx;
          });
        });
      }
    });
  }
  doDeleteUncommitted(rowIndex) {
    this.rowsUncommitted.splice(rowIndex, 1);
    document.querySelectorAll("revo-grid").forEach((element) => {
      if (element.id == "uncommitted") {
        element.source = [];
        element.source = this.rowsUncommitted;
      }
    });
    document.querySelectorAll("revo-grid").forEach((element) => {
      if (element.id ==  "uncommitted") {
        element.getSource().then((value) => {
          var valueArr = value.map(function (item) {
            return item.contract_label;
          });
          this.isDuplicateUncommitted= valueArr.some(function (item, idx) {
            return valueArr.indexOf(item) != idx;
          });
        });
      }
    });
  }

  addRowLinepack() {
    this.rowsLinepack.push({
      start_date: formatDate(new Date(), "yyyy-MM-dd", "en-US"),
      value: 0,
    });
    document.querySelectorAll("revo-grid").forEach((element)=>{
      if(element.id == 'linepack'){
        element.source=[];
        element.source=this.rowsLinepack;
        element.getSource()
        .then((value) => {
          var valueArr = value.map(function (item) {
            return item.start_date;
          });
          this.isDuplicateLinepack = valueArr.some(function (item, idx) {
            return valueArr.indexOf(item) != idx;
          });
        });
      }
     
    })

     
  }
  onAfterEditLinepack({ detail }) {
    document
      .querySelector("revo-grid")
      .getSource()
      .then((value) => {
        var valueArr = value.map(function (item) {
          return item.start_date;
        });
        this.isDuplicateLinepack = valueArr.some(function (item, idx) {
          return valueArr.indexOf(item) != idx;
        });
      });
  }
  onBeforeEditLinepack({ detail }, e) {
    if (detail.prop == "value") {
      if (
        isNaN(
          Number(detail.val.toString().replace(/\./g, "").replace(",", "."))
        )
      ) {
        this.validateValueLinepack = false;
        e.preventDefault();
      } else {
        this.validateValueLinepack = true;
      }
    }

    if (detail.prop == "start_date") {
      if (moment(detail.val, "yyyy-MM-dd").isValid() == true) {
        this.validateDateLinepack = true;
      } else {
        e.preventDefault();
        this.validateDateLinepack = false;
      }
    }

    if (
      this.validateDateLinepack == true &&
      this.validateValueLinepack == true
    ) {
      this.validateRevoGridLinepack = true;
    } else {
      this.validateRevoGridLinepack = false;
    }
  }
  /* getValuesLinePack(id,owner) {
    this.apiLogisticElement
      .getLinepackValues(id,owner)
      .pipe(
        map((data) => {
          return data.map((x, index) => {
            x["value"] = this.numeral(x["value"]).format("0,0.[0000000000]");
            return x;
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.rowsLinepack = res;
          document.querySelectorAll("revo-grid").forEach((element) => {
            if (element.id == "linepack") {
              element.source = this.rowsLinepack;
              element.useClipboard = false;
            }
          });
        },
        error: (e) => {
          this.rowsLinepack==null;
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting linepack parameters"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          } 
        },
      });

  } */
 /*  setValuesLinePack(id, values, message) {
    this.apiLogisticElement.setLinepackValues(id, values).subscribe({
      next: (res) => {
        this.messageService.showToast(
          "success",
          "Success",
          "Virtual balancing point " + message + " successfully!"
        );
        this.vbpForm.reset();
        if (message == "Added") {
          this.ref.close("save");
        } else {
          this.ref.close("update");
        }
      },
      error: (e) => {
        this.ref.close("update");
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while setting linepack parameters"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  } */

  onBeforeEditUncommitted({ detail }, e) {}

  onAfterEditUncommitted($event) {}
  getContractsLabels(ownerId) {
    this.apiContract
      .getUncommittedContracts(ownerId)
      .subscribe({
        next: (res) => {
          this.contractOptions = res;
          this.contractOptions.map((x)=>{
            x['itemName']=x['label']
            x['id']=x['label']
          })
          if (this.contractOptions.length == 0) {
            this.errorContract = true;
          } else {
            this.errorContract  = false;
          }
        },
        error: (e) => {
          this.errorContract  = true;
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting gas swap contracts"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
    
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
 
  onChangeOwner($event) {
    this.uncommittedForm.get("contract_code").setValue("");
    var owner = this.uncommittedForm.get("owner_id").value;
    if (owner) {
      this.getContractsLabels(owner);
    }
    let selectedValue = this.entitiesOptions.find((item) => item.id === $event);

    this.labelEntity = selectedValue.name;

    if (this.labelEntity === undefined) {
      this.labelEntity = selectedValue.label;
    }
  }
 /*  onChangeOwner2($event) {
    this.getValuesLinePack(this.id,$event);
  } */
  addRowUncommitted() {
    var contractLabel;
   this.uncommittedForm.get("contract_code").value.map((x)=>{
    contractLabel = x['id'];
   })
    this.rowsUncommitted.push({
      legal_entity_id: this.uncommittedForm.get("owner_id").value,
      contract_label: contractLabel,
      legal_entity: this.labelEntity,
    
    });
    document.querySelectorAll("revo-grid").forEach((element) => {
      if (element.id == "uncommitted") {
        element.source = [];
        element.source = this.rowsUncommitted;
        element.getSource()
        .then((value) => {
          var valueArr = value.map(function (item) {

            return item.contract_label;
          });
          this.isDuplicateUncommitted= valueArr.some(function (item, idx) {
            return valueArr.indexOf(item) != idx;
          });
        });
      }
    });

  }
  setValuesUncommitted(logistic_element_id, values, message) {

    this.apiContract.setUncommittedContractsEntity(logistic_element_id,values).subscribe({
      next: (res) => {
        this.messageService.showToast(
          "success",
          "Success",
          "Virtual balancing point " + message + " successfully!"
        );
        this.vbpForm.reset();
        if (message == "Added") {
          this.ref.close("save");
        } else {
          this.ref.close("update");
        }
      },
      error: (e) => {
        this.ref.close("update");
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while setting uncommitted parameters"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  getValuesUncommitted(id) {
    this.apiContract.getUncommittedContractsEntity(id)
      .pipe(
        map((data) => {

          return data.map((x, index) => {
         //   x["value"] = this.numeral(x["value"]).format("0,0.[0000000000]");
            return x;
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.rowsUncommitted = res;
          document.querySelectorAll("revo-grid").forEach((element) => {
            if (element.id == "uncommitted") {
              element.source = this.rowsUncommitted;
              element.useClipboard = false;
            }
          });
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting uncommitted parameters"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }
}
