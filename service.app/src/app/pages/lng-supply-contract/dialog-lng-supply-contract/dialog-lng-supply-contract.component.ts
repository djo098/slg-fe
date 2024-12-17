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

import { NbDialogRef } from "@nebular/theme";
import { ThirdPartyContractsService } from "../../../@core/services/thirdPartyContracts.service";
import { LogisticElementService } from "../../../@core/services/logisticElement.service";
import { ConnectionPointService } from "../../../@core/services/connectionPoint.service";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";
import { CurrencyService } from "../../../@core/services/currency.service";
import { LogisticElementType } from "../../../@core/schemas/logisticElementType";
import { eachDayOfInterval } from 'date-fns';
import { VesselService } from "../../../@core/services/vessel.service";
@Component({
  selector: 'ngx-dialog-lng-supply-contract',
  templateUrl: './dialog-lng-supply-contract.component.html',
  styleUrls: ['./dialog-lng-supply-contract.component.scss']
})
export class DialogLNGSupplyContractComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() id: number;
  @Input() label: string;
  @Input() formalization_date: string;
  @Input() registration_date: string;
  @Input() status: string;
  @Input() owner: string;
  @Input() venue_type: string;
  @Input() market: string;
  @Input() counterparty: string;
  @Input() operation_type: string;
  @Input() hub: string;
  @Input() product: string;
  @Input() start_date: string;
  @Input() end_date: string;
  @Input() quantity: string;
  @Input() uom: string;
  @Input() price: string;
  @Input() price_index: string;
  @Input() currency: string;
  loading = false;
  lngsupplyForm!: FormGroup;
  statusOptions: any;
  contractTypeOptions: any;
  PSOptions: any;
  hubOptions: any;
  productOptions: any;
  deliveryTypeOptions: any;
  lngsupplyScheduleForm!: FormGroup;

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
  eventTimes = [];
  labelSource : any;
  labelVessel : any;
  errorDa;
  vesselOptions: any;
  sourceLocationOptions: any;

  validateRevogrid: boolean;
  labelDeliveryPoint = "";

  logisticElementsTypeOptions: any;
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
  numeral = NumberColumnType.getNumeralInstance();
  constructor(
    private formBuilder: FormBuilder,
    private apiLegalEntity: LegalEntityService,
    private messageService: messageService,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
    public datepipe: DatePipe,
    protected ref: NbDialogRef<DialogLNGSupplyContractComponent>,
    private apiThirdPartyContract: ThirdPartyContractsService,
    private apiLogisticElement: LogisticElementService,
    private apiConnectionPoint: ConnectionPointService,
    private excelService: ExcelService,
    private apiCurrency: CurrencyService,
    private apiVessel: VesselService
  ) {
    this.getVessels();
    this.getSourceLocations();
    this.getCountries();
    this.deliveryPointTypeOptions = ["logistic_element", "connection_point"];

    // this.deliveryPointOptions = [{ id: 1, label: 'TVB' }, { id: 2, label: 'PVB' }];
  }

  ngOnInit(): void {
    numeral.locale("es");
    this.lngsupplyForm = this.formBuilder.group({
      id: new FormControl(""),
      trade_id: new FormControl("", [
        Validators.required,
        Validators.pattern(
          /^[+-]?([1-9]{1}[0-9]{0,0}(\.\d{3})*(\,\d{0,0})?|[1-9]{1}\d{0,}(\,\d{0,0})?|0(\,\d{0,0})?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d{0,0}(\.\d{3})*(\,\d{0,0})?|[1-9]{1}\d{0,}(\,\d{0,0})?|0(\,\d{0,0})?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d{0,0}(\.\d{3})*(\,\d{0,0})?|[1-9]{1}\d{0,}(\,\d{0,0})?|0(\,\d{0,0})?|(\,\d{1,2}))\)$/
        ),
        Validators.min(0),
      ]),
      trade_date: new FormControl("", Validators.required),
      registration_date: new FormControl("", Validators.required),
      status: new FormControl("", Validators.required),
      legal_entity: new FormControl("", Validators.required),
      contract_type: new FormControl("", Validators.required),
      counterparty: new FormControl("", Validators.required),
      p_s: new FormControl("", Validators.required),
      hub: new FormControl("", Validators.required),
      product: new FormControl("", Validators.required),
      deliveryPeriod: new FormControl("", this.dateRangeValidatorPeriod),

      quantity: new FormControl("", [
        Validators.required,
        Validators.pattern(
          /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/
        ),
      ]),
      uom: new FormControl("", Validators.required),
      price: new FormControl("", [
        Validators.required,
        Validators.pattern(
          /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/
        ),
      ]),
      price_index: new FormControl("", Validators.required),
      currency: new FormControl("", Validators.required),
      market: new FormControl("", Validators.required),
    });
    this.lngsupplyScheduleForm = this.formBuilder.group({
      date: new FormControl("", [
        Validators.required,
        this.dateRangeValidatorSchedule,
      ]),
      delivery_point_type: new FormControl("", Validators.required),
      element_type: new FormControl("", Validators.required),
      country_code: new FormControl("", Validators.required),
      balancing_zone: new FormControl("", Validators.required),
      delivery_point: new FormControl("", Validators.required),
      vessel: new FormControl("", Validators.required),
      source_location: new FormControl("", Validators.required),
    });

    this.contractTypeOptions = ["OTC", "Exchange"];
    this.PSOptions = ["Purchase", "Sell"];
    this.statusOptions = ["In force", "Finished", "Cancelled"];
    this.lngsupplyForm.get("id").setValue(this.id);
    this.lngsupplyForm.get("trade_id").setValue(this.label);
    if (this.formalization_date) {
      this.lngsupplyForm
        .get("trade_date")
        .setValue(
          new Date(
            Number(this.formalization_date.split("-")[0]),
            Number(this.formalization_date.split("-")[1]) - 1,
            Number(this.formalization_date.split("-")[2].split("T")[0]),
            Number(
              this.formalization_date.split("-")[2].split("T")[1].split(":")[0]
            ),
            Number(
              this.formalization_date.split("-")[2].split("T")[1].split(":")[1]
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
    if (this.registration_date) {
      this.lngsupplyForm
        .get("registration_date")
        .setValue(
          new Date(
            Number(this.registration_date.split("-")[0]),
            Number(this.registration_date.split("-")[1]) - 1,
            Number(this.registration_date.split("-")[2].split("T")[0]),
            Number(
              this.registration_date.split("-")[2].split("T")[1].split(":")[0]
            ),
            Number(
              this.registration_date.split("-")[2].split("T")[1].split(":")[1]
            ),
            Number(
              this.registration_date
                .split("-")[2]
                .split("T")[1]
                .split(":")[2]
                .replace("Z", "")
            )
          )
        );
    }
    this.lngsupplyForm.get("status").setValue(this.status);
    this.lngsupplyForm.get("legal_entity").setValue(this.owner);
    this.lngsupplyForm.get("contract_type").setValue(this.venue_type);
    this.lngsupplyForm.get("market").setValue(this.market);
    this.lngsupplyForm.get("counterparty").setValue(this.counterparty);
    this.lngsupplyForm.get("p_s").setValue(this.operation_type);
    this.lngsupplyForm.get("hub").setValue(this.hub);
    this.lngsupplyForm.get("product").setValue(this.product);
    if (this.start_date && this.end_date) {
      this.lngsupplyForm.get("deliveryPeriod").setValue({
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
    this.lngsupplyForm
      .get("quantity")
      .setValue(this.numeral(this.quantity).format("0,0.[0000000000]"));
    this.lngsupplyForm.get("uom").setValue(this.uom);
    this.lngsupplyForm
      .get("price")
      .setValue(this.numeral(this.price).format("0,0.[0000000000]"));
    this.lngsupplyForm.get("price_index").setValue(this.price_index);
    this.lngsupplyForm.get("currency").setValue(this.currency);

    if (this.action == "Add") {
      this.totalQuantityMbtuValid = true;
      this.totalQuantityKwhValid = true;
      this.validateRevogrid = true;
    } else if (this.action == "Update") {
      this.validateRevogrid = true;
      if (this.lngsupplyForm.get("contract_type").value != "Exchange") {
        this.lngsupplyForm.get("market").clearValidators();
        this.lngsupplyForm.get("market").updateValueAndValidity();
      }

      this.columns = [
        {
          prop: "op_date",
          name: "Date",
          size: 130,
          readonly: true,
        },
        {
          prop: "delivery_point_type",
          name: "Element Type",
          size: 150,
          readonly: true,
        },
        {
          prop: "delivery_point",
          name: "Delivery Point",
          size: 130,
          readonly: true,
        },
        {
          prop: "quantity_mmbtu",
          name: "Quantity (MMbtu)",
          size: 130,
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
          size: 130,
          cellProperties: ({ prop, model, data, column }) => {
            return {
              class: {
                numeric: true,
              },
            };
          },
        },
        {
          prop: "vessel",
          name: "Vessel",
          size: 200,
          readonly: true,
        },
        {
          prop: "source",
          name: "Source Location",
          size: 200,
          readonly: true,
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

      this.lngsupplyForm.disable();
      this.getOperations(this.id);
      var object = localStorage.getItem('settings_parameters');
      if(object){
        object= JSON.parse(localStorage.getItem('settings_parameters'));
        this.lngsupplyScheduleForm.get('country_code').setValue(object['country_code']);
        this.lngsupplyScheduleForm.get('balancing_zone').setValue(object['balancing_zone']);
        this.getbalanceZones(object['country_code']);

      }
    } else if (this.action == "View") {
      if (this.lngsupplyForm.get("contract_type").value != "Exchange") {
        this.lngsupplyForm.get("market").clearValidators();
        this.lngsupplyForm.get("market").updateValueAndValidity();
      }

      this.columns = [
        {
          prop: "op_date",
          name: "Date",
          size: 150,
          readonly: true,
        },
        {
          prop: "delivery_point_type",
          name: "Element Type",
          size: 150,
          readonly: true,
        },
        {
          prop: "delivery_point",
          name: "Delivery Point",
          size: 150,
          readonly: true,
        },
        {
          prop: "quantity_mmbtu",
          name: "Quantity (MMbtu)",
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
          prop: "quantity",
          name: "Quantity (Kwh)",
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
          prop: "vessel",
          name: "Vessel",
          size: 200,
          readonly: true,
        },
        {
          prop: "source",
          name: "Source Location",
          size: 200,
          readonly: true,
        },
      ];
      this.lngsupplyForm.disable();
      this.getOperations(this.id, "view");
    }
  }

  private dateRangeValidatorSchedule: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date =
      this.lngsupplyScheduleForm && this.lngsupplyScheduleForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.lngsupplyScheduleForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.lngsupplyScheduleForm.get("date").value.end,
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
    const date = this.lngsupplyForm && this.lngsupplyForm.get("deliveryPeriod").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.lngsupplyForm.get("deliveryPeriod").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.lngsupplyForm.get("deliveryPeriod").value.end,
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

  update() {

    document
    .querySelector("revo-grid")
    .getSource()
    .then((value) => {
      if(value.length!=0){
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
     
        this.apiThirdPartyContract.setPurchasesSalesOperations(this.id,value) .subscribe({
          next: (res) => {
            this.ref.close("save");
            this.messageService.showToast(
              "success",
              "Success",
              "LNG Supply scheduling updated successfully!"
            );
          },
          error: (e) => {
            this.ref.close("save");
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while updating lngsupply scheduling"
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
 

  
  }
  getOperations(id, view?) {
    const numeral = NumberColumnType.getNumeralInstance();
    numeral.locale("es");
    this.apiThirdPartyContract
      .getPurchasesSalesOperations(id)
      .subscribe({
        next: (res) => {

          this.rows = res;
          document.querySelector("revo-grid").source = this.rows;
          document.querySelector("revo-grid").useClipboard = true;
          this.rows.map((x) => {
            x["quantity_mmbtu"] = numeral(x["quantity_mmbtu"]).format("0,0.[0000]");
            x["quantity"] = numeral(x["quantity"]).format("0,0.[0000]");
          });
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting lngsupply scheduling"
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
      
        }, 100)
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
    this.getbalanceZones(this.lngsupplyScheduleForm.get("country_code").value);
    this.lngsupplyScheduleForm.controls["balancing_zone"].setValue("");
  }
  onChangeZone($event) {
    this.lngsupplyScheduleForm.controls["delivery_point"].setValue("");
    if (
      this.lngsupplyScheduleForm.get("delivery_point_type").value &&
      this.lngsupplyScheduleForm.get("element_type").value
    ) {
      this.getDeliveryPoint(
        this.lngsupplyScheduleForm.get("balancing_zone").value,
        this.lngsupplyScheduleForm.get("delivery_point_type").value,
        this.lngsupplyScheduleForm.get("element_type").value
      );
    }
    if (this.lngsupplyScheduleForm.get("delivery_point_type").value) {
      this.getElementsTypes(
        this.lngsupplyScheduleForm.get("delivery_point_type").value
      );
    }
  }
  onChangeDeliveryPointType($event) {
    /* this.lngsupplyScheduleForm.controls["delivery_point"].setValue("");

    this.deliveryPointOptions = [];
    if (this.lngsupplyScheduleForm.get("balancing_zone").value) {
      this.getDeliveryPoint(
        this.lngsupplyScheduleForm.get("balancing_zone").value,
        this.lngsupplyScheduleForm.get("delivery_point_type").value
      );
    } */
    this.deliveryPointOptions = [];
    this.logisticElementsTypeOptions = [];
    this.lngsupplyScheduleForm.get("delivery_point").setValue("");
    this.lngsupplyScheduleForm.get("element_type").setValue("");
    if (this.lngsupplyScheduleForm.get("balancing_zone").value) {
      this.getElementsTypes($event);
    }
  }
  onChangeElementType($event) {
    this.lngsupplyScheduleForm.controls["delivery_point"].setValue("");

    this.deliveryPointOptions = [];
    if (
      this.lngsupplyScheduleForm.get("balancing_zone").value &&
      this.lngsupplyScheduleForm.get("delivery_point_type").value
    ) {
      this.getDeliveryPoint(
        this.lngsupplyScheduleForm.get("balancing_zone").value,
        this.lngsupplyScheduleForm.get("delivery_point_type").value,
        this.lngsupplyScheduleForm.get("element_type").value
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
            "Internal server error while getting balance zones"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  addRow() {
    const start = new Date(this.lngsupplyScheduleForm.get("date").value.start);
    const end = new Date(this.lngsupplyScheduleForm.get("date").value.end);
    const dates = eachDayOfInterval({ start, end });
    for (let element in dates) {
      this.rows.push({
        op_date: this.datepipe.transform(dates[element], "yyyy-MM-dd"),
        delivery_point_type: this.lngsupplyScheduleForm.get("element_type").value,
        delivery_point_id: this.lngsupplyScheduleForm.get("delivery_point").value,
        delivery_point: this.labelDeliveryPoint,
        quantity: 0,
        quantity_mmbtu: 0,
        vessel: this.labelVessel,
        source: this.labelSource,
        vessel_id: this.lngsupplyScheduleForm.get("vessel").value,
        source_id: this.lngsupplyScheduleForm.get("source_location").value,
      });
    }
    document.querySelector("revo-grid").source = [];
    document.querySelector("revo-grid").source = this.rows;

 
  }
  doDelete(rowIndex) {
    this.rows.splice(rowIndex, 1);
    document.querySelector("revo-grid").source = [];
    document.querySelector("revo-grid").source = this.rows;
  
  }
  submit() {
    /* 
        this.apiThirdPartyContract.submitPhysicalGasExchangesToTSO(this.id, this.datepipe.transform(this.submitLNGSupplyScheduleForm.get('date').value.start, "yyyy-MM-dd"), this.datepipe.transform(this.submitLNGSupplyScheduleForm.get('date').value.end, "yyyy-MM-dd")).subscribe({
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
  onAfterEdit({ detail }) {

  }
  onBeforeEdit(e, { detail }) {
    this.validateRevogrid = true;

    this.eventTimes = [];
    if (detail.model !== undefined) {
      if (
        isNaN(
          Number(detail.val.toString().replace(/\./g, "").replace(",", "."))
        )
      ) {
        this.validateRevogrid = false;
        e.preventDefault();
      }
    }
  }
  onBeforeRangeEdit(e, { detail }) {
    this.validateRevogrid = true;
    const numeral = NumberColumnType.getNumeralInstance();
    numeral.locale("en");

    if (detail.models !== undefined) {
      for (const data in detail.data) {
        for (const prop in Object.keys(detail.data[data])) {
          var value = Number(
            Object.values(detail.data[data])
              [prop].toString()
              .replace(/\./g, "")
              .replace(",", ".")
          );

          if (isNaN(Number(value))) {
            this.validateRevogrid = false;
            e.preventDefault();
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
              x["quantity_mmbtu"].toString().replace(/\./g, "").replace(",", ".")
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
    if (type == "logistic_element") {
      this.logisticElementsTypeOptions = [];
      Object.values(LogisticElementType).map((x) => {
        this.logisticElementsTypeOptions.push(x);
      });
      var options =this.logisticElementsTypeOptions.filter(
        (item) => 
          item=="regasification_plant"
        
      );
      this.logisticElementsTypeOptions=[];
      this.logisticElementsTypeOptions=options;
    } else if (type == "connection_point") {
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
      }).add(()=>{
        var options =this.logisticElementsTypeOptions.filter(
          (item) => 
            item=="vessel_connection"
          
        );

        this.logisticElementsTypeOptions=[];
        this.logisticElementsTypeOptions=options;
      });
    }
  }
  onChangeSource($event){
    let selectedValue = this.sourceLocationOptions.find(
      (item) => item.id === $event
    );

    this.labelSource = selectedValue.name;
  }
  onChangeVessel($event){
    let selectedValue = this.vesselOptions.find(
      (item) => item.id === $event
    );

    this.labelVessel = selectedValue.name;
  }
}
