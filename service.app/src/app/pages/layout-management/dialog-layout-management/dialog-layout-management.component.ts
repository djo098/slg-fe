import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { CountryService } from "../../../@core/services/country.service";
import { DualListComponent } from "../../dual-list/dual-list.component";
import { messageService } from "../../../@core/utils/messages";
import { BalanceService } from "../../../@core/services/balance.service";
import { BalanceZoneService } from "../../../@core/services/balanceZone.service";

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ConnectionPointService } from "../../../@core/services/connectionPoint.service";
import { LegalEntityService } from "../../../@core/services/legalEntity.service";

import { LogisticElementService } from "../../../@core/services/logisticElement.service";
@Component({
  selector: "ngx-dialog-layout-management",
  templateUrl: "./dialog-layout-management.component.html",
  styleUrls: ["./dialog-layout-management.component.scss"],
})
export class DialogLayoutManagementComponent implements OnInit, OnDestroy {
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
  @Input() oversea_trading_point_id: any;
  constructor(
    protected ref: NbDialogRef<DialogLayoutManagementComponent>,
    private apiCountry: CountryService,
    private messageService: messageService,
    private apiBalanceZone: BalanceZoneService,
    private formBuilder: FormBuilder,
    private apiConnectionPoint: ConnectionPointService,
    private apiLegalEntity: LegalEntityService,
    private apiBalance: BalanceService,
    private apiLogisticElement: LogisticElementService
  ) {
    this.getcountries();
    this.getLegalEntities();
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
  source: Array<any>;
  confirmed: Array<any>;
  userAdd = "";
  disabled = false;
  connectionPointOptions = [];
  selectedConnectionPoints = [];
  errorConnectionPoints = false;
  sourceLeft = true;
  countriesOptions: any;
  zoneOptions: any;
  errorBalanceZone = false;
  connectionPointConfigurationForm!: FormGroup;
  entitiesOptions: any;
  errorLegalEntity = false;
  overseasTradingPointsOptions = [];
  intervalID: any;
  format: any = DualListComponent.DEFAULT_FORMAT;
  private sourceStations: Array<any>;
  private confirmedStations: Array<any>;
  loading = false;
  selectedOverseasTradingPoints: any;
  errorOverseasTradingPoints = false;
  private stations: Array<any> = ["Date", "TVB", , "ASS"];

  ngOnInit() {
    this.connectionPointConfigurationForm = this.formBuilder.group({
      id: new FormControl(""),
      balance_zone_id: new FormControl("", [Validators.required]),
      /*    connection_point: new FormControl("", [Validators.required]), */
      country_code: new FormControl("", [Validators.required]),
      label: new FormControl("", [Validators.required]),
      legal_entity_id: new FormControl("", [Validators.required]),
   /*    oversea_trading_point_id: new FormControl(""), */
    });
    this.getOverseasTradingPoint(true);
    if (this.action == "Update") {
      this.connectionPointConfigurationForm
        .get("balance_zone_id")
        .setValue(this.balance_zone);
      /*    this.connectionPointConfigurationForm.get('connection_point').setValue(this.connection_point); */
      this.connectionPointConfigurationForm
        .get("country_code")
        .setValue(this.country);
      this.connectionPointConfigurationForm.get("label").setValue(this.label);
      this.connectionPointConfigurationForm
        .get("legal_entity_id")
        .setValue(this.legal_entity);
      this.connectionPointConfigurationForm.get("id").setValue(this.id);

      this.getColumns(this.id);
      this.getbalanceZones(this.country);
      this.getOverseasTradingPoint(this.balance_zone);
    } else if (this.action == "Add") {
      this.getColumns();
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object = JSON.parse(localStorage.getItem("settings_parameters"));
        this.connectionPointConfigurationForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.getbalanceZones(object["country_code"]);
        this.connectionPointConfigurationForm
          .get("balance_zone_id")
          .setValue(object["balancing_zone"]);
        this.getOverseasTradingPoint(object["balancing_zone"]);
      }
    }

    this.connectionPointConfigurationForm.get("id").disable();
  }
  ngOnDestroy() {
    clearInterval(this.intervalID);
  }

  getColumns(id?) {
    this.key = "prop";
    this.display = "label"; // [ 'station', 'state' ]; */
    this.keepSorted = false;
    this.apiBalance
      .getBalanceLayoutCols(id)
      .subscribe({
        next: (res) => {

          this.source = res;
          this.source.map((x, index) => {
            if (index == 0) {
              x["active"] = true;
            } else {
              x["active"] = false;
            }
            x["confirmed"] = [];
            x["columns"].map((j) => {
              if (j["is_rule"] == true) {
                j["label"] = "RULE " + j["label"];
              }

              if (j["hidden"] == false && this.action == "Update") {
                x["confirmed"].push({
                  prop: j["prop"],
                  label: j["label"],
                  hidden: j["hidden"],
                });
              }
            });
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
      .add(() => {});
  }
  /*  doReset() {
    this.sourceStations = JSON.parse(JSON.stringify(this.stations));

    this.confirmedStations = new Array<any>();

    // Preconfirm some items.
    this.confirmedStations.push(this.stations[11]);
    this.confirmedStations.push(this.stations[10]);

    this.getColumns();
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
    this.connectionPointConfigurationForm.controls["balance_zone_id"].setValue(
      ""
    );
    this.getbalanceZones(
      this.connectionPointConfigurationForm.get("country_code").value
    );
  }
  onChangeZone($event) {
    this.getConnectionPoints(
      this.connectionPointConfigurationForm.get("balance_zone_id").value
    );
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
    if (this.connectionPointConfigurationForm.valid) {
      this.source.map((x) => {
        x["confirmed"].map((j) => {
          j["hidden"] = false;
        });
        delete x["columns"];
        x["columns"] = x["confirmed"];
        delete x["confirmed"];
        delete x["active"];
      });



      if (this.action == "Add") {
        this.apiBalance
          .addBalanceLayoutConfiguration(
            this.connectionPointConfigurationForm.value
          )
          .subscribe({
            next: (res) => {
              this.apiBalance
                .setBalanceLayoutCols(res.id, this.source)
                .subscribe({
                  next: (res) => {
                    this.loading = false;
                    this.messageService.showToast(
                      "success",
                      "Success",
                      "Balance layout configuration added successfully!"
                    );

                    this.ref.close("save");
                  },
                  error: (e) => {
                    this.loading = false;
                    if (e.error.title == "Internal Server Error") {
                      this.messageService.showToast(
                        "danger",
                        "Error",
                        "Internal server error while adding balance layout configuration"
                      );
                    } else {
                      this.messageService.showToast("danger", "Error", e.error);
                    }
                    this.ref.close("save");
                  },
                });
              this.ref.close("save");
            },
            error: (e) => {
              this.loading = false;
              if (e.error.title == "Internal Server Error") {
                this.messageService.showToast(
                  "danger",
                  "Error",
                  "Internal server error while adding balance layout configuration"
                );
              } else {
                this.messageService.showToast("danger", "Error", e.error);
              }
              this.ref.close("save");
            },
          })
          .add(() => (this.loading = false));
      } else if (this.action == "Update") {
        this.update();
      }
    }
    clearInterval(this.intervalID);
  }
  update() {
    this.apiBalance
      .updateBalanceLayoutConfiguration(
        this.connectionPointConfigurationForm.getRawValue()
      )
      .subscribe({
        next: (res) => {
          this.apiBalance.setBalanceLayoutCols(res.id, this.source).subscribe({
            next: (res) => {
              this.messageService.showToast(
                "success",
                "Success",
                "Balance layout configuration updated successfully!"
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
                  "Internal server error while balance layout configuration"
                );
              } else {
                this.messageService.showToast("danger", "Error", e.error);
              }
              this.ref.close("update");
            },
          });
      
        },
        error: (e) => {
          this.loading = false;
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while updating balance layout configuration"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
          this.ref.close("update");
        },
      });
    clearInterval(this.intervalID);
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
    if (nulls.includes(false)) {
      this.validateEmptyConfirmedColumns = false;
    } else {
      this.validateEmptyConfirmedColumns = true;
    }
  }
  getOverseasTradingPoint(change?) {
    this.apiLogisticElement
      .getLogisticElementByType("overseas_transaction_point", true)

      .subscribe({
        next: (res) => {
          this.overseasTradingPointsOptions = res;
          if (this.overseasTradingPointsOptions.length == 0) {
            this.errorOverseasTradingPoints = true;
          } else {
            this.errorOverseasTradingPoints = false;
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

        if (this.oversea_trading_point_id !== undefined) {

           this.connectionPointConfigurationForm
            .get("oversea_trading_point_id")
            .setValue(
             this.oversea_trading_point_id.map((x)=>{
              x['itemName']= x["name"]
              return x
             })
            
            );  
     
    
        }
      });
  }
}
