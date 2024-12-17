import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import * as FileSaver from "file-saver";
import { type } from "os";

import {WorkSheet,utils,WorkBook,write} from "xlsx";
const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const EXCEL_TYPE_OLD = "application/vnd.ms-excel;charset=utf-8";
const EXCEL_EXTENSION = ".xlsx";
const EXCEL_EXTENSION_OLD = ".xls";
const CSV_EXTENSION = ".csv";
const CSV_TYPE = "text/plain;charset=utf-8";
@Injectable()
export class ExcelService {
  constructor(protected httpClient: HttpClient) {}
  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: WorkSheet = utils.json_to_sheet(json);
    const workbook: WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };
    const excelBuffer: any = write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  public exportAsExcelFileOld(json: any[], excelFileName: string): void {
    const worksheet: WorkSheet = utils.json_to_sheet(json);
    const workbook: WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };
    const excelBuffer: any = write(workbook, {
      bookType: "xls",
      type: "array",
    });
    this.saveAsExcelFileOld(excelBuffer, excelFileName);
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }
  private saveAsExcelFileOld(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE_OLD });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION_OLD);
  }
  public exportAsExcelFileWithMultipleSheets(
    json: any[],
    excelFileName: string,
    prop_name?
  ): void {
    var sheetsNames = [];
    var sheets = {};

    json.map((data) => {
      const exportExcel = [];
      const exportExcelColumns = [];
      data.rows.forEach((val) => exportExcel.push(Object.assign({}, val)));
      data.columns.forEach((val) =>
        exportExcelColumns.push(Object.assign({}, val))
      );
      exportExcel.map((x) => {
        exportExcelColumns.map((j) => {
          if (j["filter"] == "number" && j["prop"]!="DATE") {
            x[j["name"] + "*"] = Number(  x[j["prop"]].toString().replace(/\./g, "").replace(",", "."));
          
          } else {
            x[j["name"] + "*"] = x[j["prop"]];
          }

          j.children?.map((c) => {
   
       

          
           if(c["prop"]!== undefined){
            if (c["filter"] == "number" && c["prop"]!="DATE") {
              x[c["prop"] + "*"] = Number(  x[c["prop"]].toString().replace(/\./g, "").replace(",", "."));
            } else {
              x[c["prop"] + "*"] = x[c["prop"]];
            }

            delete x[c["prop"]];
            x[c["prop"].toUpperCase()] = x[c["prop"] + "*"];
            delete x[c["prop"] + "*"];
           }
         

       
            c.children?.map((l) => {
              if (l["filter"] == "number" && l["prop"]!="DATE") {
                x[l["prop"] + "*"] = Number(  x[l["prop"]].toString().replace(/\./g, "").replace(",", "."));
              } else {
                x[l["prop"] + "*"] = x[l["prop"]];
              }

              delete x[l["prop"]];
              if (prop_name) {
                if (l["prop"].includes("AGG_1")) {
                  x[
                    (l["prop"].replace("AGG_1", "") + l["name"]).toUpperCase()
                  ] = x[l["prop"] + "*"];
                } else if (l["prop"].includes("AGG_2")) {
                  x[
                    (l["prop"].replace("AGG_2", "") + l["name"]).toUpperCase()
                  ] = x[l["prop"] + "*"];
                } else {
                  x[(l["prop"] + l["name"]).toUpperCase()] = x[l["prop"] + "*"];
                }
              } else {
                x[l["prop"].toUpperCase()] = x[l["prop"] + "*"];
              }

              delete x[l["prop"] + "*"];
            });
          });

          delete x[j["prop"]];

          x[j["name"].toUpperCase()] = x[j["name"] + "*"];
          delete x[j["name"] + "*"];
     
           j.children?.map((c) => {
            delete x[j["name"].toUpperCase()];
            c.children?.map((l) => {
              delete x[c["prop"].toUpperCase()];
            });
          }); 
     
          delete x['RULES']
        });
        return x;
      });

      var worksheet: WorkSheet = utils.json_to_sheet(exportExcel);
      var name = data.name;

      sheetsNames.push(name);
      sheets[data.name] = worksheet; 
      //
    });

    const workbook: WorkBook = { Sheets: sheets, SheetNames: sheetsNames };
    const excelBuffer: any = write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
;
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  public exportAsExcelFileWithMultipleSheetsOld(
    json: any[],
    excelFileName: string
  ): void {
    var sheetsNames = [];
    var sheets = {};

    json.map((data) => {
      /* var json_temp
    json_temp = data;


   json_temp.rows.map((x)=>{
      json_temp.columns.map((j)=>{
        x[j['name']] =    x[j['prop']];
        delete x[j['prop']];
         j.children?.map((c)=>{
          x[c['name']] =    x[c['prop']];
          delete x[c['prop']];
        })
      })

    })  
 */
      var worksheet: WorkSheet = utils.json_to_sheet(data.rows);
      var name = data.name;

      sheetsNames.push(name);
      sheets[data.name] = worksheet;
      //
    });

    const workbook: WorkBook = { Sheets: sheets, SheetNames: sheetsNames };
    const excelBuffer: any = write(workbook, {
      bookType: "xls",
      type: "array",
    });
    this.saveAsExcelFileOld(excelBuffer, excelFileName);
  }

  public exportToCsv(
    rows: object[],
    fileName: string,
    columns?: string[]
  ): string {
    if (!rows || !rows.length) {
      return;
    }
    const separator = ";";
    const keys = Object.keys(rows[0]).filter((k) => {
      if (columns?.length) {
        return columns.includes(k);
      } else {
        return true;
      }
    });
    const csvContent =
      keys.join(separator) +
      "\n" +
      rows
        .map((row) => {
          return keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? "" : row[k];
            
              cell = typeof cell  === 'number' ? cell.toString().replaceAll('.',',') : cell
/* 
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              } */
              return cell;
            })
            .join(separator);
        })
        .join("\n");
    this.saveAsFile(csvContent, `${fileName}${CSV_EXTENSION}`, CSV_TYPE); 
  }

  private saveAsFile(buffer: any, fileName: string, fileType: string): void {
    const data: Blob = new Blob([buffer], { type: fileType });
    FileSaver.saveAs(data, fileName);
  }
}
