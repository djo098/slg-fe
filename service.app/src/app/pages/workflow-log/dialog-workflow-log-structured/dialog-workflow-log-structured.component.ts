import { DatePipe } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
} from "@angular/forms";

import { NbDialogRef, NbDialogService } from "@nebular/theme";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { map } from "rxjs/operators";
import { DarkModeService } from "../../../@core/services/sharedServices/darkMode.service";
import { WorkflowService } from "../../../@core/services/workflow.service";
import { messageService } from "../../../@core/utils/messages";
import { DialogWorkflowLogComponent } from "../dialog-workflow-log/dialog-workflow-log.component";

interface DialogContext {
  title: string;
  action: string;
  id: any;
  request_data?: string;
  timestamp?: string;
  user_id?: string;
  status?: string;
  source?: string;
  response_data?: string;
  resource?: string;
  method?: string;
  endpoint?: string;
  destination?: string;
  step_name?: string;
}


@Component({
  selector: "ngx-dialog-workflow-log-structured",
  templateUrl: "./dialog-workflow-log-structured.component.html",
  styleUrls: ["./dialog-workflow-log-structured.component.scss"],
})
export class DialogWorkflowLogStructuredComponent implements OnInit {

  // Define any required input properties here
  @Input() request_data: string;
  @Input() title: string;
  @Input() timestamp: string;
  @Input() user_id: string;
  @Input() status: string;
  @Input() source: string;
  @Input() response_data: string;
  @Input() resource: string;
  @Input() method: string;
  @Input() endpoint: string;
  @Input() destination: string;
  @Input() id: number;
  loading: boolean = false;

  @Input() action: string;
  @Input() step_name: string;

  //@Input() title: string; 
  //@Input() id: number;
  //loading = false;
  operationForm!: FormGroup;
  columns: any;
  rows = [];
  validateRevogrid = true;
  errorSatelital = false;
  satelitalOptions: any;
  labelSatelital: any;
  logisticContractsOptions: any;
  regasificationPlantOptions: any;
  errorRegasificationPlant = false;
  entitiesOptions: any;
  entitiesOptions2: any;
  errorLegalEntity = false;
  errorLegalEntity2 = false;
  zoneOptions: any;
  errorBalanceZone = false;
  countriesOptions: any;
  errorLogisticContract = false;
  selectedLogisticContracts: any;
  numeral = NumberColumnType.getNumeralInstance();
  isDuplicate = false;
  start_date: any;
  end_date: any;
  balanceZone: any;
  legalEntity: any;
  connection_point: any;
  settings = {
    singleSelection: true,
    text: "",
    enableSearchFilter: true,
    badgeShowLimit: 2,
  };
  revogridTheme: string;
  eventTimes1 = [];
  constructor(
    private formBuilder: FormBuilder,
    public datepipe: DatePipe,
    protected ref: NbDialogRef<DialogWorkflowLogStructuredComponent>,
    private apiWorkflow: WorkflowService, 
    private darkModeService: DarkModeService,
    private messageService: messageService,
    private dialogService: NbDialogService  
  ) { }


  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getStructuredRequestData(id: any) {
    const context: DialogContext = {
      title: "Workflow log - step technical detail",
      action: "View",
      id: id,
      request_data: this.request_data,
      timestamp: this.timestamp,
      user_id: this.user_id,
      status: this.status,
      source: this.source,
      response_data: this.response_data,
      resource: this.resource,
      method: this.method,
      endpoint: this.endpoint,
      destination: this.destination,
    };

    this.dialogService.open(DialogWorkflowLogComponent, {
      closeOnEsc: true,
      closeOnBackdropClick: false,
      context: context,
      autoFocus: false,
    });
  }
/*
  getStructuredRequestData(id) {
    this.dialogService.open(DialogWorkflowLogComponent, {
        closeOnEsc: true,
        closeOnBackdropClick: false,
        context: {
          title: "Step Result - Details",
          action: "View",
          id: id,
        },
        autoFocus: false,
      })
  }
*/
  

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
    this.operationForm = this.formBuilder.group({
      id: new FormControl("")
    });
    this.loading = true;
    this.operationForm.get("id").setValue(this.id);
    this.getStructuredLog(this.id);
    this.operationForm.disable();

    this.columns = [];
    //this.makeColumnsReadOnly(this.columns);

    this.settings = Object.assign({ disabled: true }, this.settings);
    this.loading = false
  }

  //makeColumnsReadOnly(columns: any[]): void {
  //  columns.forEach(column => {
  //      column.readonly = true;
  //  });
  //}

  getStructuredLog(id) {
    this.apiWorkflow   
      .getWorkflowLogStructured(id)
        .pipe(
        map((data) => {

          data.columns.map((x)=> {
            x["size"] = 160;
            if(x["type"]=="number"){

              data.rows.map((m)=> {

                m[x["prop"]] = this.numeral(Number(m[x["prop"]])).format("0,0.[00]");
                return m;
              })
            }
            return x;
            
          })
          
          return data;

        }))
 
      .subscribe({
        next: (res) => {
          // Assuming the first row of the response contains the column names
          this.columns = res.columns;
          // Make columns readonly
          this.columns.forEach((column) => {
            column.readonly = true;
          });
          
          
          //const columnNames = Object.keys(res[0]);
          
          // Dynamically generate column definitions based on column names
/*           this.columns = columnNames.map((name) => ({
            prop: name,
            name: this.capitalizeFirstLetter(name), // Optional: Capitalize the first letter of the column name
            size: 120 + name.length * 5, // Adjust size dynamically based on column name length
            readonly: true,
            sortable: true,
            cellProperties: ({ prop, model, data, column }) => {
              return {
                class: {
                  numeric: column.name === 'value', // Apply 'numeric' class if it's the 'value' column
                },
              };
            },
          }));
 */
          this.rows = res.rows;
          this.rows.forEach((row) => {
            row.readonly = true;
          });


          
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting structured log"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        document.querySelector("revo-grid").source = [];
        document.querySelector("revo-grid").source = this.rows;

      });
  }


  
  onAfterEdit($event) { }
  onBeforeEditStart(e, { detail }) { }
  onBeforeEdit(e, { detail }) { }
  onBeforeRangeEdit(e, { detail }) { }
  cancel() {
    this.ref.close();
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
