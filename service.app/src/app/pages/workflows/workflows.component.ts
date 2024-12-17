import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";

import { NbAccessChecker } from "@nebular/security";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { JobsService } from "../../@core/services/jobs.service";
import { WorkflowService } from "../../@core/services/workflow.service";
import { messageService } from "../../@core/utils/messages";
import { DialogConfirmationComponent } from "../../@theme/components/confirmation-dialog/dialog-confirmation-delete.component";
import { DialogWorkflowComponent } from "./dialog-workflow/dialog-workflow.component";

@Component({
  selector: 'slg-workflows',
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.scss']
})
export class WorkflowsComponent implements OnInit {
  defaultRowPerPageAutoNomination = 10;
  dataExport: any[];
  paramsOptions: any;
  optionsPager: any;
  selectedAutoNomination: any;
  numeral = NumberColumnType.getNumeralInstance();
  
  loading: boolean;
  ngOnInit(): void {
    this.accessChecker
      .isGranted("create", "workflows")
      .subscribe((granted) => (this.settingsAutoNomination.actions.add = granted));
    this.accessChecker
      .isGranted("create", "workflows")
      .subscribe((granted) => (this.settingsAutoNomination.actions.edit = granted));
    this.accessChecker
      .isGranted("remove", "workflows")
      .subscribe((granted) => (this.settingsAutoNomination.actions.delete = granted));

    this.optionsPager = [
      { value: 5 },
      { value: 10 },
      { value: 20 },
      { value: 50 },
      { value: 100 },
    ];
    this.selectedAutoNomination = this.optionsPager[0];
    this.selectedAutoNomination = this.optionsPager[0];
    this.numeral.locale("es");
    var object = localStorage.getItem("settings_autoNomination");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_autoNomination"));
      this.sourceAutoNomination.setFilter([
        {
          field: "country_code",
          search: object["country_code"],
          filter: (value: string, searchValue: string) => {
            return value == searchValue;
          },
        },
        {
          field: "balance_zone_name",
          search: object["balancing_zone_label"].toString(),
          filter: (value: string, searchValue: string) => {
            return value == searchValue;
          },
        },
      ]);
    }

  }


  settingsAutoNomination = {
    mode: "external",
    actions: {
      add: false,
      edit: false,
      delete: false,
    },
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
    },
    edit: {
      editButtonContent: '<i class="fas fa-pen fa-xs" title="Edit"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="fas fa-trash fa-xs" title="Delete"></i>',
    },

    columns: {
      
      active: {
        title: "Activated",
        type: "string",
        width: "125px",


        valuePrepareFunction: (value) => {
          if (value=="true") {
            return "ENABLED";
          } else if (value=="false"){
            return "DISABLED";
          }
        }, 
        filter: {
          type: 'list',
          config: {
            selectText: 'All',
            list: [
              { value: 'true', title: 'ENABLED' },
              { value: 'false', title: 'DISABLED' },
            ],
          },
        },
        sortDirection: 'desc',
        
      },

      id: {
        title: "Id",
        type: "string",
        hide: true
      },
      label: {
        title: "Label",
        type: "string",
        width: "200px"

      },
      periodicity: {
        title: "Periodicity",
        type: "string",
        width: "125px",
        valuePrepareFunction: (value) => {
          return value + " min";
        }, 
        filter: {
          type: 'list',
          config: {
            selectText: 'All',
            list: [
              { value: '1', title: '1 min' },
              { value: '5', title: '5 min' },
              { value: '10', title: '10 min' },
              { value: '15', title: '15 min' },
              { value: '30', title: '30 min' },
              { value: '45', title: '45 min' },
              { value: '60', title: '60 min' },
            ],
          },
        },
      },
      daily_start_time: {
        title: "Start time",
        type: "string",
        width: "125px",
        filter: false,
      },
      daily_end_time: {
        title: "End time",
        type: "string",
        width: "125px",
        filter: false,
      },
      country: {
        title: "Country",
        type: "string",
        width: "150px"
      },
      balance_zone_id: {
        title: "Balancing Zone Id",
        type: "number",
        hide: true
      },
      balance_zone: {
        title: "Balancing Zone",
        type: "string",
        width: "150px"
      },

      legal_entity_id: {
        title: "Legal Entity Id",
        type: "string",
        hide: true,

      },

      legal_entity: {
        title: "Legal Entity",
        type: "string",
        width: "200px"
      },


    },
    pager: {
      display: true,
      perPage: this.defaultRowPerPageAutoNomination,
    },
  };

  sourceAutoNomination: LocalDataSource = new LocalDataSource();

  constructor(    private messageService: messageService,
    public accessChecker: NbAccessChecker,
    private jobService : JobsService,
    private excelService: ExcelService,
    private dialogService: NbDialogService,
    private apiWorkflow: WorkflowService,
    ) {this.getAutoNominations();}
    


    getAutoNominations(){
      this.loading = true;
      this.apiWorkflow.getAllWorkflowConfigurations().subscribe({
        next: (res) => {
          res.map((x)=> {
            x["active"] = String(x["active"]);
            return x;
          }

          )
          const data = res;
          
          this.sourceAutoNomination.load(data);
        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting nominaion workflows"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      }).add(()=>{
        this.loading=false;

      }
      
      );
    }
    onEditAutoNomination($event) {
      this.dialogService
      .open(DialogWorkflowComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Workflow",
          action: "Update", 
          id: $event.data.id,
          activated: $event.data.active,
          label: $event.data.label,
          country: $event.data.country,
          balance_zone: $event.data.balance_zone_id,
          legal_entity: $event.data.legal_entity_id,
          periodicity: $event.data.periodicity,
          start_time: $event.data.daily_start_time,
          end_time: $event.data.daily_end_time,
          error_message: $event.data.error_message
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getAutoNominations();
        }
      });

    }
    onAddAutoNomination($event) {
      this.dialogService
      .open(DialogWorkflowComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Add Workflow",
          action: "Add", 
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getAutoNominations();
        }
      });
    }

    onDeleteAutoNomination($event) {
      
      this.dialogService
      .open(DialogConfirmationComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          body: 'Are you sure you want to delete this workflow? This workflow will be removed in SLG.',
          title: "Confirmation Delete",
          button: "Delete",
          status_cancel: 'basic',
          status_confirm: 'danger'
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
   
        if (val === "yes") {
          this.loading= true;
          this.apiWorkflow
          .removeWorkflowConfiguration(Number($event.data.id))
          .subscribe({
            next: (res) => {
             
              this.messageService.showToast(
                "success",
                "Success",
                "Workflow deleted successfully!"
              );
            },
            error: (e) => {
              if (e.error.title == "Internal Server Error") {
                this.messageService.showToast(
                  "danger",
                  "Error",
                  "Internal server error while deleting Workflow"
                );
              } else {
                this.messageService.showToast("danger", "Error", e.error);
              }
            },
          })
          .add(() => {
            this.getAutoNominations();
        
          });
        }
      });
      

    }

    refreshAutoNominations(){
      this.loading=true;
      this.getAutoNominations();
    }
    exportAsXLSXWorkflows(){
      this.sourceAutoNomination
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "nomination_workflows");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
    }
    exportAsCSVWorkflows(){
      this.sourceAutoNomination
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "nomination_workflows");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
    }
    setPager() {
      this.sourceAutoNomination.setPaging(1, this.defaultRowPerPageAutoNomination, true);
      this.settingsAutoNomination = Object.assign({}, this.settingsAutoNomination);
    }




}
