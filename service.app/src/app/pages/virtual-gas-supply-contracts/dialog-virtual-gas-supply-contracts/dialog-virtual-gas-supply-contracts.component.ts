import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { CountryService } from "../../../@core/services/country.service";
import { LegalEntityService } from "../../../@core/services/legalEntity.service";
import { messageService } from "../../../@core/utils/messages";

import { BalanceZoneService } from "../../../@core/services/balanceZone.service";
import { DatePipe } from "@angular/common";
import * as moment from "moment";

import { NbDialogRef, NbDialogService } from "@nebular/theme";
import { ThirdPartyContractsService } from "../../../@core/services/thirdPartyContracts.service";
import { LogisticElementService } from "../../../@core/services/logisticElement.service";
import { ConnectionPointService } from "../../../@core/services/connectionPoint.service";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";
import { CurrencyService } from "../../../@core/services/currency.service";
import { LogisticElementType } from "../../../@core/schemas/logisticElementType";
import { eachDayOfInterval } from 'date-fns';
import { VesselService } from "../../../@core/services/vessel.service";
import { JobsService } from "../../../@core/services/jobs.service";
import { DialogConfirmationComponent } from "../../../@theme/components/confirmation-dialog/dialog-confirmation-delete.component";
import { MarketDataService } from "../../../@core/services/marketData.service";
import { MeasurementUnit } from "../../../@core/schemas/measurementUnit";
import { DarkModeService } from "../../../@core/services/sharedServices/darkMode.service";

@Component({
  selector: "ngx-dialog-virtual-gas-supply-contracts",
  templateUrl: "./dialog-virtual-gas-supply-contracts.component.html",
  styleUrls: ["./dialog-virtual-gas-supply-contracts.component.scss"],
})
export class DialogVirtualGasSupplyContractsComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() id: number;
  @Input() label: string;
  @Input() name: string;
  @Input() formalization_date: string;
  @Input() status: string;
  @Input() owner: string;
  @Input() venue_type: string;
  @Input() market: string;
  @Input() market_ccp: string;
  @Input() counterparty: string;
  @Input() counterparty_label: string;
  @Input() operation_type: string;
  @Input() broker_label: string;
  @Input() product: string;
  @Input() start_date: string;
  @Input() end_date: string;
  @Input() quantity: string;
  @Input() uom: string;
  @Input() price: string;
  @Input() price_index: string;
  @Input() currency: string;
  @Input() broker: string;
  @Input() supply_contract_type: string;
  @Input() source_infrastructure_id: string;
  @Input() internal_mirrored: string;
  loading = false;
  contractForm!: FormGroup;
  statusOptions: any;
  contractTypeOptions: any;
  PSOptions: any;
  hubOptions: any;
  productOptions: any;
  deliveryTypeOptions: any;
  contractScheduleForm!: FormGroup;

  entitiesOptions: any;
  entitiesOptions2: any;
  entitiesOptions3: any;
  errorLegalEntity = false;
  errorLegalEntity2 = false;
  errorLegalEntity3 = false;
  countriesOptions: any;
  measureUnitOptions: any;
  columns: any;
  rows = [];
  zoneOptions: any;
  errorBalanceZone = false;
  deliveryPointTypeOptions: any;
  deliveryPointOptions: any;
  errorDeliveryPoint = false;
  errorDateRangeSchedule = false;
  errorDateRangePeriod = false;
  totalQuantityMbtuValid = false;
  totalQuantityKwhValid = false;
  labelSource: any;
  labelVessel: any;
  eventTimes = [];
  errorDa;
  vesselOptions: any;
  sourceLocationOptions: any;
  logisticElementOptions: any;
  validateRevogrid: boolean;
  labelDeliveryPoint = "";
  settings = {
    singleSelection: true,
    text: "",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    enableSearchFilter: true,
    position: "bottom",
    autoPosition: false,
  };
  logisticElementsTypeOptions: any;
  errorLogisticElement = false;
  exportOptions = [
    /*    {
      id: "csv",
      label: "CSV",
    }, */
    {
      id: "xlsx",
      label: "EXCEL",
    },
    {
      id: "xml",
      label: "XML",
    },
  ];
  revogridTheme: string;
  numeral = NumberColumnType.getNumeralInstance();
  marketOptions: any;
  errorMarket: boolean;
  eventTimes1 = [];
  constructor(
    private formBuilder: FormBuilder,
    private apiLegalEntity: LegalEntityService,
    private messageService: messageService,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
    public datepipe: DatePipe,
    protected ref: NbDialogRef<DialogVirtualGasSupplyContractsComponent>,
    private apiThirdPartyContract: ThirdPartyContractsService,
    private apiLogisticElement: LogisticElementService,
    private apiConnectionPoint: ConnectionPointService,
    private excelService: ExcelService,
    private apiCurrency: CurrencyService,
    private apiVessel: VesselService,
    private apiJobs: JobsService,
    private dialogService: NbDialogService,
    private apiMarket: MarketDataService,
    private darkModeService: DarkModeService
  ) {
    this.getVessels();
    this.getSourceLocations();
    this.getCountries();
    this.deliveryPointTypeOptions = ["logistic_element", "connection_point"];
    this.getLegalEntities();
    this.getProducts();
    this.getMarkets();
    this.getInternationalConnectionPoints("international_connection");
    this.getCurrencies();
    this.measureUnitOptions = Object.values(MeasurementUnit);

    // this.deliveryPointOptions = [{ id: 1, label: 'TVB' }, { id: 2, label: 'PVB' }];
  }

  ngOnInit(): void {
    this.numeral.locale("es");
    this.darkModeService.isDarkMode == true
      ? (this.revogridTheme = "darkMaterial")
      : (this.revogridTheme = "material");
    this.darkModeService.darkModeChange.subscribe((value) => {
      value == true
        ? (this.revogridTheme = "darkMaterial")
        : (this.revogridTheme = "material");
    });
    this.contractForm = this.formBuilder.group({
      id: new FormControl(""),
      trade_id: new FormControl("", [
        Validators.pattern(
          /^[+-]?([1-9]{1}[0-9]{0,0}(\.\d{3})*(\,\d{0,0})?|[1-9]{1}\d{0,}(\,\d{0,0})?|0(\,\d{0,0})?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d{0,0}(\.\d{3})*(\,\d{0,0})?|[1-9]{1}\d{0,}(\,\d{0,0})?|0(\,\d{0,0})?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d{0,0}(\.\d{3})*(\,\d{0,0})?|[1-9]{1}\d{0,}(\,\d{0,0})?|0(\,\d{0,0})?|(\,\d{1,2}))\)$/
        ),
        Validators.min(0),
      ]),
      trade_date: new FormControl("", Validators.required),
      name: new FormControl(""),

      legal_entity: new FormControl("", Validators.required),
      contract_type: new FormControl("", Validators.required),
      counterparty: new FormControl(""),
      p_s: new FormControl("", Validators.required),
      product: new FormControl("", Validators.required),
      source_infrastructure_id: new FormControl(null),
      deliveryPeriod: new FormControl("", [
        Validators.required,
        this.dateRangeValidatorPeriod,
      ]),

      quantity: new FormControl("", [
        Validators.pattern(
          /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/
        ),
      ]),
      uom: new FormControl("", Validators.required),
      market: new FormControl(""),
      broker: new FormControl(""),
    });
    this.contractScheduleForm = this.formBuilder.group({
      date: new FormControl("", [
        Validators.required,
        this.dateRangeValidatorSchedule,
      ]),
      delivery_point_type: new FormControl("", Validators.required),
      element_type: new FormControl("", Validators.required),
      country_code: new FormControl("", Validators.required),
      balancing_zone: new FormControl("", Validators.required),
      delivery_point: new FormControl("", Validators.required),
      /*       vessel: new FormControl("", Validators.required),
      source_location: new FormControl("", Validators.required), */
    });

    this.contractTypeOptions = ["OTC", "Exchange"];
    this.PSOptions = ["Purchase", "Sell"];

    if (this.action == "Add") {
      this.totalQuantityMbtuValid = true;
      this.totalQuantityKwhValid = true;
      this.validateRevogrid = true;
      this.columns = [
        {
          prop: "op_date",
          name: "Date",
          size: 100 + Number(String("Date").length) * 3,
          sortable: true,
          order: "asc",
          readonly: true,
        },
        {
          prop: "delivery_point_type",
          name: "Element Type",
          size: 100 + Number(String("Element Type").length) * 10,
          readonly: true,
        },
        {
          prop: "delivery_point",
          name: "Delivery Point",
          size: 100 + Number(String("elivery Point").length) * 3,
          readonly: true,
        },
        {
          prop: "quantity_mmbtu",
          name: "Quantity (MMbtu)",
          size: 100 + Number(String("Quantity (MMbtu)").length) * 3,
          cellProperties: ({ prop, model, data, column }) => {
            return {
              class: {
                numeric: true,
              },
            };
          },
        },
        {
          prop: "quantity",
          name: "Quantity (Kwh)",
          size: 100 + Number(String("Quantity (Kwh)").length) * 3,
          cellProperties: ({ prop, model, data, column }) => {
            return {
              class: {
                numeric: true,
              },
            };
          },
        },

        {
          readonly: true,
          size: 90,
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
    } else if (this.action == "Update") {
      this.contractForm.get("id").setValue(this.id);
      this.contractForm.get("name").setValue(this.name);
      this.contractForm.get("trade_id").setValue(this.label);
      this.contractForm.get("product").setValue(this.product);
      if (this.source_infrastructure_id) {
        this.contractForm
          .get("source_infrastructure_id")
          .setValue(this.source_infrastructure_id);
      }
      if (this.start_date && this.end_date) {
        this.contractForm.get("deliveryPeriod").setValue({
          start: new Date(
            Number(this.start_date.split("-")[0]),
            Number(this.start_date.split("-")[1]) - 1,
            Number(this.start_date.split("-")[2])
          ),
          end: new Date(
            Number(this.end_date.split("-")[0]),
            Number(this.end_date.split("-")[1]) - 1,
            Number(this.end_date.split("-")[2])
          ),
        });
      }

      this.contractForm.get("p_s").setValue(this.operation_type);
      this.contractForm
        .get("quantity")
        .setValue(this.numeral(this.quantity).format("0,0.[0000000000]"));
      this.contractForm.get("uom").setValue(this.uom);

      this.contractForm.get("legal_entity").setValue(this.owner);

      this.contractForm.get("contract_type").setValue(this.venue_type);
      this.contractForm.get("market").setValue(this.market);

      if (this.formalization_date) {
        this.contractForm
          .get("trade_date")
          .setValue(
            new Date(
              Number(this.formalization_date.split("-")[0]),
              Number(this.formalization_date.split("-")[1]) - 1,
              Number(this.formalization_date.split("-")[2].split("T")[0]),
              Number(
                this.formalization_date
                  .split("-")[2]
                  .split("T")[1]
                  .split(":")[0]
              ),
              Number(
                this.formalization_date
                  .split("-")[2]
                  .split("T")[1]
                  .split(":")[1]
              ),
              Number(
                this.formalization_date
                  .split("-")[2]
                  .split("T")[1]
                  .split(":")[2]
                  .replace("Z", "")
              )
            )
          );
      }

      this.validateRevogrid = true;
      if (this.contractForm.get("contract_type").value == "exchange") {
        this.contractForm.get("market").clearValidators();
        this.contractForm.get("market").setValidators(Validators.required);
        this.contractForm.get("market").updateValueAndValidity();
        this.contractForm.get("broker").clearValidators();
        this.contractForm.get("broker").setValidators(Validators.required);
        this.contractForm.get("broker").updateValueAndValidity();
        this.contractForm.get("counterparty").clearValidators();
        this.contractForm.get("counterparty").updateValueAndValidity();
      } else if (this.contractForm.get("contract_type").value == "otc") {
        this.contractForm.get("market").clearValidators();
        this.contractForm.get("market").updateValueAndValidity();
        this.contractForm.get("broker").clearValidators();
        this.contractForm.get("broker").updateValueAndValidity();
        this.contractForm.get("counterparty").clearValidators();
        this.contractForm
          .get("counterparty")
          .setValidators(Validators.required);
        this.contractForm.get("counterparty").updateValueAndValidity();
      }

      this.columns = [
        {
          prop: "op_date",
          name: "Date",
          size: 100 + Number(String("Date").length) * 3,
          sortable: true,
          order: "asc",
          readonly: true,
        },
        {
          prop: "delivery_point_type",
          name: "Element Type",
          size: 100 + Number(String("Element Type").length) * 10,
          readonly: true,
        },
        {
          prop: "delivery_point",
          name: "Delivery Point",
          size: 100 + Number(String("elivery Point").length) * 3,
          readonly: true,
        },
        {
          prop: "quantity_mmbtu",
          name: "Quantity (MMbtu)",
          size: 100 + Number(String("Quantity (MMbtu)").length) * 3,
          cellProperties: ({ prop, model, data, column }) => {
            return {
              class: {
                numeric: true,
              },
            };
          },
        },
        {
          prop: "quantity",
          name: "Quantity (Kwh)",
          size: 100 + Number(String("Quantity (Kwh)").length) * 3,
          cellProperties: ({ prop, model, data, column }) => {
            return {
              class: {
                numeric: true,
              },
            };
          },
        },

        {
          readonly: true,
          size: 90,
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

      this.getOperations(this.id);
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object = JSON.parse(localStorage.getItem("settings_parameters"));
        this.contractScheduleForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.contractScheduleForm
          .get("balancing_zone")
          .setValue(object["balancing_zone"]);
        this.getbalanceZones(object["country_code"]);
      }
      this.contractForm.get("product").enable();
      this.contractForm.get("source_infrastructure_id").enable();
    } else if (this.action == "View") {
      this.contractForm.get("name").setValue(this.name);
      this.contractForm.get("trade_id").setValue(this.label);
      this.contractForm.get("product").setValue(this.product);
      if (this.source_infrastructure_id) {
        this.contractForm
          .get("source_infrastructure_id")
          .setValue(this.source_infrastructure_id);
      }
      if (this.start_date && this.end_date) {
        this.contractForm.get("deliveryPeriod").setValue({
          start: new Date(
            Number(this.start_date.split("-")[0]),
            Number(this.start_date.split("-")[1]) - 1,
            Number(this.start_date.split("-")[2])
          ),
          end: new Date(
            Number(this.end_date.split("-")[0]),
            Number(this.end_date.split("-")[1]) - 1,
            Number(this.end_date.split("-")[2])
          ),
        });
      }

      this.contractForm.get("p_s").setValue(this.operation_type);
      this.contractForm.get("quantity").setValue(this.quantity);
      this.contractForm.get("uom").setValue(this.uom);

      this.contractForm.get("legal_entity").setValue(this.owner);

      this.contractForm.get("contract_type").setValue(this.venue_type);
      this.contractForm.get("market").setValue(this.market);

      if (this.formalization_date) {
        this.contractForm
          .get("trade_date")
          .setValue(
            new Date(
              Number(this.formalization_date.split("-")[0]),
              Number(this.formalization_date.split("-")[1]) - 1,
              Number(this.formalization_date.split("-")[2].split("T")[0]),
              Number(
                this.formalization_date
                  .split("-")[2]
                  .split("T")[1]
                  .split(":")[0]
              ),
              Number(
                this.formalization_date
                  .split("-")[2]
                  .split("T")[1]
                  .split(":")[1]
              ),
              Number(
                this.formalization_date
                  .split("-")[2]
                  .split("T")[1]
                  .split(":")[2]
                  .replace("Z", "")
              )
            )
          );
      }

      this.columns = [
        {
          prop: "op_date",
          name: "Date",
          size: 100 + Number(String("Date").length) * 3,
          sortable: true,
          order: "asc",
          readonly: true,
        },
        {
          prop: "delivery_point_type",
          name: "Element Type",
          size: 100 + Number(String("Element Type").length) * 10,
          readonly: true,
        },
        {
          prop: "delivery_point",
          name: "Delivery Point",
          size: 100 + Number(String("elivery Point").length) * 3,
          readonly: true,
        },
        {
          prop: "quantity_mmbtu",
          name: "Quantity (MMbtu)",
          size: 100 + Number(String("Quantity (MMbtu)").length) * 3,
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
          prop: "quantity",
          name: "Quantity (Kwh)",
          size: 100 + Number(String("Quantity (Kwh)").length) * 3,
          readonly: true,
          cellProperties: ({ prop, model, data, column }) => {
            return {
              class: {
                numeric: true,
              },
            };
          },
        },
      ];

      this.contractForm.disable();
      this.getOperations(this.id, "view");
    }
  }

  private dateRangeValidatorSchedule: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date =
      this.contractScheduleForm && this.contractScheduleForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.contractScheduleForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.contractScheduleForm.get("date").value.end,
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
    }

    if (invalid == true) {
      this.errorDateRangeSchedule = true;
    } else {
      this.errorDateRangeSchedule = false;
    }

    return invalid
      ? {
          invalidRange: {},
        }
      : null;
  };
  private dateRangeValidatorPeriod: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date =
      this.contractForm && this.contractForm.get("deliveryPeriod").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.contractForm.get("deliveryPeriod").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.contractForm.get("deliveryPeriod").value.end,
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
    }

    if (invalid == true) {
      this.errorDateRangePeriod = true;
    } else {
      this.errorDateRangePeriod = false;
    }

    return invalid
      ? {
          invalidRange: {},
        }
      : null;
  };
  cancel() {
    this.ref.close();
  }
  add() {
    if (this.contractForm.valid) {
      /*     this.loading = true; */
      var object = {
        id: this.id ? this.id : null,
        label: this.contractForm.get("trade_id").value
          ? this.contractForm.get("trade_id").value
          : null,
        name: this.contractForm.get("name").value
          ? this.contractForm.get("name").value
          : null,
        formalization_date:
          new Date(
            new Date(this.contractForm.get("trade_date").value)
              .toString()
              .replace(/GMT.*$/, "GMT+0000")
          )
            .toISOString()
            .split(".")[0] + "Z",
        owner_id: this.contractForm.get("legal_entity").value
          ? this.contractForm.get("legal_entity").value
          : null,
        venue_type: this.contractForm.get("contract_type").value
          ? this.contractForm.get("contract_type").value
          : null,
        operation_type: this.contractForm.get("p_s").value
          ? this.contractForm.get("p_s").value
          : null,
        market_id: this.contractForm.get("market").value
          ? this.contractForm.get("market").value
          : null,
        broker_id: this.contractForm.get("broker").value
          ? this.contractForm.get("broker").value[0].id
          : null,
        counterparty_id: this.contractForm.get("counterparty").value
          ? this.contractForm.get("counterparty").value[0].id
          : null,
        start_date: this.contractForm.get("deliveryPeriod").value
          ? this.datepipe.transform(
              this.contractForm.get("deliveryPeriod").value.start,
              "yyyy-MM-dd"
            )
          : null,
        end_date: this.contractForm.get("deliveryPeriod").value
          ? this.datepipe.transform(
              this.contractForm.get("deliveryPeriod").value.end,
              "yyyy-MM-dd"
            )
          : null,
        product: this.contractForm.get("product").value,
        source_infrastructure_id: this.contractForm.get(
          "source_infrastructure_id"
        ).value,
        quantity: this.contractForm.get("quantity").value
          ? Number(
              this.contractForm
                .get("quantity")
                .value.toString()
                .replace(/\./g, "")
                .replace(",", ".")
            )
          : null,
        uom: this.contractForm.get("uom").value
          ? this.contractForm.get("uom").value
          : null,
      };

      if (this.action == "Add") {
        this.apiThirdPartyContract
          .addThirdPartyContractVirtual(
            "third_party_purchase_sale",
            this.clean(object)
          )
          .subscribe({
            next: (res) => {
              this.messageService.showToast(
                "success",
                "Success",
                "Virtual purchase/sale contract added succesfully!"
              );
              this.ref.close("save");
              document
                .querySelector("revo-grid")
                .getSource()
                .then((value) => {
                  if (value.length != 0) {
                    value.map((x) => {
                      if (x["quantity"] != null) {
                        x["quantity"] = Number(
                          x["quantity"]
                            .toString()
                            .replace(/\./g, "")
                            .replace(",", ".")
                        );
                      }
                      if (x["quantity_mmbtu"] != null) {
                        x["quantity_mmbtu"] = Number(
                          x["quantity_mmbtu"]
                            .toString()
                            .replace(/\./g, "")
                            .replace(",", ".")
                        );
                      }
                      x["contract_id"] = this.id;
                      delete x["delivery_point"];
                    });
                    var valuesWithoutZero = value.filter(
                      (item) =>
                        item["quantity"] != 0 || item["quantity_mmbtu"] != 0
                    );
                    this.apiThirdPartyContract
                      .setThirdPartyOperationsVirtual(
                        res["id"],
                        valuesWithoutZero
                      )
                      .subscribe({
                        next: (res) => {
                          this.ref.close("save");

                          this.messageService.showToast(
                            "success",
                            "Success",
                            res
                          );
                        },
                        error: (e) => {
                          this.ref.close();
                          if (e.error.title == "Internal Server Error") {
                            this.messageService.showToast(
                              "danger",
                              "Error",
                              "Internal server error while updating scheduling"
                            );
                          } else {
                            this.messageService.showToast(
                              "danger",
                              "Error",
                              e.error
                            );
                          }
                        },
                      });
                  }
                });
            },
            error: (e) => {
              this.ref.close();
              if (e.error.title == "Internal Server Error") {
                this.messageService.showToast(
                  "danger",
                  "Error",
                  "Internal server error while adding virtual purchase/sale scheduling"
                );
              } else {
                this.messageService.showToast("danger", "Error", e.error);
              }
            },
          });
      } else {
        this.update(object);
      }
    }
  }

  update(object) {
    this.apiThirdPartyContract
      .updateThirdPartyContractVirtual(
        "third_party_purchase_sale",
        this.clean(object)
      )
      .subscribe({
        next: (res) => {
          this.messageService.showToast(
            "success",
            "Success",
            "Virtual purchase/sale contract added succesfully!"
          );
          document
            .querySelector("revo-grid")
            .getSource()
            .then((value) => {
              if (value.length != 0) {
                value.map((x) => {
                  if (x["quantity"] != null) {
                    x["quantity"] = Number(
                      x["quantity"]
                        .toString()
                        .replace(/\./g, "")
                        .replace(",", ".")
                    );
                  }
                  if (x["quantity_mmbtu"] != null) {
                    x["quantity_mmbtu"] = Number(
                      x["quantity_mmbtu"]
                        .toString()
                        .replace(/\./g, "")
                        .replace(",", ".")
                    );
                  }
                  x["contract_id"] = this.id;
                  delete x["delivery_point"];
                });
                var valuesWithoutZero = value.filter(
                  (item) => item["quantity"] != 0 || item["quantity_mmbtu"] != 0
                );
                this.apiThirdPartyContract
                  .setThirdPartyOperationsVirtual(this.id, valuesWithoutZero)
                  .subscribe({
                    next: (res) => {
                      this.ref.close("update");

                      this.messageService.showToast("success", "Success", res);
                    },
                    error: (e) => {
                      this.ref.close();
                      if (e.error.title == "Internal Server Error") {
                        this.messageService.showToast(
                          "danger",
                          "Error",
                          "Internal server error while updating scheduling"
                        );
                      } else {
                        this.messageService.showToast(
                          "danger",
                          "Error",
                          e.error
                        );
                      }
                    },
                  });
              }
            });
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting spot scheduling"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
  }

  getCurrencies() {
    this.apiCurrency.getCurrencies().subscribe({
      next: (res) => {},
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting currencies"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  getOperations(id, view?) {
    this.apiThirdPartyContract
      .getThirdPartyOperationsVirtual(id)
      .subscribe({
        next: (res) => {
          this.rows = res;
          document.querySelector("revo-grid").source = this.rows;
          document.querySelector("revo-grid").useClipboard = true;
          this.rows.map((x) => {
            x["quantity_mmbtu"] = this.numeral(x["quantity_mmbtu"]).format(
              "0,0.[0000]"
            );
            x["quantity"] = this.numeral(x["quantity"]).format("0,0.[0000]");
          });
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting spot scheduling"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        if (view) {
          this.totalQuantityMbtuValid = true;
          this.totalQuantityKwhValid = true;
        } else {
        }
        setTimeout(() => {
          document
            .querySelectorAll("revo-grid")
            .forEach((element) => (element.resize = true));
          document
            .querySelectorAll("revo-grid")
            .forEach((element) => (element.autoSizeColumn = true));
        }, 100);
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
  onChangeCountry($event) {
    this.getbalanceZones(this.contractScheduleForm.get("country_code").value);
    this.contractScheduleForm.controls["balancing_zone"].setValue("");
  }
  onChangeZone($event) {
    this.contractScheduleForm.controls["delivery_point"].setValue("");
    if (
      this.contractScheduleForm.get("delivery_point_type").value &&
      this.contractScheduleForm.get("element_type").value
    ) {
      this.getDeliveryPoint(
        this.contractScheduleForm.get("balancing_zone").value,
        this.contractScheduleForm.get("delivery_point_type").value,
        this.contractScheduleForm.get("element_type").value
      );
    }
    if (this.contractScheduleForm.get("delivery_point_type").value) {
      this.getElementsTypes(
        this.contractScheduleForm.get("delivery_point_type").value
      );
    }
  }
  onChangeDeliveryPointType($event) {
    /* this.contractScheduleForm.controls["delivery_point"].setValue("");

    this.deliveryPointOptions = [];
    if (this.contractScheduleForm.get("balancing_zone").value) {
      this.getDeliveryPoint(
        this.contractScheduleForm.get("balancing_zone").value,
        this.contractScheduleForm.get("delivery_point_type").value
      );
    } */
    this.deliveryPointOptions = [];
    this.logisticElementsTypeOptions = [];
    this.contractScheduleForm.get("delivery_point").setValue("");
    this.contractScheduleForm.get("element_type").setValue("");
    if (this.contractScheduleForm.get("balancing_zone").value) {
      this.getElementsTypes($event);
    }
  }
  onChangeElementType($event) {
    this.contractScheduleForm.controls["delivery_point"].setValue("");

    this.deliveryPointOptions = [];
    if (
      this.contractScheduleForm.get("balancing_zone").value &&
      this.contractScheduleForm.get("delivery_point_type").value
    ) {
      this.getDeliveryPoint(
        this.contractScheduleForm.get("balancing_zone").value,
        this.contractScheduleForm.get("delivery_point_type").value,
        this.contractScheduleForm.get("element_type").value
      );
    }
  }
  onChangeDeliveryPoint($event) {
    let selectedValue = this.deliveryPointOptions.find(
      (item) => item.id === $event
    );

    this.labelDeliveryPoint = selectedValue.name;

    if (this.labelDeliveryPoint === undefined) {
      this.labelDeliveryPoint = selectedValue.label;
    }
  }
  onChangeContractType($event) {
    if ($event == "exchange") {
      this.contractForm.get("market").clearValidators();
      this.contractForm.get("market").setValidators(Validators.required);
      this.contractForm.get("market").updateValueAndValidity();
      this.contractForm.get("broker").clearValidators();
      this.contractForm.get("broker").setValidators(Validators.required);
      this.contractForm.get("broker").updateValueAndValidity();
      this.contractForm.get("counterparty").clearValidators();
      this.contractForm.get("counterparty").updateValueAndValidity();
    } else if ($event == "otc") {
      this.contractForm.get("market").clearValidators();
      this.contractForm.get("market").updateValueAndValidity();
      this.contractForm.get("broker").clearValidators();
      this.contractForm.get("broker").updateValueAndValidity();
      this.contractForm.get("counterparty").clearValidators();
      this.contractForm.get("counterparty").setValidators(Validators.required);
      this.contractForm.get("counterparty").updateValueAndValidity();
    }
  }
  getInternationalConnectionPoints(type) {
    this.apiConnectionPoint
      .getConnectionPointByTypeBalanceZone(1, type)
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
              "Internal server error while getting delivery points"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      });
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
    } else if (type == "connection_point") {
      this.apiConnectionPoint
        .getConnectionPointByTypeBalanceZone(zone, type1)
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
  addRow() {
    const start = new Date(this.contractScheduleForm.get("date").value.start);
    const end = new Date(this.contractScheduleForm.get("date").value.end);
    const dates = eachDayOfInterval({ start, end });

    for (let element in dates) {
      this.rows.push({
        op_date: this.datepipe.transform(dates[element], "yyyy-MM-dd"),
        delivery_point_type:
          this.contractScheduleForm.get("element_type").value,
        delivery_point_id:
          this.contractScheduleForm.get("delivery_point").value,
        delivery_point: this.labelDeliveryPoint,
        quantity: 0,
        quantity_mmbtu: 0,
      });
    }

    document.querySelector("revo-grid").source = [];
    document.querySelector("revo-grid").source = this.rows;
  }
  doDelete(rowIndex) {
    document
      .querySelector("revo-grid")
      .getSource()
      .then((value) => {
        this.rows = value;
      })
      .finally(() => {
        this.rows.splice(rowIndex, 1);
        document.querySelector("revo-grid").source = [];

        document.querySelector("revo-grid").source = this.rows;

      });
  }
  submit() {
    /* 
        this.apiThirdPartyContract.submitPhysicalGasExchangesToTSO(this.id, this.datepipe.transform(this.submitcontractScheduleForm.get('date').value.start, "yyyy-MM-dd"), this.datepipe.transform(this.submitcontractScheduleForm.get('date').value.end, "yyyy-MM-dd")).subscribe({
            next: (res) => {
                this.messageService.showToast("success", "Success", res);

            },
            error: (e) => {
                if (e.error ?. title == "Internal Server Error") {
                    this.messageService.showToast("danger", "Error", "Internal server error while submit exchanges scheduling");
                } else {
                    this.messageService.showToast("danger", "Error", e.error);
                }
            }
        }); */
  }
  clean(obj) {
    for (var propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      }
    }
    return obj;
  }

  getVessels() {
    this.apiVessel.getVessels().subscribe({
      next: (res) => {
        this.vesselOptions = res;
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting vessels"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  getSourceLocations() {
    this.apiVessel.getSources().subscribe({
      next: (res) => {
        this.sourceLocationOptions = res;
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting sources"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  onAfterEdit({ detail }) {}
  onBeforeEditStart(e, { detail }) {
    this.eventTimes1.push("Called");
    if (this.eventTimes1.length == 1) {

     if(detail.val == ''){
      detail.val = detail.model[detail.prop].toString().replace(/\./g, "");
     } else {
      detail.val=detail.val
     }

    }
  }
  onBeforeEdit(e, { detail }) {
    this.validateRevogrid = true;

    this.eventTimes = [];
    if (detail.model !== undefined) {
      if (
        /^[+]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/.test(
          detail.val
        ) == false
      ) {
        this.validateRevogrid = false;
        e.preventDefault();
      } else {
        detail.val = this.numeral(
          Number(detail.val.toString().replace(/\./g, "").replace(",", "."))
        ).format("0,0.[0000000000]");
      }
    }
  }
  onBeforeRangeEdit(e, { detail }) {
    this.validateRevogrid = true;
    if (detail.models !== undefined) {
      for (const data in detail.data) {
        for (const prop in Object.keys(detail.data[data])) {
          var value = Object.values(detail.data[data])[prop].toString();

          if (
            /^[+]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/.test(
              value
            ) == false
          ) {
            this.validateRevogrid = false;
            e.preventDefault();
          } else {
            for (const key in detail.data) {
              if (detail.data.hasOwnProperty(key)) {
                for (const key1 in detail.data[key]) {
                  detail.data[key][key1] = this.numeral(
                    Number(
                      detail.data[key][key1]
                        .toString()
                        .replace(/\./g, "")
                        .replace(",", ".")
                    )
                  ).format("0,0.[0000000000]");
                }
              }
            }
          }
        }
      }
    }
  }
  validateTotalQuantity() {
    var total_quantity_mmbtu = 0;
    document
      .querySelector("revo-grid")
      .getSource()
      .then((value) => {
        value.map((x) => {
          total_quantity_mmbtu =
            total_quantity_mmbtu +
            Number(
              x["quantity_mmbtu"]
                .toString()
                .replace(/\./g, "")
                .replace(",", ".")
            );
        });
        if (total_quantity_mmbtu == 0) {
          this.totalQuantityMbtuValid = true;
        } else {
          this.totalQuantityMbtuValid = false;
        }
      });
    var total_quantity_kwh = 0;
    document
      .querySelector("revo-grid")
      .getSource()
      .then((value) => {
        value.map((x) => {
          total_quantity_kwh =
            total_quantity_kwh +
            Number(
              x["quantity"].toString().replace(/\./g, "").replace(",", ".")
            );
        });
        if (total_quantity_kwh == 0) {
          this.totalQuantityKwhValid = true;
        } else {
          this.totalQuantityKwhValid = false;
        }
      });
  }
  getElementsTypes(type) {
    if (
      type == "logistic_element" &&
      this.supply_contract_type != "vessel_supply"
    ) {
      this.logisticElementsTypeOptions = [];
      Object.values(LogisticElementType).map((x) => {
        this.logisticElementsTypeOptions.push(x);
      });
      var options = this.logisticElementsTypeOptions.filter(
        (item) => item != "regasification_plant"
      );
      this.logisticElementsTypeOptions = [];
      this.logisticElementsTypeOptions = options;
    } else if (
      type == "logistic_element" &&
      this.supply_contract_type == "vessel_supply"
    ) {
      this.logisticElementsTypeOptions = [];
      Object.values(LogisticElementType).map((x) => {
        this.logisticElementsTypeOptions.push(x);
      });
      var options = this.logisticElementsTypeOptions.filter(
        (item) => item == "regasification_plant"
      );
      this.logisticElementsTypeOptions = [];
      this.logisticElementsTypeOptions = options;
    } else if (
      type == "connection_point" &&
      this.supply_contract_type != "vessel_supply"
    ) {
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
          var options = this.logisticElementsTypeOptions.filter(
            (item) => item != "vessel_connection"
          );

          this.logisticElementsTypeOptions = [];
          this.logisticElementsTypeOptions = options;
        });
    } else if (
      type == "connection_point" &&
      this.supply_contract_type == "vessel_supply"
    ) {
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
          var options = this.logisticElementsTypeOptions.filter(
            (item) => item == "vessel_connection"
          );

          this.logisticElementsTypeOptions = [];
          this.logisticElementsTypeOptions = options;
        });
    }
  }

  getProducts() {
    this.apiThirdPartyContract.getPurchasesSalesContractsProducts().subscribe({
      next: (res) => {
        this.productOptions = res;
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting gas derivative contracts"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  getMarkets() {
    this.apiMarket.getMarkets().subscribe({
      next: (res) => {
        this.marketOptions = res;
        if (this.marketOptions.length == 0) {
          this.errorMarket = true;
        } else {
          this.errorMarket = false;
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
  getLegalEntities() {
    this.apiLegalEntity
      .getAllLegalEntitiesByCountry(null, "Internal")
      .subscribe({
        next: (res) => {
          this.entitiesOptions = res.sort((a, b) => (a.name > b.name ? 1 : -1));
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
    this.apiLegalEntity
      .getLegalEntities()
      .subscribe({
        next: (res) => {
          this.entitiesOptions2 = res.sort((a, b) =>
            a.name > b.name ? 1 : -1
          );
          this.entitiesOptions2.map((x) => {
            x["itemName"] = x["name"];
          });
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
        if (this.counterparty !== undefined) {
          this.contractForm
            .get("counterparty")
            .setValue([
              { id: this.counterparty, itemName: this.counterparty_label },
            ]);
        }
      });
    this.apiLegalEntity
      .getAllLegalEntitiesByCountry(null, "External")
      .subscribe({
        next: (res) => {
          this.entitiesOptions3 = res.sort((a, b) =>
            a.name > b.name ? 1 : -1
          );
          this.entitiesOptions3.map((x) => {
            x["itemName"] = x["name"];
          });
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
        if (this.broker !== undefined) {
          this.contractForm
            .get("broker")
            .setValue([{ id: this.broker, itemName: this.broker_label }]);
        }
      });
  }
  onChangeSource($event) {
    let selectedValue = this.sourceLocationOptions.find(
      (item) => item.id === $event
    );

    this.labelSource = selectedValue.name;
  }
  onChangeVessel($event) {
    let selectedValue = this.vesselOptions.find((item) => item.id === $event);

    this.labelVessel = selectedValue.name;
  }
}
