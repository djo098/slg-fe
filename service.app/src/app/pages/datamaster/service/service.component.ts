import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";

import { DialogServiceComponent } from "./dialog-service/dialog-service.component";
import { CountryService } from "../../../@core/services/country.service";
import * as alertifyjs from "alertifyjs";
import { messageService } from "../../../@core/utils/messages";
import { FormGroup } from "@angular/forms";
import { ConnectionPointService } from "../../../@core/services/connectionPoint.service";
import { DialogServiceNominalComponent } from "./dialog-service-nominal/dialog-service-nominal.component";
import { NbAccessChecker } from "@nebular/security";

@Component({
  selector: "ngx-service",
  templateUrl: "./service.component.html",
  styleUrls: ["./service.component.scss"],
})
export class ServiceComponent implements OnInit {
  defaultRowPerPageServices = 10;
  defaultRowPerPageTSO = 10;
  dataExport: any[];
  optionsPager : any;
  selectedServices: any;
  selectedTSO : any;
  loading: boolean;
  ngOnInit(): void {
    this.accessChecker.isGranted('create', 'services').subscribe(granted=> this.settingsServicesNominable.actions.add = granted);
    this.accessChecker.isGranted('create', 'services').subscribe(granted=> this.settingsServicesNominable.actions.edit = granted);

    this.optionsPager = [
      { value: 5 },
      { value: 10 },
      { value: 20 },
      { value: 50 },
      { value: 100 },
    ];
    this.selectedServices = this.optionsPager[0];
    this.selectedTSO = this.optionsPager[0];
    var object = localStorage.getItem('settings_parameters');
    if(object){
      object= JSON.parse(localStorage.getItem('settings_parameters'));
    
        this.sourceLogisticServicesNominable.setFilter([
          {
            field: "country",
            search: object['country_code'],
             filter: (value: string, searchValue: string) => {
              return new Date(value) == new Date(searchValue);
            }, 
          },
          {
            field: "balance_zone",
            search: object['balancing_zone_label'],
             filter: (value: string, searchValue: string) => {
              return new Date(value) == new Date(searchValue);
            }, 
          },
         ]) 
    }
  }
  settingsServices = {
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

    columns: {
      id: {
        title: "Id",
        type: "number",
        hide: true,
      },
      label: {
        title: "Label",
        type: "string",
      },
      description: {
        title: "Description",
        type: "string",
      },
      infrastructure_type: {
        title: "Infrastructure Type",
        type: "string",
      },
    },
    pager: {
      display: true,
      perPage: this.defaultRowPerPageServices,
    },
    attr: {
      class: "table",
    },
  };
  settingsServicesNominable = {
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

    columns: {
      id: {
        title: "Id",
        type: "number",
        hide: true,
      },
      service_id: {
        title: "Service Id",
        type: "number",
        hide: true,
      },
      service: {
        title: "Service",
        type: "string",
      },
      nominable: {
        title: "Scheduling in TSO",
        type: "string",
      },
      granularity: {
        title: "Granularity",
        type: "string",
        valuePrepareFunction: (value) =>{ return (value.toString().toLowerCase()).charAt(0).toUpperCase() + (value.toString().toLowerCase()).slice(1)  },
      },
      balance_zone: {
        title: "Balance Zone",
        type: "string",
     
      },
      country: {
        title: "Country",
        type: "string",
      },
      balance_zone_id: {
        title: "Balance Zone Id",
        type: "string",
        hide: true
      },
 
    },
    pager: {
      display: true,
      perPage: this.defaultRowPerPageTSO,
    },
    attr: {
      class: "table",
    },
  };

  sourceServices: LocalDataSource = new LocalDataSource();
  sourceLogisticServicesNominable: LocalDataSource = new LocalDataSource();

  constructor(
    private messageService: messageService,
    private dialogService: NbDialogService,
    private excelService: ExcelService,
    private apiConnectionPoint: ConnectionPointService,
    public accessChecker: NbAccessChecker
  ) {
    this.getServices();
    this.getServicesNominables();
  }

  getServices() {
    this.loading = true;
    this.apiConnectionPoint.getLogisticServices().subscribe({
      next: (res) => {

        this.sourceServices.load(res);
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
      this.loading=false;
    });;
  }
  getServicesNominables() {
    this.loading = true;
    this.apiConnectionPoint.getLogisticServicesBalanceZone().subscribe({
      next: (res) => {

        this.sourceLogisticServicesNominable.load(res);
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
      this.loading=false;
    });;
  }

  onEditService($event) {
    this.dialogService
      .open(DialogServiceComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Service",
          code: $event.data.code,
          description: $event.data.name,
          
          action: "Update",
        },
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getServices();
          this.getServicesNominables();
        }
      });
  }
  setPager() {
    this.sourceServices.setPaging(1, this.defaultRowPerPageServices, true);
    this.settingsServices = Object.assign({}, this.settingsServices);
    this.sourceLogisticServicesNominable.setPaging(1, this.defaultRowPerPageTSO, true);
    this.settingsServicesNominable = Object.assign({}, this.settingsServicesNominable);
  }
  onAddService($event) {
    this.dialogService
      .open(DialogServiceComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Service",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getServices();
          this.getServicesNominables();
        }
      });
  }
  exportAsXLSX() {
    this.sourceServices
      .getFilteredAndSorted()
      .then((value) => {
        value.map((x) => {
          delete x["parent_id"];
          return x;
        });
        this.excelService.exportAsExcelFile(value, "services");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSV() {
    this.sourceServices
      .getFilteredAndSorted()
      .then((value) => {
        value.map((x) => {
          delete x["parent_id"];
          return x;
        });
        this.excelService.exportToCsv(value, "services");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  onAddServiceNominable($event) {
    this.dialogService
      .open(DialogServiceNominalComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Service Configuration",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getServicesNominables();
        }
      });
  }

  
  onEditServiceNominable($event) {
   this.dialogService
      .open(DialogServiceNominalComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Service Configuration",
          id: $event.data.id,
          service_id: $event.data.service_id,
          balance_zone_id: $event.data.balance_zone_id,
          nominable: $event.data.nominable,
          country: $event.data.country,
          granularity: $event.data.granularity,
          action: "Update",
        },
        autoFocus: false
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getServicesNominables();
        }
      }); 
  }
  exportAsXLSXServicesNominative(){
    this.sourceLogisticServicesNominable
    .getFilteredAndSorted()
    .then((value) => {
      value.map((x) => {
        delete x["parent_id"];
        return x;
      });
      this.excelService.exportAsExcelFile(value, "nominative_services");
    })
    .catch((e) => {
      this.messageService.showToast("danger", "Error", e);
    });
  }
  exportAsCSVServicesNominative(){
    this.sourceLogisticServicesNominable
    .getFilteredAndSorted()
    .then((value) => {
      value.map((x) => {
        delete x["parent_id"];
        return x;
      });
      this.excelService.exportToCsv(value, "nominative_services");
    })
    .catch((e) => {
      this.messageService.showToast("danger", "Error", e);
    });
  }

  refreshTSO() {
    this.loading = true;
    this.getServicesNominables();

    }
    refreshService() {
      this.loading = true;
      this.getServices();
  
      }
}
