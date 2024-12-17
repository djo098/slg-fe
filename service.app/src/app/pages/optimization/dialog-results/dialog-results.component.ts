import { Component, Input, OnInit } from "@angular/core";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";
import { NbDialogRef } from "@nebular/theme";
import { DarkModeService } from "../../../@core/services/sharedServices/darkMode.service";
import { OptimizationService } from "../../../@core/services/optimization.service";
import { messageService } from "../../../@core/utils/messages";
import { map } from "rxjs/operators";
import NumberColumnType from "@revolist/revogrid-column-numeral";
@Component({
  selector: "slg-dialog-results",
  templateUrl: "./dialog-results.component.html",
  styleUrls: ["./dialog-results.component.scss"],
})
export class DialogResultsComponent implements OnInit {
  @Input() label: string;
  @Input() id: number;
  @Input() start_date: string;
  @Input() end_date: string;
  data: any = [];
  revogridTheme: string;
  loading = false;
  numeral = NumberColumnType.getNumeralInstance();
  timestamp: string;
  constructor(
    private excelService: ExcelService,
    protected ref: NbDialogRef<DialogResultsComponent>,
    private darkModeService: DarkModeService,
    private apiOptimization: OptimizationService,
    private messageService: messageService,
  ) {}

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

    this.getResultsOptimizationById(this.id);
  }

  refresh() {
    this.getResultsOptimizationById(this.id);
  }
  exportAsXLSX() {
    this.excelService.exportAsExcelFile(
      this.data[0]["rows"],
      "optimization_results_" +
        this.label +
        "_" +
        this.start_date +
        "_" +
        this.end_date
    );
  }
  exportAsCSV() {
    (document.querySelector("revo-grid") as any)
      .getPlugins()
      .then((plugins) => {
        plugins.forEach((p) => {
          if (p.exportFile) {
            const exportPlugin = p;
            exportPlugin.exportFile({
              filename:
                "optimization_results_" +
                this.label +
                "_" +
                this.start_date +
                "_" +
                this.end_date,
            });
          }
        });
      });
  }
  getResultsOptimizationById(id) {
    this.loading=true;
    this.apiOptimization.executeOptimizationScenario(id).pipe(
      map((data) => {
   
        return data.map((x, index) => {
          index == 0
              ? (x["isActive"] = true)
              : (x["isActive"] = false);
          x["columns"]?.map((j) => {
            j["sortable"] = true;

            j["size"] = 120 + Number(j["name"].length) * 3;

            if (j["name"] == "Date") {
              j["pin"] = "colPinStart";
            } else if (j["filter"] == "string") {
              j["columnType"] = "string";
            } else if (j["filter"] == "number") {
              x["rows"]?.map((e, index) => {
                e[j["prop"]] = this.numeral(
                  Number(e[j["prop"]].toFixed(2))
                ).format("0,0.[0000]");
              });
              j["columnType"] = "numeric";
              j["cellProperties"] = ({ prop, model, data, column }) => {
                return {
                  class: {
                    numeric: true,
                  },
                };
              };
            }

            if(j['name']=="Purchases/Sales"){
              j["columnTemplate"] = (createElement, column) => {
                return createElement(
                  "span",
                  {
                    class: {
                      "column-ps": true,
                    },
                  },
                  column.name
                );
              };
              j.children?.map((c) => {
                c["columnTemplate"] = (createElement, column) => {
                  return createElement(
                    "span",
                    {
                      class: {
                        "column-ps": true,
                      },
                    },
                    column.name
                  );
                };

              });
            } else  if(j['name']=="Logistic Operations"){
              j["columnTemplate"] = (createElement, column) => {
                return createElement(
                  "span",
                  {
                    class: {
                      "column-lgso": true,
                    },
                  },
                  column.name
                );
              };
              j.children?.map((c) => {
                c["columnTemplate"] = (createElement, column) => {
                  return createElement(
                    "span",
                    {
                      class: {
                        "column-lgso": true,
                      },
                    },
                    column.name
                  );
                };

              });
            }else  if(j['name']=="Swaps"){
              j["columnTemplate"] = (createElement, column) => {
                return createElement(
                  "span",
                  {
                    class: {
                      "column-swaps": true,
                    },
                  },
                  column.name
                );
              };
              j.children?.map((c) => {
                c["columnTemplate"] = (createElement, column) => {
                  return createElement(
                    "span",
                    {
                      class: {
                        "column-swaps": true,
                      },
                    },
                    column.name
                  );
                };

              });
            }
            j.children?.map((c) => {
      

              c["sortable"] = true;
              c["size"] = 120 + Number(c["name"].length) * 3;
              c["autoSize"] = true;
              if (c["name"] == "Date") {
                c["pin"] = "colPinStart";
              } else if (c["filter"] == "number") {
                x["rows"]?.map((e, index) => {
                  e[c["prop"]] = this.numeral(
                    Number(e[c["prop"]].toFixed(2))
                  ).format("0,0.[0000]");
                });
                c["cellProperties"] = ({ prop, model, data, column }) => {
                  return {
                    class: {
                      numeric: true,
                    },
                  };
                };
              }
     
             
            });

          });

          return x;
        });
      })
    ).subscribe({
      next: (res) => {

      this.data=res;
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
    }).add(()=>{
      setTimeout(() => {
        document
          .querySelectorAll("revo-grid")
          .forEach((element) => (element.resize = true));
        document
          .querySelectorAll("revo-grid")
          .forEach((element) => (element.autoSizeColumn = true));
      });
      this.timestamp = new Date(
        new Date().toString().replace(/GMT.*$/, "GMT+0000")
      )
        .toISOString()
        .replace("Z", "")
        .replace("T", " ")
        .split(".")[0];

        this.loading=false;
    });

  }
  onChangeTab($event) {
    setTimeout(() => {
      document
        .querySelectorAll("revo-grid")
        .forEach((element) => (element.resize = true));
      document
        .querySelectorAll("revo-grid")
        .forEach((element) => (element.autoSizeColumn = true));
      document.querySelectorAll("revo-grid").forEach((element) => {});
    }, 1);
  }
  cancel() {
    this.ref.close();
  }

}
