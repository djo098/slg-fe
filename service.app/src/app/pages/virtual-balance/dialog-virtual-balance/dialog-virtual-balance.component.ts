import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { CountryService } from "../../../@core/services/country.service";
import { DualListComponent } from "../../dual-list/dual-list.component";
import { messageService } from "../../../@core/utils/messages";
import { BalanceService } from "../../../@core/services/balance.service";
import { BalanceZoneService } from "../../../@core/services/balanceZone.service";
import * as moment from "moment";
import { DatePipe, formatNumber } from "@angular/common";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { ConnectionPointService } from "../../../@core/services/connectionPoint.service";
import { LegalEntityService } from "../../../@core/services/legalEntity.service";

import { ContractsService } from "../../../@core/services/contracts.service";
import { LogisticElementService } from "../../../@core/services/logisticElement.service";
import { ThirdPartyContractsService } from "../../../@core/services/thirdPartyContracts.service";

@Component({
  selector: "ngx-dialog-virtual-balance",
  templateUrl: "./dialog-virtual-balance.component.html",
  styleUrls: ["./dialog-virtual-balance.component.scss"],
})
export class DialogVirtualBalanceComponent implements OnInit {
  displayedColumns: string[] = ["position", "name", "weight", "symbol"];
  displayedColumnsNames: string[] = ["No.", "Name", "Weight", "Symbol"];
  validateEmptyConfirmedColumns = true;
  @Input() title: string;
  @Input() action: string;
  @Input() country: string;
  @Input() balance_zone: string;
  @Input() legal_entity: string;
  @Input() connection_point: string;
  @Input() label: string;
  @Input() id: number;
  overseasTradingPointsOptions: any;
  errorOverseaTradingPoint: boolean;
  selectedOverseaTradingPoint: any;
  logisticContractsOptions: any = [];
  logisticElementsOptions: any = [];
  loading_array: any = [];
  constructor(
    protected ref: NbDialogRef<DialogVirtualBalanceComponent>,
    private apiCountry: CountryService,
    private messageService: messageService,
    private apiBalanceZone: BalanceZoneService,
    private formBuilder: FormBuilder,
    private apiConnectionPoint: ConnectionPointService,
    private apiLegalEntity: LegalEntityService,
    private apiBalance: BalanceService,
    private apiContracts: ContractsService,
    private apiLogisticElements: LogisticElementService,
    public datepipe: DatePipe,
    private apiThirdPartyContract: ThirdPartyContractsService
  ) {
    this.getcountries();
    this.getLegalEntities();
    this.getOverseasTradingPoints();
    this.intervalID = setInterval(() => {
      this.validateColumns();
    }, 1 * 1000);
  }

  settings = {
    singleSelection: false,
    text: "",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    enableSearchFilter: true,
    badgeShowLimit: 2,
  };
  tab = 1;
  keepSorted = true;
  key: string;
  display: string;
  filter = true;
  source: Array<any> = [];
  confirmed: Array<any>;
  userAdd = "";
  disabled = false;
  connectionPointOptions = [];
  selectedConnectionPoints = [];
  errorConnectionPoints = false;
  sourceLeft = true;
  errorDateRange = false;
  countriesOptions: any;
  zoneOptions: any;
  errorBalanceZone = false;
  virtualBalanceForm!: FormGroup;
  entitiesOptions: any;
  errorLegalEntity = false;
  intervalID: any;
  format: any = DualListComponent.DEFAULT_FORMAT;
  private sourceStations: Array<any>;
  private confirmedStations: Array<any>;
  loading = false;

  private stations: Array<any> = ["Date", "TVB", , "ASS"];

  ngOnInit() {
    this.key = "id";
    this.display = "label";
    this.keepSorted = false;
    this.virtualBalanceForm = this.formBuilder.group({
      id: new FormControl(""),
      balance_zone_id: new FormControl("", [Validators.required]),
      /*    connection_point: new FormControl("", [Validators.required]), */
      country_code: new FormControl("", [Validators.required]),
      label: new FormControl("", [Validators.required]),
      entity_id: new FormControl("", [Validators.required]),
      date: new FormControl("", [Validators.required, this.dateRangeValidator]),
      oversea_trading_point_id: new FormControl("", ),
    });

    if (this.action == "Update") {
      this.virtualBalanceForm
        .get("balance_zone_id")
        .setValue(this.balance_zone);
      /*    this.virtualBalanceForm.get('connection_point').setValue(this.connection_point); */
      this.virtualBalanceForm.get("country_code").setValue(this.country);
      this.virtualBalanceForm.get("label").setValue(this.label);
      this.virtualBalanceForm
        .get("legal_entity_id")
        .setValue(this.legal_entity);
      this.virtualBalanceForm.get("id").setValue(this.id);
      this.getLogisticContracts(this.id);
      this.getbalanceZones(this.country);
    } else if (this.action == "Add") {
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object = JSON.parse(localStorage.getItem("settings_parameters"));
        this.virtualBalanceForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.getbalanceZones(object["country_code"]);
        this.virtualBalanceForm
          .get("balance_zone_id")
          .setValue(object["balancing_zone"]);
        this.getConnectionPoints(object["balancing_zone"]);
        /*         this.getLogisticElements(object["balancing_zone"]); */
      }
    }

    this.virtualBalanceForm.get("id").disable();
  }
  ngOnDestroy() {
    clearInterval(this.intervalID);
  }
  private dateRangeValidator: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date =
      this.virtualBalanceForm && this.virtualBalanceForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.virtualBalanceForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.virtualBalanceForm.get("date").value.end,
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
  getLogisticContracts(owner_id) {
    this.loading=true;
    this.loading_array[0]=true;
    
    this.apiContracts
      .getLogisticContractLabels(owner_id)
      .subscribe({
        next: (res) => {
          
          this.source.push({
            name: "Logistic Contracts",
            type: "logistic",
            elements: res,
            confirmed: [],
          });
          this.source.map((x, index) => {
            if (index == 0) {
              x["active"] = true;
            } else {
              x["active"] = false;
            }
          });
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
      })
      .add(() => {
      this.loading_array[0]=false;
        if(this.loading_array.includes(true)==false){
          this.loading=false
          this.loading_array=[];
        }
      });
  }
  getVirtualogisticContracts() {
    this.loading=true;
    this.loading_array[1]=true;
    this.apiContracts
      .getAllLogisticContractsVirtualLabels()
      .subscribe({
        next: (res) => {

           this.source.push({
            name: "Virtual Logistic Contracts",
            type: "logistic_virtual",
            elements: res,
            confirmed: [],
          });
          this.source.map((x, index) => {
            if (index == 0) {
              x["active"] = true;
            } else {
              x["active"] = false;
            }
          }); 
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
      })
      .add(() => {  this.loading_array[1]=false;
        if(this.loading_array.includes(true)==false){
          this.loading=false
          this.loading_array=[];
        }});
  }
  /*  getLogisticElements(balance_zone) {
    this.apiLogisticElements
      .getLogisticElementByTypeBalanceZone(
        balance_zone,
        "virtual_balancing_point"
      )
      .subscribe({
        next: (res) => {

          this.source.push({
            name: "Virtual Balancig Point",
            type: "logistic_element",
            elements: res.map((x) => {
              x["label"] = x["name"];
              return x;
            }),
            confirmed: [],
          });
          this.source.map((x, index) => {
            if (index == 0) {
              x["active"] = true;
            } else {
              x["active"] = false;
            }
          });
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
      })
      .add(() =>

    this.apiLogisticElements
      .getLogisticElementByTypeBalanceZone(balance_zone, "tank")
      .subscribe({
        next: (res) => {

          this.source.push({
            name: "LNG Tank",
            type: "logistic_element",
            elements: res.map((x) => {
              x["label"] = x["name"];
              return x;
            }),
            confirmed: [],
          });
          this.source.map((x, index) => {
            if (index == 0) {
              x["active"] = true;
            } else {
              x["active"] = false;
            }
          });
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
    this.apiLogisticElements
      .getLogisticElementByTypeBalanceZone(balance_zone, "underground_storage")
      .subscribe({
        next: (res) => {

          this.source.push({
            name: "Underground Storage",
            type: "logistic_element",
            elements: res.map((x) => {
              x["label"] = x["name"];
              return x;
            }),
            confirmed: [],
          });
          this.source.map((x, index) => {
            if (index == 0) {
              x["active"] = true;
            } else {
              x["active"] = false;
            }
          });
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
    this.apiLogisticElements
      .getLogisticElementByTypeBalanceZone(balance_zone, "regasification_plant")
      .subscribe({
        next: (res) => {

          this.source.push({
            name: "Regasification plant",
            type: "logistic_element",
            elements: res.map((x) => {
              x["label"] = x["name"];
              return x;
            }),
            confirmed: [],
          });
          this.source.map((x, index) => {
            if (index == 0) {
              x["active"] = true;
            } else {
              x["active"] = false;
            }
          });
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
  } */

  filterBtn() {
    return this.filter ? "Hide Filter" : "Show Filter";
  }

  doDisable() {
    this.disabled = !this.disabled;
  }

  disableBtn() {
    return this.disabled ? "Enable" : "Disabled";
  }
  swapDirection() {
    this.sourceLeft = !this.sourceLeft;
    this.format.direction = this.sourceLeft
      ? DualListComponent.LTR
      : DualListComponent.RTL;
  }
  cancel() {

    this.ref.close();
    clearInterval(this.intervalID);
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
  getConnectionPoints(zone) {
    this.apiConnectionPoint
      .getConnectionPointByTypeBalanceZone(zone, null)
      .subscribe({
        next: (res) => {
          this.connectionPointOptions = res;
          this.connectionPointOptions.map((x) => {
            x["itemName"] = x["name"];
          });

          if (this.connectionPointOptions.length == 0) {
            this.errorConnectionPoints = true;
          } else {
            this.errorConnectionPoints = false;
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
  onChangeCountry($event) {
    this.virtualBalanceForm.controls["balance_zone_id"].setValue("");
    this.getbalanceZones(this.virtualBalanceForm.get("country_code").value);
  }
  onChangeZone($event) {
    /*     var others_temp = [];
    this.source.map((x, index) => {
      if (x.type != "logistic_element") {
    
        others_temp.push(x);
      }
      return x;
    }); */
    /*  this.source = []; */
    /*     this.getConnectionPoints($event); */
    /*     this.getLogisticElements($event); */
    /*    others_temp.map((x) => {
      this.source.push(x);
    }); */
    /*  this.source.map((x, index) => {
      if (index == 0) {
        x["active"] = true;
      } else {
        x["active"] = false;
      }
    }); */
    /*     this.source.push(logistic_contracts_temp) */
  }
  onChangeEntity($event) {
    /*  var others_temp = [];
    this.source.map((x, index) => {
      if (x.type != "contracts") {
    
        others_temp.push(x);
      }
      return x;
    }); */
    this.source = [];
    this.getLogisticContracts($event);
    this.getPurchaseSalesContracts($event);
    this.getExchanges($event);
    this.getVirtualExchanges();
    this.getVirtualPurchaseSalesContracts();
    this.getVirtualogisticContracts();
    /*     this.source.map((x, index) => {
      if (index == 0) {
        x["active"] = true;
      } else {
        x["active"] = false;
      }
    });  */
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

  add() {
    this.loading == true;
    if (this.virtualBalanceForm.valid) {
      var object = {
        id: this.virtualBalanceForm.get("id").value
          ? this.virtualBalanceForm.get("id").value
          : null,
        start_date: this.datepipe.transform(
          this.virtualBalanceForm.get("date").value.start,
          "yyyy-MM-dd"
        ),
        end_date: this.datepipe.transform(
          this.virtualBalanceForm.get("date").value.end,
          "yyyy-MM-dd"
        ),
        label: this.virtualBalanceForm.get("label").value,
        balance_zone_id: this.virtualBalanceForm.get("balance_zone_id").value,
        entity_id: this.virtualBalanceForm.get("entity_id").value,
        contracts: this.source.map((x) => {
          var ids = [];
          x["confirmed"].map((j) => {
            ids.push(j['id']);
          });
          x["contract_ids"] = ids;
          delete x["confirmed"];
          delete x["elements"];
          delete x["name"];
          delete x["active"];
          return x;
        }),
      };
    
        if (this.action == "Add") {
        this.apiBalance
          .createVirtualBalance(this.clean(object))
          .subscribe({
            next: (res) => {
        
           
              this.ref.close("save");
            },
            error: (e) => {
              this.loading = false;
              if (e.error.title == "Internal Server Error") {
                this.messageService.showToast(
                  "danger",
                  "Error",
                  "Internal server error while adding virtual balance"
                );
              } else {
                this.messageService.showToast("danger", "Error", e.error);
              }
              this.ref.close("save");
            },
          });
      } else if (this.action == "Update") {
        this.update();
      } 
    }
    clearInterval(this.intervalID);
  }
  update() {
    /*    this.apiBalance
      .updateBalanceLayoutConfiguration(
        this.virtualBalanceForm.getRawValue()
      )
      .subscribe({
        next: (res) => {
          this.apiBalance.setBalanceLayoutCols(res.id, this.source).subscribe({
            next: (res) => {
              this.messageService.showToast(
                "success",
                "Success",
                "Virtual balance configuration updated successfully!"
              );
              this.ref.close("update");
              this.loading = false;
            },
            error: (e) => {
              this.loading = false;
              if (e.error.title == "Internal Server Error") {
                this.messageService.showToast(
                  "danger",
                  "Error",
                  "Internal server error while balance virtual balance"
                );
              } else {
                this.messageService.showToast("danger", "Error", e.error);
              }
              this.ref.close("update");
            },
          });
          this.ref.close("update");
        },
        error: (e) => {
          this.loading = false;
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while updating balance virtual balance"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
          this.ref.close("update");
        },
      });
    clearInterval(this.intervalID); */
  }
  validateColumns() {
    var nulls = [];
    this.source?.map((x) => {
      if (x["confirmed"]?.length == 0) {
        nulls.push(false);
      } else {
        nulls.push(true);
      }
    });
    if (nulls.includes(true)) {
      this.validateEmptyConfirmedColumns = true;
    } else {
      this.validateEmptyConfirmedColumns = false;
    }
  }
  getExchanges(owner) {
    this.loading=true;
    this.loading_array[2]=true;
    this.apiThirdPartyContract
      .getGasSwapContractsLabels(owner)
      .subscribe({
        next: (res) => {

          this.source.push({
            name: "Swaps Contracts",
            type: "third_party_swap",
            elements: res,
            confirmed: [],
          });
          this.source.map((x, index) => {
            x["elements"].map((j) => {
              j["label"] = j["swap_code"];
            });
            if (index == 0) {
              x["active"] = true;
            } else {
              x["active"] = false;
            }
          });
        },
        error: (e) => {
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

      .add(() => {  this.loading_array[2]=false;
        if(this.loading_array.includes(true)==false){
          this.loading=false
          this.loading_array=[];
        }});
  }
  getVirtualExchanges() {
    this.loading=true;
    this.loading_array[3]=true;

    this.apiThirdPartyContract
      .getThirdPartyContractsVirtualLabels("third_party_swap")
      .subscribe({
        next: (res) => {

          this.source.push({
            name: "Virtual Swaps Contracts",
            type: "third_party_swap_virtual",
            elements: res,
            confirmed: [],
          });
          this.source.map((x, index) => {
            if (index == 0) {
              x["active"] = true;
            } else {
              x["active"] = false;
            }
          });
        },
        error: (e) => {
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

      .add(() => {  this.loading_array[3]=false;
        if(this.loading_array.includes(true)==false){
          this.loading=false
          this.loading_array=[];
        }});
  }
  getPurchaseSalesContracts(owner) {
    this.loading=true;
    this.loading_array[4]=true;
    this.apiThirdPartyContract
      .getPurchasesSalesContractsLabels(owner)
      .subscribe({
        next: (res) => {
          this.source.push({
            name: "Purchase/Sales Contracts",
            type: "third_party_purchase_sale",
            elements: res,
            confirmed: [],
          });
          this.source.map((x, index) => {
            if (index == 0) {
              x["active"] = true;
            } else {
              x["active"] = false;
            }
          });
        },
        error: (e) => {
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
      .add(() => {  this.loading_array[4]=false;
        if(this.loading_array.includes(true)==false){
          this.loading=false
          this.loading_array=[];
        }});
  }
  getVirtualPurchaseSalesContracts() {
    this.loading=true;
    this.loading_array[5]=true;
    this.apiThirdPartyContract
      .getThirdPartyContractsVirtualLabels("third_party_purchase_sale")
      .subscribe({
        next: (res) => {
          this.source.push({
            name: "Virtual Purchase/Sales Contracts",
            type: "third_party_purchase_sale_virtual",
            elements: res,
            confirmed: [],
          });
          this.source.map((x, index) => {
            if (index == 0) {
              x["active"] = true;
            } else {
              x["active"] = false;
            }
          });
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting virtual purchase/sale contracts"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {  this.loading_array[5]=false;
        if(this.loading_array.includes(true)==false){
          this.loading=false
          this.loading_array=[];
        }});
  }
  getOverseasTradingPoints() {
    this.apiLogisticElements
      .getLogisticElementByType("overseas_transaction_point", true)
      .subscribe({
        next: (res) => {
          this.overseasTradingPointsOptions = res;
          if (this.overseasTradingPointsOptions.length == 0) {
            this.errorOverseaTradingPoint = true;
          } else {
            this.errorOverseaTradingPoint = false;
          }
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting overseas trading points"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        var options_temp = [];
        this.overseasTradingPointsOptions.map((x) => {
          options_temp.push({ itemName: x["name"], id: x["id"] });
          return x;
        });
        this.overseasTradingPointsOptions = [];
        this.overseasTradingPointsOptions = options_temp;
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
