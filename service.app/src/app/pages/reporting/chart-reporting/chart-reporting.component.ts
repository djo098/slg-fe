import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { CountryService } from "../../../@core/services/country.service";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";
import { messageService } from "../../../@core/utils/messages";
import * as moment from "moment";

import { DatePipe } from "@angular/common";
import { LegalEntityService } from "../../../@core/services/legalEntity.service";
import { ReportingService } from "../../../@core/services/reporting.service";
import { map } from "rxjs/operators";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { BalanceZoneService } from "../../../@core/services/balanceZone.service";
import { Chart, ChartDataset } from "chart.js";
import { DarkModeService } from "../../../@core/services/sharedServices/darkMode.service";
@Component({
  selector: "ngx-chart-reporting",
  templateUrl: "./chart-reporting.component.html",
  styleUrls: ["./chart-reporting.component.scss"],
})
export class ChartReportingComponent implements OnInit {
  options: any = {};
  @ViewChild("generateReport", { static: true }) accordion;

  defaultRowPerPage = 10;
  dataExport: any[];
  reportForm!: FormGroup;
  errorDate = false;
  countriesOptions: any;
  entitiesOptions: any;
  errorLegalEntity = false;
  columns: any;
  rows = null;
  loading = false;
  start_date: any;
  end_date: any;
  entity: any;
  country: any;
  report: any;
  optionsPager: any;
  selected: any;
  numeral = NumberColumnType.getNumeralInstance();
  dataView: any;
  balancing_zone: any;
  zoneOptions: any;
  errorBalanceZone: any;
  myChart: any;
  currentTabOriginal: any;
  // urlsReport=[{title: 'PRUEBA', URL: 'https://app.powerbi.com/reportEmbed?reportId=49b1c4eb-1a3f-472e-8e58-397bd59bd50f&autoAuth=true&ctid=a6bf56db-1844-4fb0-89f3-ad07c1f40c8b'}]
  /*   plugin: any =  { 'numeric': new NumberColumnType('0,0') }; */
  ngOnInit(): void {
 

    this.darkModeService.darkModeChange.subscribe((value) => {
      var options_temp = this.options;
      this.options = {};


      if(value == true){
        options_temp["scales"]["yAxes"][0]["ticks"]["fontColor"] = 'white';
        options_temp["scales"]["yAxes"][0]["scaleLabel"]["fontColor"] = 'white';
        options_temp["scales"]["yAxes"][0]["gridLines"]["color"] = "#303030";
        options_temp["scales"]["xAxes"][0]["ticks"]["fontColor"] = 'white';
        options_temp["scales"]["xAxes"][0]["scaleLabel"]["fontColor"] = 'white';
        options_temp["scales"]["xAxes"][0]["gridLines"]["color"] = "#303030";
      } else {
        options_temp["scales"]["yAxes"][0]["ticks"]["fontColor"] = 'black';
        options_temp["scales"]["yAxes"][0]["scaleLabel"]["fontColor"] = 'black';
        options_temp["scales"]["yAxes"][0]["gridLines"]["color"] = "#edf1f7";
        options_temp["scales"]["xAxes"][0]["ticks"]["fontColor"] = 'black';
        options_temp["scales"]["xAxes"][0]["scaleLabel"]["fontColor"] = 'black';
        options_temp["scales"]["xAxes"][0]["gridLines"]["color"] = "#edf1f7";
      }
     


      this.options = Object.assign(this.options, options_temp);
 
    });
    this.numeral.locale("es");
    this.optionsPager = [
      { value: 10 },
      { value: 20 },
      { value: 50 },
      { value: 100 },
    ];
    this.selected = this.optionsPager[0];
    this.accordion.toggle();
    this.reportForm = this.formBuilder.group({
      date: new FormControl("", [Validators.required, this.dateRangeValidator]),
      legal_entity: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      report: new FormControl("", [Validators.required]),
      balancing_zone: new FormControl("", [Validators.required]),
    });
    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.reportForm.get("country_code").setValue(object["country_code"]);
      this.reportForm.get("balancing_zone").setValue(object["balancing_zone"]);
      this.getbalanceZones(object["country_code"]);
    }
  }
  settings = {
    mode: "external",
    actions: {
      add: false,
      edit: false,
      delete: false,
    },

    columns: {},
    pager: {
      display: true,
      perPage: this.defaultRowPerPage,
    },
    attr: {
      class: "table",
    },
  };

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private messageService: messageService,
    private dialogService: NbDialogService,
    private excelService: ExcelService,
    private apiCountry: CountryService,
    private formBuilder: FormBuilder,
    public datepipe: DatePipe,
    private apiLegalEntity: LegalEntityService,
    private apiReporting: ReportingService,
    private apiBalanceZone: BalanceZoneService,
    private darkModeService: DarkModeService
  ) {
    this.getCountries();
    this.getLegalEntities();
  }

  getReport(start_date, end_date, balance_zone, owner_id, report) {
    var time;
    if (
      this.differenceInMonths(
        this.reportForm.get("date").value.start,
        this.reportForm.get("date").value.end
      ) == 0
    ) {
      time = {
        displayFormats: { day: "DD/MM/YY" },
        tooltipFormat: "DD/MM/YY",
        unit: "day",
      };
    } else {
      time = {
        displayFormats: { day: "MM/YY" },
        tooltipFormat: "DD/MM/YY",
        unit: "month",
      };
    }
    const numeral = NumberColumnType.getNumeralInstance();
    numeral.locale("es");
    this.loading = true;

    if (report == "current_stock_report") {
      const numeral = NumberColumnType.getNumeralInstance();
      numeral.locale("es");
      this.apiReporting
        .getCurrentStockReport(start_date, end_date, balance_zone, owner_id)
        .pipe(
          map((data) => {
            return data.map((x, index) => {
              var array = [];

              index == 0 ? (x["isActive"] = true) : (x["isActive"] = false);
              x["data"].map((j, index) => {
                x["data_chart"] = {
                  labels: j["x"],
                  datasets: [
                    {
                      data: j["y"],
                      label: x["name"],
                      backgroundColor: this.addAlpha("#263cc8", 0.2),
                      borderColor: "#263cc8",
                      pointStyle: "circle",
                      pointRadius: 3,
                      pointHoverRadius: 10,
                      pointBackgroundColor: "#929de3",
                      lineTension: 0,
                    },
                  ],
                };

                for (let i in j["x"]) {
                  var object = {};
                  object["DATE"] = j["x"][i];

                  object["STOCK"] = this.numeral(Number(j["y"][i])).format(
                    "0,0.[0000]"
                  );

                  array.push(object);
                }
              });
              x["rows"] = array;
              x["columns"] = [
                {
                  name: "Date",
                  prop: "DATE",
                  filter: "string",
                },
                {
                  name: "Stock",
                  prop: "STOCK",
                  filter: "number",
                },
              ];
              return x;
            });
          })
        )
        .subscribe({
          next: (res) => {
            this.dataView = res;
          },
          error: (e) => {
            this.rows = null;
            this.dataView = null;
            this.columns = null;
            this.loading = false;

            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while getting report"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        })
        .add(() => {
          this.loading = false;
          var options_temp =    
          this.darkModeService.isDarkMode == true
            ? ( {scales: {
                xAxes: [
                  {
                    gridLines: {
                      display: true,
                      color: "#303030",
                    },
                    scaleLabel: {
                      display: true,
                      labelString: "Day",
                      fontColor: "white",
                      fontFamily: "Mulish",
                      fontStyle: "bold",
                      fontSize: 15,
                    },
                    ticks: {
                      fontSize: 12.8,
                      source: "auto",
                      // Disabled rotation for performance
                      maxRotation: 0,
                      autoSkip: true,
                      fontFamily: "Mulish",
                      fontColor: "white",
                      align: "start",
                      padding: 30,
                      maxTicksLimit: 10,
                    },
                    type: "time",
                    position: "bottom",
                    time: {
                      displayFormats: { day: "DD/MM/YY" },
                      tooltipFormat: "DD/MM/YY",
                      unit: "day",
                    },
                  },
                ],
                yAxes: [
                  {
                    gridLines: {
                      display: true,
                      color: "#303030",
                    },
                    scaleLabel: {
                      display: true,
                      labelString: "Value (Gwh)",
                      fontFamily: "Mulish",
                      fontColor: "white",
                      fontStyle: "bold",
                      fontSize: 15,
                      padding: 30,
                    },
                    ticks: {
                      fontSize: 12.8,
                      fontColor: "white",
                      fontFamily: "Mulish",
                      maxTicksLimit: 10,
                 
                    },
                  },
                ],
              }})
            : ({scales: {
                xAxes: [
                  {
                    gridLines: {
                      display: true,
                      color: "#edf1f7",
                    },
                    scaleLabel: {
                      display: true,
                      labelString: "Day",
                      fontColor: "black",
                      fontFamily: "Mulish",
                      fontStyle: "bold",
                      fontSize: 15,
                    },
                    ticks: {
                      fontSize: 12.8,
                      source: "auto",
                      // Disabled rotation for performance
                      maxRotation: 0,
                      autoSkip: true,
                      fontFamily: "Mulish",
                      fontColor: "black",
                      align: "start",
                      padding: 30,
                      maxTicksLimit: 10,
                    },
                    type: "time",
                    position: "bottom",
                    time: {
                      displayFormats: { day: "DD/MM/YY" },
                      tooltipFormat: "DD/MM/YY",
                      unit: "day",
                    },
                  },
                ],
                yAxes: [
                  {
                    gridLines: {
                      display: true,
                      color: "#edf1f7",
                    },
                    scaleLabel: {
                      display: true,
                      labelString: "Value (Gwh)",
                      fontFamily: "Mulish",
                      fontColor: "black",
                      fontStyle: "bold",
                      fontSize: 15,
                      padding: 30,
                    },
                    ticks: {
                      fontSize: 12.8,
                      fontColor: "black",
                      fontFamily: "Mulish",
                      maxTicksLimit: 10,
                  
                    },
                  },
                ],
              }});
          options_temp["scales"]["yAxes"][0]["ticks"]["userCallback"] =
            function (value, index, values) {
              return (
                numeral(Number((value / 1000000).toFixed(4))).format(
                  "0,0.[0000]"
                )
              );
            };

          this.options = {};
          this.options = {
            responsive: true,
            maintainAspectRatio: true,
            parsing: false,
            animation: false,
            plugins: {
              decimation: {
                algorithm: "lttb",
                enabled: true,
                samples: 20,
                threshold: 40,
              },
            },
            tooltips: {
              callbacks: {
                label: function (tooltipItem, data) {
                  var label =
                    numeral(
                      Number(
                        (
                          data.datasets[tooltipItem.datasetIndex].data[
                            tooltipItem.index
                          ] / 1000000
                        ).toFixed(4)
                      )
                    ).format("0,0.[0000]") || "";

                  if (label) {
                    label += " GWh";
                  }

                  return label;
                },
              },
            },
            legend: {
              display: false,
            },
          };
          this.options = Object.assign(this.options, options_temp);
        });
    }
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
  export() {
    const canvas = document
      .getElementById("chart")
      .getElementsByTagName("canvas")[0];
    const img = canvas.toDataURL("image/png");
    var a = document.createElement("a");
    a.href = img;
    a.download = "image";
    document.body.appendChild(a);
    a.click();

    /*    const img    = canvas.toDataURL('image/png') */
  }
  onChange($event) {
    this.reportForm.controls["balancing_zone"].setValue("");
    this.getbalanceZones(this.reportForm.get("country_code").value);
  }

  private dateRangeValidator: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const date = this.reportForm && this.reportForm.get("date").value;

    if (date != null) {
      const from = this.datepipe.transform(
        this.reportForm.get("date").value.start,
        "yyyy-MM-dd"
      );
      const to = this.datepipe.transform(
        this.reportForm.get("date").value.end,
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
      this.errorDate = true;
    } else {
      this.errorDate = false;
    }

    return invalid ? { invalidRange: {} } : null;
  };
  reset() {
    this.reportForm.controls["country_code"].setValue("");
    this.reportForm.controls["balancing_zone"].setValue("");
    this.reportForm.controls["legal_entity"].setValue("");
    this.reportForm.controls["date"].setValue("");
    this.entitiesOptions = [];
    this.source = null;
  }

  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }
  calculate() {
    this.loading = true;
    this.country = this.reportForm.get("country_code").value;
    this.balancing_zone = this.reportForm.get("balancing_zone").value;
    this.entity = this.reportForm.get("legal_entity").value;
    this.start_date = this.datepipe.transform(
      this.reportForm.get("date").value.start,
      "yyyy-MM-dd"
    );
    this.end_date = this.datepipe.transform(
      this.reportForm.get("date").value.end,
      "yyyy-MM-dd"
    );

    this.report = this.reportForm.get("report").value;
    this.getReport(
      this.start_date,
      this.end_date,
      this.balancing_zone,
      this.entity,
      this.report
    );
  }

  exportAsXLSX() {
    this.excelService.exportAsExcelFileWithMultipleSheets(
      this.dataView,
      this.report +
        "_" +
        this.start_date +
        "_" +
        this.end_date +
        "_" +
        this.balancing_zone
    );
  }
  exportAsCSV() {
    this.dataView.map((x) => {
      if (x["name"] == this.currentTabOriginal) {
        this.excelService.exportToCsv(
          x["rows"],
          this.report +
            "_" +
            this.currentTabOriginal.replaceAll(" ", "_") +
            "_" +
            this.start_date +
            "_" +
            this.end_date +
            "_" +
            this.balancing_zone
        );
      }
    });
  }

  addAlpha(color: string, opacity: number): string {
    // coerce values so ti is between 0 and 1.
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
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
  differenceInMonths(date1, date2) {
    const monthDiff = date1.getMonth() - date2.getMonth();
    const yearDiff = date1.getYear() - date2.getYear();

    return monthDiff + yearDiff * 12;
  }
  onChangeTab($event) {
    this.currentTabOriginal = $event.tabTitle;
  }
}
