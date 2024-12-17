import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { NbDialogRef } from "@nebular/theme";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { map } from "rxjs/operators";
import { BalanceZoneService } from "../../../../@core/services/balanceZone.service";
import { ConnectionPointService } from "../../../../@core/services/connectionPoint.service";
import { CountryService } from "../../../../@core/services/country.service";
import { LogisticElementService } from "../../../../@core/services/logisticElement.service";
import { DarkModeService } from "../../../../@core/services/sharedServices/darkMode.service";
import { messageService } from "../../../../@core/utils/messages";

@Component({
  selector: "ngx-dialog-connection-point",
  templateUrl: "./dialog-connection-point.component.html",
  styleUrls: ["./dialog-connection-point.component.scss"],
})
export class DialogConnectionPointComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() label: string;
  @Input() id: number;
  @Input() connection_type: string;
  @Input() mirrored_point: number;
  @Input() losses_src: number;
  @Input() losses_dest: number;
  @Input() cf_dest: number;
  @Input() cf_src: number;
  @Input() logistic_element_id: number;
  @Input() logistic_element_adjacent_id: number;
  @Input() balance_zone_id: number;
  @Input() balance_zone_id_adj: number;
  @Input() country_code: number;
  @Input() country_code_adj: number;
  @Input() eic: string;

  connectionPointForm!: FormGroup;
  TSOForm!: FormGroup;
  columns: any;
  rows: any;
  rowsTSO = [];
  errorBalanceZone1 = false;
  errorBalanceZone2 = false;
  errorLogisticElement = false;
  errorLogisticElementAdjacent = false;
  errorPointsElement = false;
  zoneOptions1: any;
  zoneOptions2: any;
  countriesOptions: any;
  pointsElementOptions: any;
  logisticElementOptions1: any;
  logisticElementOptions2: any;
  logisticElementAdjacentOptions: any;
  logisticElementsTypeOptions: any;
  classItem = "col-sm-6";
  viewInternationalConnection = false;
  logistic_element_1_type: any;
  logistic_element_2_type: any;
  ob = "*";
  viewLogisticElement2 = true;
  numeral = NumberColumnType.getNumeralInstance();
  serviceOptions: any;
  columnsTSO: any;
  validateRevoGrid: boolean = true;
  isDuplicate: boolean;
  labelService: any;
  valuesParameters: any;
  errorCountryInternationalConnection = false;
  revogridTheme: string;
  ngOnInit(): void {
    this.darkModeService.isDarkMode == true
    ? (this.revogridTheme = "darkMaterial")
    : (this.revogridTheme = "material");
  this.darkModeService.darkModeChange.subscribe((value) => {
    value == true
      ? (this.revogridTheme = "darkMaterial")
      : (this.revogridTheme = "material");
  });
    this.connectionPointForm = this.formBuilder.group({
      id: new FormControl("", [Validators.required]),
      name: new FormControl("", [Validators.required]),
      eic_code: new FormControl("", [Validators.required]),
      connection_type: new FormControl("", [Validators.required]),
      logistic_element_id1: new FormControl("", [Validators.required]),
      logistic_element_id2: new FormControl("", Validators.required),
      country_code1: new FormControl(""),
      country_code2: new FormControl(""),
      balance_zone_id1: new FormControl(""),
      balance_zone_id2: new FormControl(""),
      src_dest_losses: new FormControl("", Validators.required),
      dest_src_losses: new FormControl("", Validators.required),
      src_dest_temp_factor: new FormControl("", Validators.required),
      dest_src_temp_factor: new FormControl("", Validators.required),
      mirrored_point: new FormControl(""),
    });
    this.TSOForm = this.formBuilder.group({
      service: new FormControl("", [Validators.required]),
    });

    this.columnsTSO = [
      {
        name: "Service",
        prop: "service",
        size: 200,
        readonly: true,
      },
      {
        name: "TSO Code",
        prop: "tso_code",
        size: 150,
      },
      {
        name: "TSO Label",
        prop: "tso_label",
        size: 150,
      },
      {
        size: 80,
        readonly: true,
        cellTemplate: (createElement, props) => {
          return createElement(
            "button",
            {
              onClick: () => this.doDelete(props.rowIndex),
              class: {
                "btn-delete": true,
              },
            },
            "DELETE"
          );
        },
      },
    ];
    if (this.action == "Update") {
      this.getbalanceZones(this.country_code, 1);
      this.connectionPointForm.controls["dest_src_losses"].setValue(
        this.numeral(this.losses_dest * 100).format("0,0.[0000000000]")
      );
      this.connectionPointForm.controls["src_dest_losses"].setValue(
        this.numeral(this.losses_src * 100).format("0,0.[0000000000]")
      );
      this.connectionPointForm.controls["dest_src_temp_factor"].setValue(
        this.numeral(this.cf_dest).format("0,0.[0000000000]")
      );
      this.connectionPointForm.controls["src_dest_temp_factor"].setValue(
        this.numeral(this.cf_src).format("0,0.[0000000000]")
      );
      this.connectionPointForm.controls["eic_code"].setValue(this.eic);
      this.connectionPointForm.controls["id"].setValue(this.id);
      this.connectionPointForm.controls["name"].setValue(this.label);
      this.connectionPointForm.controls["connection_type"].setValue(
        this.connection_type
      );
      this.connectionPointForm.controls["logistic_element_id1"].setValue(
        this.logistic_element_id
      );

      this.connectionPointForm.controls["country_code1"].setValue(
        this.country_code
      );
      this.connectionPointForm.controls["country_code2"].setValue(
        this.country_code_adj
      );

      this.connectionPointForm.controls["balance_zone_id1"].setValue(
        this.balance_zone_id
      );

      this.getLogisticElementType(
        this.connection_type,
        1,
        this.balance_zone_id
      );
      if (this.country_code_adj) {
        this.getbalanceZones(this.country_code_adj, 2);
      }

      this.connectionPointForm.controls["balance_zone_id2"].setValue(
        this.balance_zone_id_adj
      );
      if (this.connection_type == "international_connection") {
        this.classItem =
          this.connection_type == "international_connection"
            ? "col-sm-4"
            : "col-sm-6";
        this.viewInternationalConnection =
          this.connection_type == "international_connection" ? true : false;
        this.getConnectionPoints(this.balance_zone_id_adj, this.connection_type);
        this.getLogisticElementType(
          this.connection_type,
          2,
          this.balance_zone_id_adj
        );
        this.connectionPointForm.controls["logistic_element_id2"].setValue(
          this.logistic_element_adjacent_id
        );
        this.connectionPointForm.controls["mirrored_point"].setValue(
          this.mirrored_point
        );
      } else {
        this.getbalanceZones(this.country_code, 2);
        this.getLogisticElementType(
          this.connection_type,
          3,
          this.balance_zone_id
        );
        this.connectionPointForm.controls["logistic_element_id2"].setValue(
          this.logistic_element_adjacent_id
        );
        this.connectionPointForm.controls["mirrored_point"].setValue(
          this.mirrored_point
        );
      }
      this.getValuesTSO(this.id);
      this.getServices(this.connection_type);
    }
    if (this.action == "Add") {
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object = JSON.parse(localStorage.getItem("settings_parameters"));
        this.connectionPointForm
          .get("country_code1")
          .setValue(object["country_code"]);
        this.connectionPointForm
          .get("balance_zone_id1")
          .setValue(object["balancing_zone"]);
        this.getbalanceZones(object["country_code"], 1);
      }
    }
    this.connectionPointForm.controls["id"].disable();
  }

  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogConnectionPointComponent>,
    private apiBalanceZone: BalanceZoneService,
    private apiCountry: CountryService,
    private apiConnectionPoint: ConnectionPointService,
    private apiLogisticElement: LogisticElementService,
    private darkModeService: DarkModeService
  ) {
    this.getCountries();
    this.getConnectionPointsTypes();
  }

  cancel() {
    this.ref.close();
  }

  getbalanceZones(country, zone) {
    this.apiBalanceZone.getAllBalanceZonesByCountry(country).subscribe({
      next: (res) => {
        if (zone == 1) {
          this.zoneOptions1 = res;

          if (this.zoneOptions1.length == 0) {
            this.errorBalanceZone1 = true;
          } else {
            this.errorBalanceZone1 = false;
          }
        } else {
          this.zoneOptions2 = res;
          if (this.zoneOptions2.length == 0) {
            this.errorBalanceZone2 = true;
          } else {
            this.errorBalanceZone2 = false;
          }
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
  getConnectionPointsTypes() {
    this.apiConnectionPoint.getConnectionPointTypes().subscribe({
      next: (res) => {
        this.logisticElementsTypeOptions = res;
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting tolls"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  getConnectionPoints(zone, connection_type) {
    this.apiConnectionPoint
      .getConnectionPointByTypeBalanceZone(zone, connection_type)
      .subscribe({
        next: (res) => {
          this.pointsElementOptions = res;
          if (this.pointsElementOptions.length == 0) {
            this.errorPointsElement = true;
          } else {
            this.errorPointsElement = false;
          }
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting delivery points"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }

  onChangeCountry1($event) {
    this.connectionPointForm.controls["logistic_element_id1"].setValue("");
    var connectionType = this.connectionPointForm.get("connection_type").value;
    if (connectionType) {
      this.connectionPointForm.controls["balance_zone_id1"].setValue("");
      this.getbalanceZones(
        this.connectionPointForm.get("country_code1").value,
        1
      );
    }
    if (
      connectionType == "international_connection" &&
      this.connectionPointForm.get("country_code2").value
    ) {
      if (
        this.connectionPointForm.get("country_code1").value ==
        this.connectionPointForm.get("country_code2").value
      ) {
        this.errorCountryInternationalConnection = true;
      } else {
        this.errorCountryInternationalConnection = false;
      }
    }
  }
  onChangeCountry2($event) {
    this.connectionPointForm.controls["logistic_element_id2"].setValue("");
    this.connectionPointForm.controls["mirrored_point"].setValue("");
    var connectionType = this.connectionPointForm.get("connection_type").value;
    if (connectionType) {
      if (connectionType == "international_connection") {
        this.connectionPointForm.controls["balance_zone_id2"].setValue("");
        this.getbalanceZones(
          this.connectionPointForm.get("country_code2").value,
          2
        );
      }
    }
    if (
      connectionType == "international_connection" &&
      this.connectionPointForm.get("country_code1").value
    ) {
;
      if (
        this.connectionPointForm.get("country_code1").value ==
        this.connectionPointForm.get("country_code2").value
      ) {
;
        this.errorCountryInternationalConnection = true;
;
      } else {
        this.errorCountryInternationalConnection = false;
      }
    }

;
  }
  onChangeZone1($event) {
    var connectionType = this.connectionPointForm.get("connection_type").value;
    if (connectionType) {
      var balance_zone = this.connectionPointForm.get("balance_zone_id1").value;
      this.connectionPointForm.controls["logistic_element_id1"].setValue("");
      this.getLogisticElementType(connectionType, 1, balance_zone);
      if (connectionType != "international_connection") {
        this.connectionPointForm.controls["logistic_element_id2"].setValue("");
        this.connectionPointForm.controls["mirrored_point"].setValue("");
        this.getLogisticElementType(connectionType, 3, balance_zone);
      }
    }
  }
  onChangeZone2($event) {
    var connectionType = this.connectionPointForm.get("connection_type").value;
    var balance_zone = this.connectionPointForm.get("balance_zone_id2").value;
    this.pointsElementOptions = [];
    if (connectionType) {
      if (connectionType == "international_connection") {
        this.getLogisticElementType(connectionType, 2, balance_zone);
        this.getConnectionPoints(balance_zone, connectionType);
      }
    }

  }
  onChangeLogisticElementType($event) {
    var connectionType = this.connectionPointForm.get("connection_type").value;
    var balanceZone1 = this.connectionPointForm.get("balance_zone_id1").value;
    var balanceZone2 = this.connectionPointForm.get("balance_zone_id2").value;
    var country = this.connectionPointForm.get("country_code1").value;
    this.getServices(connectionType);
    if (connectionType) {
      if (country) {
        this.getbalanceZones(country, 1);
      }

      this.connectionPointForm.controls["logistic_element_id1"].setValue("");
      this.connectionPointForm.controls["logistic_element_id2"].setValue("");
      this.connectionPointForm.controls["mirrored_point"].setValue("");
      if (balanceZone1) {
        this.getLogisticElementType(connectionType, 1, balanceZone1);
        this.getLogisticElementType(connectionType, 3, balanceZone1);
      }
      this.classItem =
        connectionType == "international_connection" ? "col-sm-4" : "col-sm-6";
      this.viewInternationalConnection =
        connectionType == "international_connection" ? true : false;
      if (connectionType == "international_connection") {
        if (balanceZone2) {
          this.getLogisticElementType(connectionType, 2, balanceZone2);
        }
      } else {
      }
      if (connectionType == "conventional_consumer_connection") {
        this.connectionPointForm.get("dest_src_losses").clearValidators();
        this.connectionPointForm
          .get("dest_src_losses")
          .updateValueAndValidity();
      } else {
        this.connectionPointForm
          .get("dest_src_losses")
          .setValidators(Validators.required);
        this.connectionPointForm
          .get("dest_src_losses")
          .updateValueAndValidity();
      }
    }
  }
  getLogisticElements(zone, logistic_element, type) {
    this.apiLogisticElement
      .getLogisticElementByTypeBalanceZone(zone, type)
      .subscribe({
        next: (res) => {
          if (logistic_element == 1) {
            this.logisticElementOptions1 = res;
          } else {
            this.logisticElementOptions2 = res;
          }
        },
        error: (e) => {
          if (logistic_element == 1) {
            this.logisticElementOptions1 = [];
          } else {
            this.logisticElementOptions2 = [];
          }

          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting logistic element"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }
  add() {
    if (this.connectionPointForm.valid) {
      this.connectionPointForm.controls["src_dest_temp_factor"].clearValidators();
      this.connectionPointForm.controls["src_dest_temp_factor"].setValue(
        Number(
          this.connectionPointForm
            .get("src_dest_temp_factor")
            .value.toString()
            .replace(/\./g, "")
            .replace(",", ".")
        )
      );
      this.connectionPointForm.controls["src_dest_temp_factor"].setValue(
        this.connectionPointForm.get("src_dest_temp_factor").value
      );
      this.connectionPointForm.controls["dest_src_temp_factor"].clearValidators();
      this.connectionPointForm.controls["dest_src_temp_factor"].setValue(
        Number(
          this.connectionPointForm
            .get("dest_src_temp_factor")
            .value.toString()
            .replace(/\./g, "")
            .replace(",", ".")
        )
      );

      this.connectionPointForm.controls["dest_src_temp_factor"].setValue(
        this.connectionPointForm.get("dest_src_temp_factor").value
      );



      this.connectionPointForm.controls["src_dest_losses"].clearValidators();
      this.connectionPointForm.controls["src_dest_losses"].setValue(
        Number(
          this.connectionPointForm
            .get("src_dest_losses")
            .value.toString()
            .replace(/\./g, "")
            .replace(",", ".")
        )
      );
      this.connectionPointForm.controls["src_dest_losses"].setValue(
        this.connectionPointForm.get("src_dest_losses").value / 100
      );
      this.connectionPointForm.controls["dest_src_losses"].clearValidators();
      this.connectionPointForm.controls["dest_src_losses"].setValue(
        Number(
          this.connectionPointForm
            .get("dest_src_losses")
            .value.toString()
            .replace(/\./g, "")
            .replace(",", ".")
        )
      );

      this.connectionPointForm.controls["dest_src_losses"].setValue(
        this.connectionPointForm.get("dest_src_losses").value / 100
      );
      let object = {
        id: this.connectionPointForm.get("id").value
          ? this.connectionPointForm.get("id").value
          : null,
        logistic_element_adjacent_id: this.connectionPointForm.get(
          "logistic_element_id2"
        ).value
          ? this.connectionPointForm.get("logistic_element_id2").value
          : null,
        logistic_element_id: this.connectionPointForm.get(
          "logistic_element_id1"
        ).value,
        mirrored_point: this.connectionPointForm.get(
          "mirrored_point"
        ).value
          ? this.connectionPointForm.get("mirrored_point").value
          : null,
        connection_type: this.connectionPointForm.get("connection_type").value,
        name: this.connectionPointForm.get("name").value,
        eic: this.connectionPointForm.get("eic_code").value,
        dest_src_losses: this.connectionPointForm.get("dest_src_losses").value,
        src_dest_losses: this.connectionPointForm.get("src_dest_losses").value,
        src_dest_temp_factor: this.connectionPointForm.get("src_dest_temp_factor").value,
        dest_src_temp_factor: this.connectionPointForm.get("dest_src_temp_factor").value,
      };

      if (this.action == "Add") {
        this.apiConnectionPoint
          .addConnectionPoint(this.clean(object))
          .subscribe({
            next: (res) => {
              this.connectionPointForm.reset();
              this.ref.close("save");
              document.querySelectorAll("revo-grid").forEach((element) => {
                element
                  .getSource()
                  .then((value) => {
                    this.valuesParameters = value;

                    this.valuesParameters.map((data) => {
                      //data["logistic_element_id"] = res.id;
                      return data;
                    });
                  })
                  .then((v) => {
                    this.setValuesTSO(res.id, this.valuesParameters, "added");
                  });
              });
            },
            error: (e) => {
              if (e.error.title == "Internal Server Error") {
                this.messageService.showToast(
                  "danger",
                  "Error",
                  "Internal server error while adding connection point"
                );
              } else {
                this.messageService.showToast("danger", "Error", e.error);
              }
            },
          });
      } else if (this.action == "Update") {
        this.update(object);
      }
    }
  }

  update(object) {
    document.querySelectorAll("revo-grid").forEach((element) => {
      element.getSource().then((value) => {
        this.valuesParameters = value;
      });
    });

    this.apiConnectionPoint
      .updateConnectionPoint(this.clean(object))
      .subscribe({
        next: (res) => {
          this.setValuesTSO(res.id, this.valuesParameters, "updated");
          this.connectionPointForm.reset();
          this.ref.close("update");
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while updating connection point"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }

  getLogisticElementType(type, logistic_element, zone) {
    this.apiConnectionPoint.getConnectionPointTypeElements(type).subscribe({
      next: (res) => {
        this.logistic_element_1_type = "";
        this.logistic_element_2_type = "";
        this.logistic_element_1_type = res["logistic_element_type"];
        this.logistic_element_2_type = res["logistic_element_type_adjacent"];

        if (
          this.logistic_element_2_type != null &&
          this.logistic_element_2_type != "lng_vessel" &&
          this.logistic_element_2_type != "ccgt_consumer" &&
          this.logistic_element_2_type != "conventional_consumer"
        ) {
          this.connectionPointForm
            .get("logistic_element_id2")
            .addValidators(Validators.required);
          this.connectionPointForm
            .get("logistic_element_id2")
            .updateValueAndValidity();
          this.ob = "*";
          this.viewLogisticElement2 = true;
          if (logistic_element == 1) {
            this.getLogisticElements(
              zone,
              logistic_element,
              this.logistic_element_1_type
            );
          } else if (logistic_element == 2) {
            this.getLogisticElements(
              zone,
              logistic_element,
              this.logistic_element_2_type
            );
          } else {
            this.getLogisticElements(
              zone,
              logistic_element,
              this.logistic_element_2_type
            );
          }
        } else {
          if (logistic_element == 1) {
            this.logisticElementOptions1 = [];
          } else {
            this.logisticElementOptions2 = [];
          }
          this.connectionPointForm
            .get("logistic_element_id2")
            .clearValidators();
          this.connectionPointForm
            .get("logistic_element_id2")
            .updateValueAndValidity();
          this.ob = "";
          this.viewLogisticElement2 = false;
          if (logistic_element == 1) {
            this.getLogisticElements(
              zone,
              logistic_element,
              this.logistic_element_1_type
            );
          }
        }
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting connection point type element"
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
  getServices(connection_type?) {
    this.apiConnectionPoint.getLogisticServices(connection_type).subscribe({
      next: (res) => {
        this.serviceOptions = res;
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting tolls"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }

  addRow() {
    this.rowsTSO.push({
      service_id: this.TSOForm.get("service").value,
      service: this.labelService,
    });
    document.querySelectorAll("revo-grid").forEach((element) => {
      element.source = [];
      element.source = this.rowsTSO;

      element.getSource().then((value) => {
        var valueArr = value.map(function (item) {
          return item.service_id;
        });
        this.isDuplicate = valueArr.some(function (item, idx) {
          return valueArr.indexOf(item) != idx;
        });
      });
    });
  }
  doDelete(rowIndex) {
    this.rowsTSO.splice(rowIndex, 1);
    document.querySelectorAll("revo-grid").forEach((element) => {
      element.source = [];
      element.source = this.rowsTSO;
    });
    document.querySelectorAll("revo-grid").forEach((element) => {
      element.getSource().then((value) => {
        var valueArr = value.map(function (item) {
          return item.service_id;
        });
        this.isDuplicate = valueArr.some(function (item, idx) {
          return valueArr.indexOf(item) != idx;
        });
      });
    });
  }
  onChangeService($event) {

    let selectedValue = this.serviceOptions.find((item) => item.id === $event);

    this.labelService = selectedValue.name;

    if (this.labelService === undefined) {
      this.labelService = selectedValue.label;
    }
  }
  setValuesTSO(connection_point_id, values, message) {
    if (values.length > 0) {
      this.apiConnectionPoint
        .addTSOCodesConnectionPoint(connection_point_id, values)
        .subscribe({
          next: (res) => {
            this.messageService.showToast(
              "success",
              "Success",
              "Connection Point " + message + " successfully!"
            );
            this.TSOForm.reset();
            if (message == "added") {
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
                "Internal server error while setting TSO codes"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        });
    } else {
      this.messageService.showToast(
        "success",
        "Success",
        "Connection Point " + message + " successfully!"
      );
      this.TSOForm.reset();
      if (message == "added") {
        this.ref.close("save");
      } else {
        this.ref.close("update");
      }
    }
  }
  getValuesTSO(id) {
    this.apiConnectionPoint
      .getTSOCodesConnectionPoint(id)
      .pipe(
        map((data) => {
          return data.map((x, index) => {
            delete x["id"];
            return x;
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.rowsTSO = res;
          document.querySelectorAll("revo-grid").forEach((element) => {
            element.source = this.rowsTSO;
            element.useClipboard = false;
          });
        },
        error: (e) => {
          /*  if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting TSO codes"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          } */
        },
      });
  }
}
