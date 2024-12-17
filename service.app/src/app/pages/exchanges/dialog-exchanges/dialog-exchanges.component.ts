import { Component, Input, OnInit, TemplateRef } from "@angular/core";
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
import { DialogScheduleComponent } from "../dialog-schedule/dialog-schedule.component";
import { DialogConfirmationComponent } from "../../../@theme/components/confirmation-dialog/dialog-confirmation-delete.component";
import { JobsService } from "../../../@core/services/jobs.service";
import { DarkModeService } from "../../../@core/services/sharedServices/darkMode.service";
import { eachDayOfInterval } from 'date-fns';
@Component({
  selector: "ngx-dialog-exchanges",
  templateUrl: "./dialog-exchanges.component.html",
  styleUrls: ["./dialog-exchanges.component.scss"],
})
export class DialogExchangesComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() id: number;
  @Input() registration_date: string;
  @Input() contract_label: string;
  @Input() contract_id: string;
  @Input() legal_entity: number;
  @Input() country_code: string;
  @Input() balancing_zone: number;
  @Input() counterparty: number;
  @Input() counterparty_label: string;
  @Input() fee: number;
  @Input() fee_unit: string;
  selectedItems;
  loading = false;
  exchangeForm!: FormGroup;
  exchangeScheduleForm!: FormGroup;
  submitExchangeScheduleForm!: FormGroup;
  entitiesOptions: any;
  entitiesOptions2: any;
  entitiesOptions3: any;
  errorLegalEntity = false;
  errorLegalEntity2 = false;
  errorLegalEntity3 = false;
  countriesOptions: any;
  measureUnitOptions: any;
  logisticElementsTypeOptions: any;
  columns: any;
  rows = [];
  zoneOptions: any;
  errorBalanceZone = false;
  deliveryPointTypeOptions: any;
  deliveryPointOptions: any;
  errorDeliveryPoint = false;
  errorDateRangeSchedule = false;
  totalQuantityValid = false;
  eventTimes = [];
  errorDa;

  settings = {
    singleSelection: true,
    text: "",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    enableSearchFilter: true,
    position: "bottom",
    autoPosition: false,
  };
  validateRevogrid: boolean;
  labelDeliveryPoint = "";
  start_date: any;
  end_date: any;
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
  revogridTheme: string;
  eventTimes1 = [];
  loadingOperations: boolean;
  constructor(
    private formBuilder: FormBuilder,
    private apiLegalEntity: LegalEntityService,
    private messageService: messageService,
    private apiCountry: CountryService,
    private apiBalanceZone: BalanceZoneService,
    public datepipe: DatePipe,
    protected ref: NbDialogRef<DialogExchangesComponent>,
    private apiThirdPartyContract: ThirdPartyContractsService,
    private apiLogisticElement: LogisticElementService,
    private apiConnectionPoint: ConnectionPointService,
    private excelService: ExcelService,
    private apiCurrency: CurrencyService,
    private dialogService: NbDialogService,
    private apiJobs: JobsService,
    private darkModeService: DarkModeService
  ) {
    this.getcountries();
    this.getCurrencies();
    this.deliveryPointTypeOptions = ["logistic_element", "connection_point"];

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
    this.exchangeForm = this.formBuilder.group({
      id: new FormControl(""),
      registration_date: new FormControl("", Validators.required),
      contract_label: new FormControl("", Validators.required),
      contract_id: new FormControl(""),
      legal_entity: new FormControl("", Validators.required),
      counterparty: new FormControl("", Validators.required),
      fee: new FormControl("", [
        Validators.required,
        Validators.pattern(
          /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/
        ),
      ]),
      fee_unit: new FormControl("", Validators.required),
    });
    this.exchangeScheduleForm = this.formBuilder.group({
      date: new FormControl("", [
        Validators.required,
        this.dateRangeValidatorSchedule,
      ]),
      country_code: new FormControl("", Validators.required),
      balancing_zone: new FormControl("", Validators.required),

      delivery_point_type: new FormControl("", Validators.required),
      delivery_point: new FormControl("", [Validators.required]),
      element_type: new FormControl("", [Validators.required]),
      /*     quantity: new FormControl("", [
        Validators.required,
        Validators.pattern(
          /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/
        ),
      ]), */
      price: new FormControl("", [
        Validators.required,
        Validators.pattern(
          /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/
        ),
      ]),
      currency: new FormControl("", Validators.required),
    });

    this.exchangeForm.controls["id"].disable();
    this.exchangeForm.controls["contract_id"].disable();
    setTimeout(() => {
      document
        .querySelectorAll("revo-grid")
        .forEach((element) => (element.resize = true));
      document
        .querySelectorAll("revo-grid")
        .forEach((element) => (element.autoSizeColumn = true));
    }, 100);
    if (this.action == "Add") {
      this.getLegalEntities();
      this.totalQuantityValid = true;
      this.validateRevogrid = true;
      var object = localStorage.getItem("settings_parameters");
      if (object) {
        object = JSON.parse(localStorage.getItem("settings_parameters"));
        this.exchangeScheduleForm
          .get("country_code")
          .setValue(object["country_code"]);
        this.exchangeScheduleForm
          .get("balancing_zone")
          .setValue(object["balancing_zone"]);
        this.getbalanceZones(object["country_code"]);
      }
      this.columns = [
        {
          prop: "op_date",
          name: "Date",
          size: 100 + Number(String("Date").length) * 3,
          readonly: true,
          order: 'asc'
        },
        {
          prop: "delivery_point_type",
          name: "Element Type",
          size: 100 + Number(String("Element Type").length) * 3,
          readonly: true,
        },
        {
          prop: "delivery_point",
          name: "Delivery Point",
          size: 100 + Number(String("Delivery Point").length) * 3,
          readonly: true,
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
          prop: "price",
          name: "Price (Currency/Kwh)",
          size: 100 + Number(String("Price (Currency/Kwh)").length) * 3,
          cellProperties: ({ prop, model, data, column }) => {
            return {
              class: {
                numeric: true,
              },
            };
          },
        },
        {
          prop: "currency",
          name: "Currency",
          readonly: true,
          size: 100 + Number(String("Currency").length) * 3,
        },
        {
          size: 100,
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
    } else if (this.action == "Update") {
      this.columns = [
        {
          prop: "op_date",
          name: "Date",
          size: 100 + Number(String("Date").length) * 3,
          readonly: true,
          order: 'asc'
        },
        {
          prop: "delivery_point_type",
          name: "Element Type",
          size: 100 + Number(String("Element Type").length) * 3,
          readonly: true,
        },
        {
          prop: "delivery_point",
          name: "Delivery Point",
          size: 100 + Number(String("Delivery Point").length) * 3,
          readonly: true,
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
          prop: "price",
          name: "Price (Currency/Kwh)",
          size: 100 + Number(String("Price (Currency/Kwh)").length) * 3,
          cellProperties: ({ prop, model, data, column }) => {
            return {
              class: {
                numeric: true,
              },
            };
          },
        },
        {
          prop: "currency",
          name: "Currency",
          readonly: true,
          size: 100 + Number(String("Currency").length) * 3,
        },
        {
          size: 100,
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
      this.validateRevogrid = true;
      this.exchangeForm.controls["id"].setValue(this.id);
      this.exchangeForm.controls["registration_date"].setValue(
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
      this.exchangeForm.controls["contract_label"].setValue(
        this.contract_label
      );
      this.exchangeForm.controls["contract_id"].setValue(this.contract_id);
      this.exchangeForm.controls["legal_entity"].setValue(this.legal_entity);
      this.exchangeForm.controls["counterparty"].setValue([
        { id: this.counterparty, itemName: this.counterparty_label },
      ]);
      this.getLegalEntities();
      this.exchangeForm.controls["counterparty"].disable();
      this.exchangeForm.controls["fee"].setValue(
        this.numeral(this.fee).format("0,0.[000000000000]")
      );
      this.exchangeForm.controls["fee_unit"].setValue(this.fee_unit);
      this.getOperations(this.id);
    } else if (this.action == "View") {
      this.settings = Object.assign({ disabled: true }, this.settings);
      this.getLegalEntities();
      this.columns = [
        {
          prop: "op_date",
          name: "Date",
          size: 100 + Number(String("Date").length) * 3,
          readonly: true,
          sortable: true,
          order: 'asc'
        },
        {
          prop: "delivery_point_type",
          name: "Element Type",
          size: 100 + Number(String("Element Type").length) * 3,
          readonly: true,
        },
        {
          prop: "delivery_point",
          size: 100 + Number(String("Delivery Point").length) * 3,
          readonly: true,
        },
        {
          prop: "quantity",
          name: "Quantity (Kwh)",
          size: 100 + Number(String("Quantity (Kwh)").length) * 3,
          readonly: true,
        },
        {
          prop: "price",
          name: "Price (Currency/Kwh)",
          size: 100 + Number(String("Price (Currency/Kwh)").length) * 3,
          cellProperties: ({ prop, model, data, column }) => {
            return {
              class: {
                numeric: true,
              },
            };
          },
        },
        {
          prop: "currency",
          name: "Currency",
          readonly: true,
          size: 100 + Number(String("Currency").length) * 3,
        },
      ];
      this.exchangeForm.disable();
      this.exchangeForm.controls["id"].setValue(this.id);
      this.exchangeForm.controls["registration_date"].setValue(
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
      this.exchangeForm.controls["contract_label"].setValue(
        this.contract_label
      );
      this.exchangeForm.controls["contract_id"].setValue(this.contract_id);
      this.exchangeForm.controls["legal_entity"].setValue(this.legal_entity);
      this.exchangeForm.controls["counterparty"].setValue(this.counterparty);
      this.exchangeForm.controls["fee"].setValue(this.fee);
      this.exchangeForm.controls["fee_unit"].setValue(this.fee_unit);
      this.getOperations(this.id, "view");
    }
  }

  private dateRangeValidatorSchedule: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date =
      this.exchangeScheduleForm && this.exchangeScheduleForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.exchangeScheduleForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.exchangeScheduleForm.get("date").value.end,
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
  cancel() {
    this.ref.close();
  }
  add() {
    if (this.exchangeForm.valid) {
      this.loading = true;
      var object = {
        id: this.exchangeForm.get("id").value
          ? this.exchangeForm.get("id").value
          : null,
        swap_code: this.exchangeForm.get("contract_id").value
          ? this.exchangeForm.get("contract_id").value
          : null,
        counterparty_id: this.exchangeForm.get("counterparty").value[0]["id"],
        fee: Number(
          this.exchangeForm
            .get("fee")
            .value.toString()
            .replace(/\./g, "")
            .replace(",", ".")
        ),
        fee_currency: this.exchangeForm.get("fee_unit").value,
        formalization_date:
          new Date(
            new Date(this.exchangeForm.get("registration_date").value)
              .toString()
              .replace(/GMT.*$/, "GMT+0000")
          )
            .toISOString()
            .split(".")[0] + "Z",
        label: this.exchangeForm.get("contract_label").value,
        owner_id: this.exchangeForm.get("legal_entity").value,
      };
      if (this.action == "Add") {
        this.apiThirdPartyContract
          .addGasSwapContract(this.clean(object))
          .subscribe({
            next: (res1) => {
              document
                .querySelector("revo-grid")
                .getSource()
                .then((value) => {
                  if (value.length != 0) {
                    value.map((x, index) => {
                      if (x["price"] != null) {
                        x["price"] = Number(
                          x["price"]
                            .toString()
                            .replace(/\./g, "")
                            .replace(",", ".")
                        );
                      }
                      if (x["quantity"] != null) {
                        x["quantity"] = Number(
                          x["quantity"]
                            .toString()
                            .replace(/\./g, "")
                            .replace(",", ".")
                        );
                      }
                      if (x["quantity"] == 0) {
                        delete x[index];
                      }
                      x = this.clean(x);
                      x["contract_id"] = res1.id;
                      delete x["delivery_point"];
                      return x;
                    });
                    var valuesWithoutZero = value.filter(
                      (item) => item["quantity"] != 0
                    );
                    this.apiThirdPartyContract
                      .setGasSwapOperations(res1.id, valuesWithoutZero)
                      .subscribe({
                        next: (res) => {
                          this.submitContractToETRM(res1.id, true);
                          this.messageService.showToast(
                            "success",
                            "Success",
                            "Swap contract added successfully in SLG!"
                          );
                        },
                        error: (e) => {
                          if (e.error.title == "Internal Server Error") {
                            this.messageService.showToast(
                              "danger",
                              "Error",
                              "Internal server error while adding gas swap contract"
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
                  } else{
                    this.apiThirdPartyContract
                    .setGasSwapOperations(res1.id, [])
                    .subscribe({
                      next: (res) => {
                        this.submitContractToETRM(res1.id, true);
                        this.messageService.showToast(
                          "success",
                          "Success",
                          "Swap contract added successfully in SLG!"
                        );
                      },
                      error: (e) => {
                        if (e.error.title == "Internal Server Error") {
                          this.messageService.showToast(
                            "danger",
                            "Error",
                            "Internal server error while adding gas swap contract"
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
              this.loading = false;
              if (e.error.title == "Internal Server Error") {
                this.messageService.showToast(
                  "danger",
                  "Error",
                  "Internal server error while adding gas swap contracts"
                );
              } else {
                this.messageService.showToast("danger", "Error", e.error);
              }
            },
          });
      } else {
        this.update(this.clean(object));
      }
    }
  }
  update(object) {
    this.apiThirdPartyContract.updateGasSwapContract(object).subscribe({
      next: (res) => {
        document
          .querySelector("revo-grid")
          .getSource()
          .then((value) => {
            if (value.length != 0) {
            value.map((x, index) => {
              if (x["price"] != null) {
                x["price"] = Number(
                  x["price"].toString().replace(/\./g, "").replace(",", ".")
                );
              }
              if (x["quantity"] != null) {
                x["quantity"] = Number(
                  x["quantity"].toString().replace(/\./g, "").replace(",", ".")
                );
              }
              x = this.clean(x);
              delete x["delivery_point"];
              return x;
            });

            var valuesWithoutZero = value.filter(
              (item) => item["quantity"] != 0
            );
            this.apiThirdPartyContract
              .setGasSwapOperations(this.id, valuesWithoutZero)
              .subscribe({
                next: (res) => {
                  this.submitContractToETRM(this.id, true);

                  this.messageService.showToast(
                    "success",
                    "Success",
                    "Swap contract updated successfully in SLG!"
                  );
                },
                error: (e) => {
                  this.loading = false;
                  if (e.error.title == "Internal Server Error") {
                    this.messageService.showToast(
                      "danger",
                      "Error",
                      "Internal server error while adding gas swap contract"
                    );
                  } else {
                    this.messageService.showToast("danger", "Error", e.error);
                  }
                },
              });

            }else{
              this.apiThirdPartyContract
              .setGasSwapOperations(this.id, [])
              .subscribe({
                next: (res) => {
                  this.submitContractToETRM(this.id, true);

                  this.messageService.showToast(
                    "success",
                    "Success",
                    "Swap contract updated successfully in SLG!"
                  );
                },
                error: (e) => {
                  this.loading = false;
                  if (e.error.title == "Internal Server Error") {
                    this.messageService.showToast(
                      "danger",
                      "Error",
                      "Internal server error while adding gas swap contract"
                    );
                  } else {
                    this.messageService.showToast("danger", "Error", e.error);
                  }
                },
              });
            }
          });

      
      },
      error: (e) => {
        this.loading = false;
        this.ref.close();
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while updating gas swap contracts"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  openErrorDialogOperations(error, id, automatic?) {
    this.dialogService
      .open(DialogConfirmationComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          body:
            "Sending operations to ETRM has failed for the following reason: " +
            "\n" +
            "\n" +
            error +
            "\n" +
            "\n" +
            "  do you want to resend?",
          title: "Confirmation",
          button: "Confirm",
          status_cancel: "basic",
          status_confirm: "success",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "yes") {
          this.submitOperationsToETRM(id, automatic);
        } else {
          if (automatic) {
            this.ref.close("update");
          } else {
            this.ref.close();
          }
        }
      });
  }
  openErrorDialogContract(error, id, automatic?) {
    this.dialogService
      .open(DialogConfirmationComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          body:
            "Sending contract to ETRM has failed for the following reason: " +
            "\n" +
            "\n" +
            error +
            "\n" +
            "\n" +
            "  so that operations cannot be sent. do you want to resend?",
          title: "Confirmation",
          button: "Confirm",
          status_cancel: "basic",
          status_confirm: "success",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "yes") {
          this.submitContractToETRM(id, automatic);
        } else {
          if (automatic) {
            this.ref.close("update");
          } else {
            this.ref.close();
          }
        }
      });
  }
  submitOperationsToETRM(id, automatic?) {
    this.loading = true;
    this.apiJobs
      .submitThirdPartyOperations(id)
      .subscribe({
        next: (res) => {
          if (automatic) {
            this.ref.close("update");
          } else {
            this.ref.close();
          }

          this.messageService.showToast("success", "Success", res);
        },
        error: (e) => {
      /*     if (automatic) {
            this.ref.close("update");
          } else {
            this.ref.close();
          } */

      
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while submit operations to ETRM"
            );
            this.openErrorDialogOperations("Internal server error while submit operations to ETRM", id, automatic);
          } else {
            this.messageService.showToast("danger", "Error", e.error);
            this.openErrorDialogOperations(e.error, id, automatic);
          }
        },
      })
      .add(() => {
        this.loading = false;
      });
  }
  submitContractToETRM(id, automatic?) {
    this.loading = true;
    this.apiJobs.submitThirdPartyContract(id).subscribe({
      next: (res) => {
        this.submitOperationsToETRM(id, true);

        this.messageService.showToast("success", "Success", res);
      },
      error: (e) => {
        this.loading = false;

        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while submit contract to ETRM"
          );
          this.openErrorDialogContract("Internal server error while submit contract to ETRM", id,automatic);
        } else {
          this.openErrorDialogContract(e.error, id, automatic);
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  submitToETRM() {
    this.submitContractToETRM(this.id, false);
  }
  getOperations(id, view?) {
    this.loadingOperations = true;
    this.apiThirdPartyContract
      .getGasSwapOperations(id)
      .subscribe({
        next: (res) => {
          this.rows = res;
          document.querySelector("revo-grid").source = this.rows;
          document.querySelector("revo-grid").useClipboard = true;
          this.rows.map((x) => {
            x["price"] = this.numeral(x["price"]).format("0,0.[000000000000]");
            x["quantity"] = this.numeral(x["quantity"]).format("0,0.[000000000000]");
          });
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting gas swap operations"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        if (view) {
          this.totalQuantityValid = true;
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
        this.loadingOperations = false;
      });
  }
  getLegalEntities(change?) {
    this.apiLegalEntity
      .getAllLegalEntitiesByCountry(null, "Internal")
      .subscribe({
        next: (res) => {
          this.entitiesOptions =res.sort((a, b) => (a.name > b.name) ? 1 : -1);
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
      .getAllLegalEntitiesByCountry(null)
      .subscribe({
        next: (res) => {
    
       
          this.entitiesOptions2 = res.sort((a, b) => (a.name > b.name) ? 1 : -1);
          this.entitiesOptions2.map((x) => {
            x["itemName"] = x["name"];
          });
          if (this.entitiesOptions2.length == 0) {
            this.errorLegalEntity2 = true;
          } else {
            this.errorLegalEntity2 = false;
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
      })
      .add(() => {
        if (this.counterparty && this.counterparty_label) {
          this.selectedItems = [
            { id: this.counterparty, itemName: this.counterparty_label },
          ];
        }
       
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
  onChangeCountry($event) {
    this.getbalanceZones(this.exchangeScheduleForm.get("country_code").value);
    this.exchangeScheduleForm.controls["balancing_zone"].setValue("");
  }
  onChangeZone($event) {
    this.exchangeScheduleForm.controls["delivery_point"].setValue("");
    if (
      this.exchangeScheduleForm.get("delivery_point_type").value &&
      this.exchangeScheduleForm.get("element_type").value
    ) {
      this.getDeliveryPoint(
        this.exchangeScheduleForm.get("balancing_zone").value,
        this.exchangeScheduleForm.get("delivery_point_type").value,
        this.exchangeScheduleForm.get("element_type").value
      );
    }
    if (this.exchangeScheduleForm.get("delivery_point_type").value) {
      this.getElementsTypes(
        this.exchangeScheduleForm.get("delivery_point_type").value
      );
    }
  }
  onChangeDeliveryPointType($event) {
    /* this.exchangeScheduleForm.controls["delivery_point"].setValue("");

    this.deliveryPointOptions = [];
    if (this.exchangeScheduleForm.get("balancing_zone").value) {
      this.getDeliveryPoint(
        this.exchangeScheduleForm.get("balancing_zone").value,
        this.exchangeScheduleForm.get("delivery_point_type").value
      );
    } */
    this.deliveryPointOptions = [];
    this.logisticElementsTypeOptions = [];
    this.exchangeScheduleForm.get("delivery_point").setValue("");
    this.exchangeScheduleForm.get("element_type").setValue("");
    if (this.exchangeScheduleForm.get("balancing_zone").value) {
      this.getElementsTypes($event);
    }
  }
  onChangeElementType($event) {
    this.exchangeScheduleForm.controls["delivery_point"].setValue("");

    this.deliveryPointOptions = [];
    if (
      this.exchangeScheduleForm.get("balancing_zone").value &&
      this.exchangeScheduleForm.get("delivery_point_type").value
    ) {
      this.getDeliveryPoint(
        this.exchangeScheduleForm.get("balancing_zone").value,
        this.exchangeScheduleForm.get("delivery_point_type").value,
        this.exchangeScheduleForm.get("element_type").value
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
            "Internal server error while getting balance"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }
  addRow() {
    const start = new Date(this.exchangeScheduleForm.get("date").value.start);
    const end = new Date(this.exchangeScheduleForm.get("date").value.end);
    const dates = eachDayOfInterval({ start, end });
    for (let element in dates) {
      this.rows.push({
        op_date: this.datepipe.transform(dates[element], "yyyy-MM-dd"),
        delivery_point_type:
          this.exchangeScheduleForm.get("element_type").value,
        delivery_point_id:
          this.exchangeScheduleForm.get("delivery_point").value,
        delivery_point: this.labelDeliveryPoint,
        quantity: 0,
        price: this.numeral(
          Number(
            this.exchangeScheduleForm
              .get("price")
              .value.toString()
              .replace(/\./g, "")
              .replace(",", ".")
          )
        ).format("0,0.[000000000000]"),
        currency: this.exchangeScheduleForm.get("currency").value,
        contract_id: this.id,
      });
    }
    document.querySelector("revo-grid").source = [];
    document.querySelector("revo-grid").source = this.rows;

    /*    var dates = [];
    while (from <= to) {
      dates = [...dates, this.datepipe.transform(
        from,
        "yyyy-MM-dd"
      )];

      from.setDate(from.getDate() + 1);
      from = 
   
    }
    from = this.exchangeScheduleForm.get("date").value.start; */

    /*   for (let element in dates){
  
      this.rows.push({  op_date: this.datepipe.transform(
        dates[element],
        "yyyy-MM-dd"
      ),
      delivery_point_type: this.exchangeScheduleForm.get("delivery_point_type")
        .value,
      delivery_point_id: this.exchangeScheduleForm.get("delivery_point").value,
      delivery_point: this.labelDeliveryPoint,
      quantity: 0,
      price: this.exchangeScheduleForm.get("price").value,
      currency: this.exchangeScheduleForm.get("currency").value,
      contract_id: this.id,})
    }


    document.querySelector("revo-grid").source = [];
    document.querySelector("revo-grid").source = this.rows;  */
  }
  doDelete(rowIndex) {
    document.querySelector("revo-grid").getSource().then((value)=>{
      this.rows= value;
    }).finally(()=>{
    
      this.rows.splice(rowIndex, 1);
      document.querySelector("revo-grid").source = [];

      document.querySelector("revo-grid").source = this.rows;
 
    })
  }
  submit() {
    /* 
        this.apiThirdPartyContract.submitPhysicalGasExchangesToTSO(this.id, this.datepipe.transform(this.submitExchangeScheduleForm.get('date').value.start, "yyyy-MM-dd"), this.datepipe.transform(this.submitExchangeScheduleForm.get('date').value.end, "yyyy-MM-dd")).subscribe({
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

  export() {
    var extension = this.submitExchangeScheduleForm.get("extension").value;
    if (extension == "csv") {
      this.exportAsCSV();
    } else if (extension == "xml") {
      this.exportAsXML();
    } else if (extension == "xlsx") {
      this.exportAsXLSX();
    }
    this.submitExchangeScheduleForm.controls["extension"].setValue("");
  }
  exportAsCSV() {
    this.start_date = this.datepipe.transform(
      this.submitExchangeScheduleForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.submitExchangeScheduleForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    (document.querySelector("revo-grid") as any)
      .getPlugins()
      .then((plugins) => {
        plugins.forEach((p) => {
          if (p.exportFile) {
            const exportPlugin = p;
            exportPlugin.exportFile({ filename: "Nomination_" });
          }
        });
      });
  }
  exportAsXLSX() {}

  exportAsXML() {}

  getCurrencies() {
    this.apiCurrency.getCurrencies().subscribe({
      next: (res) => {
        this.measureUnitOptions = res;
      },
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
  onAfterEdit({ detail }) {}
  onBeforeEdit(e, { detail }) {
    this.validateRevogrid = true;

    this.eventTimes = [];
    if (detail.model !== undefined) {
      if (
        /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/.test(
          detail.val
        ) == false
      ) {
        this.validateRevogrid = false;
        e.preventDefault();
      } else {
        detail.val = this.numeral(
          Number(detail.val.toString().replace(/\./g, "").replace(",", "."))
        ).format("0,0.[000000000000]");
      }
    }
  }
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
  onBeforeRangeEdit(e, { detail }) {
    this.validateRevogrid = true;

    if (detail.models !== undefined) {
      for (const data in detail.data) {
        for (const prop in Object.keys(detail.data[data])) {
          var value = Object.values(detail.data[data])[prop].toString();
          if (
            /^[+-]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/.test(
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
                  ).format("0,0.[000000000000]");
                }
              }
            }
          }
        }
      }
    }
  }

  
  validateTotalQuantity() {
    var total_quantity = 0;
    document
      .querySelector("revo-grid")
      .getSource()
      .then((value) => {
        value.map((x) => {
          total_quantity =
            total_quantity +
            Number(
              x["quantity"].toString().replace(/\./g, "").replace(",", ".")
            );
        });
        if (total_quantity == 0) {
          this.add();
          this.totalQuantityValid = true;
        } else {
          this.dialogService
            .open(DialogConfirmationComponent, {
              closeOnEsc: false,
              closeOnBackdropClick: false,
              context: {
                body: "The total amount of all swap programs is not 0. Are you sure you want to save swap?",
                title: "Confirmation",
                button: "Confirm",
                status_cancel: "basic",
                status_confirm: "success",
              },
              autoFocus: false,
            })
            .onClose.subscribe((val) => {
              if (val === "yes") {
                this.add();
              }
            });
          this.totalQuantityValid = false;
        }
      });
  }
  getElementsTypes(type) {
    if (type == "logistic_element") {
      this.logisticElementsTypeOptions = [];
      Object.values(LogisticElementType).map((x) => {
        this.logisticElementsTypeOptions.push(x);
      });
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
      });
    }
  }
  
}
