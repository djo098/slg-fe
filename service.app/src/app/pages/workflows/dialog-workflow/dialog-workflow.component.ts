import { DatePipe } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import { NbDialogRef } from "@nebular/theme";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { BalanceZoneService } from "../../../@core/services/balanceZone.service";
import { ConnectionPointService } from "../../../@core/services/connectionPoint.service";
import { CountryService } from "../../../@core/services/country.service";
import { JobsService } from "../../../@core/services/jobs.service";
import { LegalEntityService } from "../../../@core/services/legalEntity.service";
import { LogisticElementService } from "../../../@core/services/logisticElement.service";
import { DarkModeService } from "../../../@core/services/sharedServices/darkMode.service";
import { messageService } from "../../../@core/utils/messages";
import { WorkflowService } from './../../../@core/services/workflow.service';

@Component({
  selector: "slg-dialog-workflow",
  templateUrl: "./dialog-workflow.component.html",
  styleUrls: ["./dialog-workflow.component.scss"],
})
export class DialogWorkflowComponent implements OnInit {
  @Input() title: string;
  @Input() action: string;
  @Input() id: string;
  @Input() label: string;
  @Input() country: string;
  @Input() balance_zone: string;
  @Input() legal_entity: string;
  @Input() periodicity: string;
  @Input() start_time: string;
  @Input() end_time: string;
  @Input() activated: boolean;
  @Input() error_message: string;

  rows = [];
  threshold_rows = [];
  numeral = NumberColumnType.getNumeralInstance();
  errorUpperThreshold = false;


  isDuplicatePriority: boolean;
  entitiesOptions: any;
  errorLegalEntity: any;
  loading = false;
  loading_array: any = [];
  workflowForm!: FormGroup;
  actionPreferencesForm!: FormGroup;
  thresholdPreferencesForm!: FormGroup;
  countriesOptions: any;
  zoneOptions: any;
  errorBalanceZone = false;
  selectedServices: any;
  logisticElementOptions: any;
  errorLogisticElement: boolean;
  errorDeliveryPoint = false;
  deliveryPointOptions: any;
  selectedThresholdServices;
  serviceOptions: any;
  rowsActionPreferences = [];
  rowsThresholdPreferences = [];
  revogridTheme: string;
  columnsActionPreferences: any;
  columnsThresholdPreferences: any;
  validateRevogrid: boolean;
  errorLogisticService = false;
  concatenatedServices: any;
  nameInfrastructure: any;
  labelConnectionPoint: any;
  logisticElementsTypeOptions: any;
  intervalID: any;
  constructor(
    public datepipe: DatePipe,
    private formBuilder: FormBuilder,
    private apiCountry: CountryService,
    private messageService: messageService,
    private apiBalanceZone: BalanceZoneService,
    private apiConnectionPoint: ConnectionPointService,
    private darkModeService: DarkModeService,
    protected ref: NbDialogRef<DialogWorkflowComponent>,
    private apiLegalEntity: LegalEntityService,
    private jobService: JobsService,
    private apiLogisticElement: LogisticElementService,
    private apiWorkflow: WorkflowService,

  ) {
    this.getcountries();
    this.getLegalEntities();
    this.getConnectionPointsTypes();
  }

  ngOnInit(): void {
    this.workflowForm = this.formBuilder.group({
      active: new FormControl(false),
      id: new FormControl(""),
      label: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      balance_zone_id: new FormControl("", [Validators.required]),
      legal_entity: new FormControl("", [Validators.required]),
      periodicity: new FormControl("", [Validators.required]),
      startTime: new FormControl("", [
        Validators.required,
      ]),
      endTime: new FormControl("", [
        Validators.required,
      ]),
      errorMessage: new FormControl("", [Validators.required])
    });
    this.actionPreferencesForm = this.formBuilder.group({
      connection_type: new FormControl("", [Validators.required]),
      connection_point: new FormControl("", [Validators.required]),
      service: new FormControl("", [Validators.required]),
      action: new FormControl("", [Validators.required]),
      priority: new FormControl("", [Validators.required, Validators.pattern(
        /^[+]?([1-9]{1}[0-9]{0,2}(\.\d{0})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{0})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{0})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/
      ), Validators.min(1)]),
      limit: new FormControl("", [Validators.required, Validators.pattern(
        /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/
      ),],),
      date: new FormControl("", [Validators.required]),
    });

    this.thresholdPreferencesForm = this.formBuilder.group({
      threshold_connection_type: ["logistic_element"],
      threshold_element_type: new FormControl("", Validators.required),
      threshold_infrastructure: new FormControl("", [Validators.required]),
      threshold_date: new FormControl("", [
        Validators.required,
        // this.dateRangeValidatorSchedule,
      ]),
      lower_threshold: [
        "",
        [
          Validators.required,
          Validators.pattern(
            /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/
          ),
        ],
      ],
      upper_threshold: [
        "",
        [
          Validators.required,
          Validators.pattern(
            /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/
          ),
        ],
      ],
    });


    this.darkModeService.isDarkMode == true
      ? (this.revogridTheme = "darkMaterial")
      : (this.revogridTheme = "material");
    this.darkModeService.darkModeChange.subscribe((value) => {
      value == true
        ? (this.revogridTheme = "darkMaterial")
        : (this.revogridTheme = "material");
    });
    this.columnsActionPreferences = [
      {
        prop: "date_parameter",
        name: "Date",
        readonly: true,
        size: 110 + Number(String("Date").length) * 3,
      },
      {
        prop: "connection_type",
        name: "Connection Type",
        size: 110 + Number(String("Connection Type").length) * 3,
        readonly: true,
      },
      {
        prop: "connection_point",
        name: "Connection Point",
        size: 110 + Number(String("Connection Type").length) * 3,
        readonly: true,
      },
      {
        prop: "service",
        name: "Service",
        size: 110 + Number(String("Service").length) * 3,
        readonly: true,
      },

      {
        prop: "action",
        name: "Action",
        size: 110 + Number(String("Action").length) * 3,
        readonly: true,
      },
      {
        prop: "priority",
        name: "Priority",
        size: 110 + Number(String("Priority").length) * 3,
        cellProperties: ({ prop, model, data, column }) => {
          return {
            class: {
              numeric: true,
            },
          };
        },
      },
      {
        prop: "limit",
        name: "Limit",
        size: 110 + Number(String("Limit").length) * 3,
        cellProperties: ({ prop, model, data, column }) => {
          return {
            class: {
              numeric: true,
            },
          };
        },
      },

      {
        size: 110,
        readonly: true,
        cellTemplate: (createElement, props) => {
          return createElement(
            "button",
            {
              onClick: () => this.doDeleteActionPreferences(props.rowIndex),
              class: {
                "btn-delete": true,
              },
            },
            "DELETE"
          ); /* h(
        "button",
        {
          onClick: () => this.doDelete(props.rowIndex),
        },
        "delete"
      ); */
        },
      },
    ];
    this.columnsThresholdPreferences = [
      {
        prop: "date_threshold",
        name: "Date",
        readonly: true,
        size: 110 + Number(String("Date").length) * 3,
      },

      {
        prop: "threshold_element_type",
        name: "Element Type",
        size: 110 + Number(String("Element Type").length) * 3,
        readonly: true,
      },
      {
        prop: "threshold_infrastructure",
        name: "Infrastructure",
        size: 110 + Number(String("Infrastructure").length) * 3,
        readonly: true,
      },

      {
        prop: "lower_threshold",
        name: "Lower Threshold",
        size: 110 + Number(String("Lower Threshold").length) * 3,
        cellProperties: ({ prop, model, data, column }) => {
          return {
            class: {
              numeric: true,
            },
          };
        },
      },
      {
        prop: "upper_threshold",
        name: "Upper Threshold",
        size: 110 + Number(String("Upper Threshold").length) * 3,
        cellProperties: ({ prop, model, data, column }) => {
          return {
            class: {
              numeric: true,
            },
          };
        },
      },

      {
        size: 110,
        readonly: true,
        cellTemplate: (createElement, props) => {
          return createElement(
            "button",
            {
              onClick: () => this.doDeleteThresholdPreferences(props.rowIndex),
              class: {
                "btn-delete": true,
              },
            },
            "DELETE"
          ); /* h(
        "button",
        {
          onClick: () => this.doThresholdDelete(props.rowIndex),
        },
        "delete"
      ); */
        },
      },
    ];

    if (this.action == "Update") {
      this.workflowForm.controls["active"].setValue(this.activated);
      this.workflowForm.controls["label"].setValue(this.label);
      this.workflowForm.controls["country_code"].setValue(this.country);
      this.workflowForm.controls["balance_zone_id"].setValue(this.balance_zone);
      this.workflowForm.controls["legal_entity"].setValue(this.legal_entity);
      this.workflowForm.controls["periodicity"].setValue(String(this.periodicity));
      this.workflowForm.controls["startTime"].setValue(new Date(
        2022,
        1,
        1,
        Number(this.start_time.toString().split(":")[0]),
        Number(this.start_time.toString().split(":")[1]),
        0
      ));
      this.workflowForm.controls["endTime"].setValue(new Date(
        2022,
        1,
        1,
        Number(this.end_time.toString().split(":")[0]),
        Number(this.end_time.toString().split(":")[1]),
        0
      ));
      this.workflowForm.controls["errorMessage"].setValue(this.error_message);

      this.getbalanceZones(this.country);
      
      // methods to get the preferences from BE
      this.getPreferencesById(this.id);
    }
  }

  getPreferencesById(id) {
    this.loading = true;
    this.apiWorkflow
      .getWorkflowConfiguration(id)
      .subscribe({
        next: (res) => {
          this.rowsActionPreferences = res["workflow_action_preferences"];
          this.rowsThresholdPreferences = res["workflow_thresholds"];

          document
            .querySelectorAll("revo-grid")
            .forEach((element) => {
              if (element.id == "revogridActionPreferences") {
                element.source = [];
                element.source = this.rowsActionPreferences;
                element.useClipboard = true;

              }
              if (element.id == "revogridThresholdPreferences") {
                element.source = [];
                element.source = this.rowsThresholdPreferences;
                element.useClipboard = true;

              }
            });

          this.rowsActionPreferences.map((x) => {
            x["priority"] = this.numeral(x["priority"]).format("0,0.[000000000000]");
            x["limit"] = this.numeral(x["limit"]).format("0,0.[000000000000]");
          });
          this.rowsThresholdPreferences.map((x) => {
            x["lower_threshold"] = this.numeral(x["lower_threshold"]).format("0,0.[000000000000]");
            x["upper_threshold"] = this.numeral(x["upper_threshold"]).format("0,0.[000000000000]");
          });
        },

        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting preferences"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        setTimeout(() => {
          document
            .querySelectorAll("revo-grid")
            .forEach((element) => (element.resize = true));
          document
            .querySelectorAll("revo-grid")
            .forEach((element) => (element.autoSizeColumn = true));
        }, 100);
        this.loading = false;
      });
  }


  getcountries() {
    this.loading = true;
    this.loading_array[0] = true;
    this.apiCountry
      .getcountries()
      .subscribe({
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
      })
      .add(() => {
        this.loading_array[0] = false;
        if (this.loading_array.includes(true) == false) {
          this.loading = false;
          this.loading_array = [];
        }
      });
  }
  getbalanceZones(country) {
    this.loading = true;
    this.loading_array[1] = true;
    this.apiBalanceZone
      .getAllBalanceZonesByCountry(country)
      .subscribe({
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
      })
      .add(() => {
        this.loading_array[1] = false;
        if (this.loading_array.includes(true) == false) {
          this.loading = false;
          this.loading_array = [];
        }
      });
  }
  onChangeCountry($event) {
    this.workflowForm.controls["balance_zone_id"].setValue("");
    this.getbalanceZones(this.workflowForm.get("country_code").value);
  }
  onChangeZone($event) {
    if (this.actionPreferencesForm.get("connection_type").value) {
      this.logisticElementOptions = [];
      this.getConnectionPoints(
        this.actionPreferencesForm.get("connection_type").value,
        this.workflowForm.get("balance_zone_id").value
      );

      this.getServices(
        this.actionPreferencesForm.get("connection_type").value,
        this.workflowForm.get("balance_zone_id").value,
        "change"
      );
    }
    if (this.thresholdPreferencesForm.get("threshold_element_type").value) {
      this.deliveryPointOptions = [];
      this.getDeliveryPoint(this.workflowForm.get("balance_zone_id").value, this.thresholdPreferencesForm.get("threshold_connection_type").value, this.thresholdPreferencesForm.get("threshold_element_type").value)
    }
  }
  onChangeLogisticElementType($event) {
    this.selectedServices = [];
    if (this.workflowForm.get("balance_zone_id").value) {
      this.logisticElementOptions = [];
      this.getConnectionPoints(
        this.actionPreferencesForm.get("connection_type").value,
        this.workflowForm.get("balance_zone_id").value
      );

      this.getServices(
        this.actionPreferencesForm.get("connection_type").value,
        this.workflowForm.get("balance_zone_id").value,
        "change"
      );
    }
    this.actionPreferencesForm.controls["connection_point"].setValue("");
    this.actionPreferencesForm.controls["service"].setValue("");

  }

  onChangeElementType($event) {
    this.thresholdPreferencesForm.controls["threshold_infrastructure"].setValue("");

    this.deliveryPointOptions = [];
    if (
      this.workflowForm.get("balance_zone_id").value &&
      this.thresholdPreferencesForm.get("threshold_connection_type").value
    ) {
      this.getDeliveryPoint(
        this.workflowForm.get("balance_zone_id").value,
        this.thresholdPreferencesForm.get("threshold_connection_type").value,
        this.thresholdPreferencesForm.get("threshold_element_type").value
      );
    }
  }

  getDeliveryPoint(zone, type, type1) {
    if (type == "logistic_element") {
      this.apiLogisticElement
        .getLogisticElementByTypeBalanceZone(zone, type1)
        .subscribe({
          next: (res) => {
            this.deliveryPointOptions = res;
            if (this.deliveryPointOptions.length == 0) {
              this.errorDeliveryPoint = true;
            } else {
              this.errorDeliveryPoint = false;
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
  }



  getConnectionPoints(type, zone) {
    this.loading = true;
    this.loading_array[2] = true;
    this.apiConnectionPoint
      .getConnectionPointByTypeBalanceZone(zone, type)
      .subscribe({
        next: (res) => {
          this.logisticElementOptions = res;
          if (this.logisticElementOptions.length == 0) {
            this.errorLogisticElement = true;
          } else {
            this.errorLogisticElement = false;
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
      })
      .add(() => {
        this.loading_array[2] = false;
        if (this.loading_array.includes(true) == false) {
          this.loading = false;
          this.loading_array = [];
        }
      });
  }
  getServices(connection_type?, zone?, change?) {
    this.loading = true;
    this.loading_array[3] = true;
    this.apiConnectionPoint
      .getLogisticServices(connection_type, zone)
      .subscribe({
        next: (res) => {
          this.serviceOptions = res;
          if (this.serviceOptions.length == 0) {
            this.errorLogisticService = true;
          } else {
            this.errorLogisticService = false;
          }
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
      })
      .add(() => {
        //this.selectedServices = this.service;
        if (change) {
          this.selectedServices = [];
        }
        this.loading_array[3] = false;
        if (this.loading_array.includes(true) == false) {
          this.loading = false;
          this.loading_array = [];
        }
      });
  }
  getConnectionPointsTypes() {
    this.loading = true;
    this.loading_array[4] = true;
    this.apiConnectionPoint
      .getConnectionPointTypes()
      .subscribe({
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
      })
      .add(() => {
        this.loading_array[4] = false;
        if (this.loading_array.includes(true) == false) {
          this.loading = false;
          this.loading_array = [];
        }
      });
  }
  doDeleteActionPreferences(rowIndex) {
    this.rowsActionPreferences.splice(rowIndex, 1);

    document.querySelectorAll("revo-grid").forEach((element) => {
      if (element.id == "revogridActionPreferences") {
        element.source = [];

        element.source =
          this.rowsActionPreferences;
          element.getSource()
          .then((value) => {
            var valueArr = value.map(item => ({ date_parameter: item.date_parameter, priority: item.priority, action: item.action }));
            this.isDuplicatePriority = valueArr.some((item, idx) => {
              // Verifica si existe otro elemento con la misma date_parameter y priority, pero en un índice diferente
              return valueArr.findIndex(val => val.date_parameter === item.date_parameter && val.priority === item.priority && val.action === item.action) != idx;
            });
          })

      
      }
    });

    

  }
  
  doDeleteThresholdPreferences(rowIndex) {
    document.querySelectorAll("revo-grid").forEach((element) => {
      if (element.id == "revogridThresholdPreferences") {
        element
          .getSource()
          .then((value) => {
            this.rowsThresholdPreferences = value;
          })

          .finally(() => {
            this.rowsThresholdPreferences.splice(rowIndex, 1);
            element.source = [];

            element.source =
              this.rowsThresholdPreferences;
          });
      }
    });
  }
  onChangeService($event) {
    // Initialize an array to store the names or labels
    //let names = [];

    // Loop through each number in the $event array
    //$event.forEach((number) => {
      // Find the corresponding option using the number
      let selectedValueService = this.serviceOptions.find(
        (item) => item.id === $event
      );

      let labelService = "";
      // Check if the selectedValueService is found
      if (selectedValueService) {
        // Push the name or label into the names array
        labelService = selectedValueService.name || selectedValueService.label;
      }
    

    // Concatenate the names into a single string separated by ", "
    this.concatenatedServices = labelService;
  }

  onChangeInfrastructure($event) {
    // Find the corresponding option using the single value
    let selectedValueInfrastructure = this.deliveryPointOptions.find(
      (item) => item.id === $event
    );

    // Initialize a variable to store the name or label
    let labelInfrastructure = "";

    // Check if the selectedValueInfrastructure is found
    if (selectedValueInfrastructure) {
      // Assign the name or label to the variable
      labelInfrastructure = selectedValueInfrastructure.name || selectedValueInfrastructure.label;
    }

    this.nameInfrastructure = labelInfrastructure;


  }

  onChangeConnectionPoint($event) {
    let selectedValue = this.logisticElementOptions.find(
      (item) => item.id === $event
    );

    this.labelConnectionPoint = selectedValue.name;

    if (this.labelConnectionPoint === undefined) {
      this.labelConnectionPoint = selectedValue.label;
    }
  }
  cancel() {
    this.ref.close();
  }

  getLegalEntities() {
    this.loading = true;
    this.loading_array[5] = true;
    this.apiLegalEntity
      .getAllLegalEntitiesByCountry(null, "Internal")
      .subscribe({
        next: (res) => {
          this.entitiesOptions = res.sort((a, b) => (a.name > b.name) ? 1 : -1);

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
      })
      .add(() => {
        this.loading_array[5] = false;
        if (this.loading_array.includes(true) == false) {
          this.loading = false;
          this.loading_array = [];
        }
      });
  }

  // Functions to check that upperThresholdValue is not <= lowerThresholdValue
  getUpperThresholdStatus() {
    const upperThresholdControl = this.thresholdPreferencesForm.get('upper_threshold');
    if (upperThresholdControl.errors && upperThresholdControl.errors.upperThresholdInvalid) {
      return 'danger';
    } else {
      return upperThresholdControl.touched || upperThresholdControl.dirty ? 'basic' : '';
    }
  }

  onLowerThresholdKeydown(event: KeyboardEvent) {
    if (this.thresholdPreferencesForm.get("upper_threshold").value) {
      if (Number(this.thresholdPreferencesForm.get("lower_threshold").value.toString().replace(/\./g, "").replace(",", "."))
        > Number(this.thresholdPreferencesForm.get("upper_threshold").value.toString().replace(/\./g, "").replace(",", "."))) {
        this.errorUpperThreshold = true;

      }
      else {
        this.errorUpperThreshold = false;

      }
    }
  }

  onUpperThresholdKeydown(event: KeyboardEvent) {
    if (this.thresholdPreferencesForm.get("lower_threshold").value) {
      if (Number(this.thresholdPreferencesForm.get("lower_threshold").value.toString().replace(/\./g, "").replace(",", "."))
        > Number(this.thresholdPreferencesForm.get("upper_threshold").value.toString().replace(/\./g, "").replace(",", "."))) {
        this.errorUpperThreshold = true;

      }
      else {
        this.errorUpperThreshold = false;

      }
    }
  }


  addRowActionPreferences() {
    document.querySelectorAll("revo-grid").forEach((element)=>{
      if(element.id == 'revogridActionPreferences'){
        element.getSource()
        .then((value) => {

          var valueArr = value.map(item => ({ date_parameter: item.date_parameter, priority: item.priority, action: item.action }));
          this.isDuplicatePriority = valueArr.some((item, idx) => {
            // Verifica si existe otro elemento con la misma date_parameter y priority, pero en un índice diferente
            return valueArr.findIndex(val => val.date_parameter === item.date_parameter && val.priority === item.priority && val.action === item.action) != idx;
          });
        
        });
      }
    })


    this.rowsActionPreferences.push({
      date_parameter: this.datepipe.transform(this.actionPreferencesForm.get("date").value, "yyyy-MM-dd"),
      connection_type:
        this.actionPreferencesForm.get("connection_type").value,
      connection_point: this.labelConnectionPoint, // Contains the label
      connection_point_id:    // Contains the id
        this.actionPreferencesForm.get("connection_point").value,

      service: this.concatenatedServices,
      service_id:
        this.actionPreferencesForm.get("service").value,
      //delivery_point: this.labelDeliveryPoint,
      action: this.actionPreferencesForm.get("action").value,
      priority: this.numeral(
        Number(
          this.actionPreferencesForm
            .get("priority")
            .value.toString()
            .replace(/\./g, "")
            .replace(",", ".")
        )
      ).format("0,0.[000000000000]"),
      limit: this.numeral(
        Number(
          this.actionPreferencesForm
            .get("limit")
            .value.toString()
            .replace(/\./g, "")
            .replace(",", ".")
        )
      ).format("0,0.[000000000000]"),
      //currency: this.preferencesForm.get("currency").value,
      //contract_id: this.id,
    });
    //}

    document
      .querySelectorAll("revo-grid")
      .forEach((element) => {
        if (element.id == "revogridActionPreferences") {
          element.source = [];
          element.source = this.rowsActionPreferences;
        }
      });

  }


  addRowThresholdPreferences() {

    this.rowsThresholdPreferences.push({
      date_threshold: this.datepipe.transform(this.thresholdPreferencesForm.get("threshold_date").value, "yyyy-MM-dd"),
      threshold_element_type:
        this.thresholdPreferencesForm.get("threshold_element_type").value,

      threshold_infrastructure: this.nameInfrastructure,
      infrastructure_id:
        this.thresholdPreferencesForm.get("threshold_infrastructure").value,

      lower_threshold: this.numeral(
        Number(
          this.thresholdPreferencesForm
            .get("lower_threshold")
            .value.toString()
            .replace(/\./g, "")
            .replace(",", ".")
        )
      ).format("0,0.[000000000000]"),
      upper_threshold: this.numeral(
        Number(
          this.thresholdPreferencesForm
            .get("upper_threshold")
            .value.toString()
            .replace(/\./g, "")
            .replace(",", ".")
        )
      ).format("0,0.[000000000000]"),
      //currency: this.parametersForm.get("currency").value,
      //contract_id: this.id,
    });
    //}

    //document.querySelector("revo-grid").source = [];
    //document.querySelector("revo-grid").source = this.threshold_rows;

    document
      .querySelectorAll("revo-grid")
      .forEach((element) => {
        if (element.id == "revogridThresholdPreferences") {
          element.source = [];
          element.source = this.rowsThresholdPreferences;
        }
      });

  }



  add() {
    if (this.workflowForm.valid) {

      if (this.action == "Add") {

        this.loading = true;

        function pad(num) {
          num = num.toString();

          while (num.length === 1) num = "0" + num;
          return num;
        }


        var start_time =
          pad(this.workflowForm.get("startTime").value.getHours()) +
          ":" +
          pad(this.workflowForm.get("startTime").value.getMinutes());

        var end_time =
          pad(this.workflowForm.get("endTime").value.getHours()) +
          ":" +
          pad(this.workflowForm.get("endTime").value.getMinutes());

        var rowsAP: any = [];
        document
          .querySelectorAll("revo-grid")
          .forEach((element) => {
            if (element.id == "revogridActionPreferences") {
              element.getSource().then((value) => {
                if (value.length != 0) {
                  value.map((x) => {
                    if (x["priority"] != null) {
                      x["priority"] = Number(
                        x["priority"]
                          .toString()
                          .replace(/\./g, "")
                          .replace(",", ".")
                      );
                    }
                    if (x["limit"] != null) {
                      x["limit"] = Number(
                        x["limit"]
                          .toString()
                          .replace(/\./g, "")
                          .replace(",", ".")
                      );
                    }
                    return x
                  })
                  rowsAP.push(...value);

                }

              })
            }
          });

        var rowsTP: any = [];
        document
          .querySelectorAll("revo-grid")
          .forEach((element) => {
            if (element.id == "revogridThresholdPreferences") {
              element.getSource().then((value) => {
                if (value.length != 0) {
                  value.map((x) => {
                    if (x["lower_threshold"] != null) {
                      x["lower_threshold"] = Number(
                        x["lower_threshold"]
                          .toString()
                          .replace(/\./g, "")
                          .replace(",", ".")
                      );
                    }
                    if (x["upper_threshold"] != null) {
                      x["upper_threshold"] = Number(
                        x["upper_threshold"]
                          .toString()
                          .replace(/\./g, "")
                          .replace(",", ".")
                      );
                    }
                    return x
                  })

                  rowsTP.push(...value);
                }

              })
            }
          });

        const object = {
          active: Boolean(this.workflowForm.get("active").value),
          label: this.workflowForm.get("label").value,
          country: this.workflowForm.get("country_code").value,
          balance_zone_id: this.workflowForm.get("balance_zone_id").value,
          legal_entity_id: this.workflowForm.get("legal_entity").value,
          periodicity: Number(this.workflowForm.get("periodicity").value),
          daily_start_time: start_time,
          daily_end_time: end_time,
          error_message: this.workflowForm.get("errorMessage").value,

          workflow_action_preferences: rowsAP,
          workflow_thresholds: rowsTP,
        };



        this.apiWorkflow.addWorkflowConfiguration(object).subscribe({
          next: (res) => {
            this.messageService.showToast(
              "success",
              "Success",
              "Workflow added successfully!"
            );
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while adding workflow" 
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }

          },
        })
          .add(() => {
            this.loading = false;
            this.ref.close("save");
          });

      }

      else {
        // Call the update method if action is not "Add"
        this.update();
      }
    }
  }
  stringToBoolean (value) { 
    if (typeof(value) === 'boolean')
      return value
    return value ==="true"; 
  }
  update() {
    this.loading = true;

        function pad(num) {
          num = num.toString();

          while (num.length === 1) num = "0" + num;
          return num;
        }


        var start_time =
          pad(this.workflowForm.get("startTime").value.getHours()) +
          ":" +
          pad(this.workflowForm.get("startTime").value.getMinutes());

        var end_time =
          pad(this.workflowForm.get("endTime").value.getHours()) +
          ":" +
          pad(this.workflowForm.get("endTime").value.getMinutes());

        var rowsAP: any = [];
        document
          .querySelectorAll("revo-grid")
          .forEach((element) => {
            if (element.id == "revogridActionPreferences") {
              element.getSource().then((value) => {
                if (value.length != 0) {
                  value.map((x) => {
                    if (x["priority"] != null) {
                      x["priority"] = Number(
                        x["priority"]
                          .toString()
                          .replace(/\./g, "")
                          .replace(",", ".")
                      );
                    }
                    if (x["limit"] != null) {
                      x["limit"] = Number(
                        x["limit"]
                          .toString()
                          .replace(/\./g, "")
                          .replace(",", ".")
                      );
                    }
                    return x
                  })
                  rowsAP.push(...value);

                }

              })
            }
          });

        var rowsTP: any = [];
        document
          .querySelectorAll("revo-grid")
          .forEach((element) => {
            if (element.id == "revogridThresholdPreferences") {
              element.getSource().then((value) => {
                if (value.length != 0) {
                  value.map((x) => {
                    if (x["lower_threshold"] != null) {
                      x["lower_threshold"] = Number(
                        x["lower_threshold"]
                          .toString()
                          .replace(/\./g, "")
                          .replace(",", ".")
                      );
                    }
                    if (x["upper_threshold"] != null) {
                      x["upper_threshold"] = Number(
                        x["upper_threshold"]
                          .toString()
                          .replace(/\./g, "")
                          .replace(",", ".")
                      );
                    }
                    return x
                  })

                  rowsTP.push(...value);
                }

              })
            }
          });

        const object = {
          id: this.id,
          active: this.stringToBoolean(this.workflowForm.get("active").value),
          label: this.workflowForm.get("label").value,
          country: this.workflowForm.get("country_code").value,
          balance_zone_id: this.workflowForm.get("balance_zone_id").value,
          legal_entity_id: this.workflowForm.get("legal_entity").value,
          periodicity: Number(this.workflowForm.get("periodicity").value),
          daily_start_time: start_time,
          daily_end_time: end_time,
          error_message: this.workflowForm.get("errorMessage").value,

          workflow_action_preferences: rowsAP,
          workflow_thresholds: rowsTP,
        };


        this.apiWorkflow.updateWorkflowConfiguration(object).subscribe({
          next: (res) => {
            this.messageService.showToast(
              "success",
              "Success",
              "Workflow added successfully!"
            );
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while adding workflow" 
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }

          },
        })
          .add(() => {
            this.loading = false;
            this.ref.close("save");
          });




  }
}
