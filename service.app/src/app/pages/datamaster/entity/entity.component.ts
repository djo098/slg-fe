import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";

import { DialogEntityComponent } from "./dialog-entity/dialog-entity.component";
import { LegalEntityService } from "../../../@core/services/legalEntity.service";
import { Console } from "console";

import * as alertifyjs from "alertifyjs";
import { messageService } from "../../../@core/utils/messages";
import { DialogAssociationComponent } from "./dialog-association/dialog-association.component";
import { NbAccessChecker } from "@nebular/security";
@Component({
  selector: "ngx-entity",
  templateUrl: "./entity.component.html",
  styleUrls: ["./entity.component.scss"],
})
export class EntityComponent implements OnInit {
  defaultRowPerPageEntity = 10;
  defaultRowPerPageTSO = 10;
  dataExport: any[];
  optionsPager: any;
  selectedEntity: any;
  selectedTSO: any;
  loading: boolean;
  ngOnInit(): void {
    this.accessChecker
      .isGranted("create", "legal-entities")
      .subscribe((granted) => (this.settings.actions.add = granted));
    this.accessChecker
      .isGranted("create", "legal-entities")
      .subscribe((granted) => (this.settings.actions.edit = granted));
    this.accessChecker
      .isGranted("create", "legal-entities")
      .subscribe(
        (granted) => (this.settingsTSOAssociation.actions.add = granted)
      );
    this.accessChecker
      .isGranted("create", "legal-entities")
      .subscribe(
        (granted) => (this.settingsTSOAssociation.actions.edit = granted)
      );

    this.optionsPager = [
      { value: 5 },
      { value: 10 },
      { value: 20 },
      { value: 50 },
      { value: 100 },
    ];
    this.selectedEntity = this.optionsPager[0];
    this.selectedTSO = this.optionsPager[0];
    var object = localStorage.getItem("settings_parameters");
    if (object) {
      object = JSON.parse(localStorage.getItem("settings_parameters"));
      this.source.setFilter([
        {
          field: "country_code",
          search: object["country_code"],
          filter: (value: string, searchValue: string) => {
            return new Date(value) == new Date(searchValue);
          },
        },
      ]);
      this.sourceTSOAssociation.setFilter([
        {
          field: "country",
          search: object["country_code"],
          filter: (value: string, searchValue: string) => {
            return new Date(value) == new Date(searchValue);
          },
        },
      ]);
    }
  }
  settings = {
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
      name: {
        title: "Name",
        type: "string",
      },
      code: {
        title: "Code",
        type: "string",
      },
      active: {
        title: "Active",
        type: "string",
      },
      country_code: {
        title: "Country",
        type: "string",
      },

      type: {
        title: "Type",
        type: "string",
      },
      eic: {
        title: "EIC Code",
        type: "string",
      },
      vat_code: {
        title: "VAT",
        type: "string",
      },
      address: {
        title: "Address",
        type: "string",
      },
      email: {
        title: "Email",
        type: "string",
      },
      source_type: {
        title: "Source Type",
        type: "string",
      },
    },
    pager: {
      display: true,
      perPage: this.defaultRowPerPageEntity,
    },
  };
  settingsTSOAssociation = {
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
      tso_code: {
        title: "TSO Code",
        type: "string",
      },
      legal_entity_id: {
        title: "Legal Entity Id",
        type: "number",
        hide: true,
      },
      legal_entity: {
        title: "Legal Entity",
        type: "string",
      },
      balance_zone_id: {
        title: "Balance Zone Id",
        type: "string",
        hide: true,
      },
      balance_zone: {
        title: "Balance Zone Label",
        type: "string",
      },
      country: {
        title: "Country",
        type: "string",
      },
      primary: {
        title: "Primary",

        type: "boolean",
      },
    },
    pager: {
      display: true,
      perPage: this.defaultRowPerPageTSO,
    },
  };
  source: LocalDataSource = new LocalDataSource();
  sourceTSOAssociation: LocalDataSource = new LocalDataSource();

  constructor(
    private messageService: messageService,
    private dialogService: NbDialogService,
    private excelService: ExcelService,
    private apiLegalEntity: LegalEntityService,
    public accessChecker: NbAccessChecker
  ) {
    this.getLegalEntities();
    this.getLegalEntitiesTSOAssociation();
  }

  getLegalEntities() {
    this.loading = true;
    this.apiLegalEntity
      .getLegalEntities()
      .subscribe({
        next: (res) => {
          const data = res;

          this.source.load(data);
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
        this.loading = false;
      });
  }
  onEdit($event) {
    this.dialogService
      .open(DialogEntityComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Legal Entity",
          id: $event.data.id,
          name: $event.data.name,
          code: $event.data.code,
          country_code: $event.data.country_code,
          type: $event.data.type,
          active: $event.data.active,
          address: $event.data.address,
          email: $event.data.email,
          eic: $event.data.eic,
          vat: $event.data.vat_code,
          source_type: $event.data.source_type,
          action: "Update",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getLegalEntities();
        }
      });
  }
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPageEntity, true);
    this.settings = Object.assign({}, this.settings);
    this.sourceTSOAssociation.setPaging(1, this.defaultRowPerPageTSO, true);
    this.settingsTSOAssociation = Object.assign(
      {},
      this.settingsTSOAssociation
    );
  }
  onAdd($event) {
    this.dialogService
      .open(DialogEntityComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Legal Entity",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getLegalEntities();
        }
      });
  }
  exportAsXLSX() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "legal_entities");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSV() {
    this.source
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "legal_entities");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  getLegalEntitiesTSOAssociation() {
    this.loading = true;
    this.apiLegalEntity
      .getTSOCodesLegalEntities()
      .subscribe({
        next: (res) => {
          const data = res;

          this.sourceTSOAssociation.load(data);
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
        this.loading = false;
      });
  }
  onEditTSOAssociation($event) {
    this.dialogService
      .open(DialogAssociationComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "Edit Association",
          id: $event.data.id,
          code: $event.data.tso_code,
          legal_entity_id: $event.data.legal_entity_id,
          legal_entity_label: $event.data.legal_entity,
          balance_zone_id: $event.data.balance_zone_id,
          country_code: $event.data.country,
          primary: $event.data.primary,
          action: "Update",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "update") {
          this.getLegalEntitiesTSOAssociation();
        }
      });
  }

  onAddTSOAssociation($event) {
    this.dialogService
      .open(DialogAssociationComponent, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          title: "New Association",
          action: "Add",
        },
        autoFocus: false,
      })
      .onClose.subscribe((val) => {
        if (val === "save") {
          this.getLegalEntitiesTSOAssociation();
        }
      });
  }
  exportAsXLSXTSOAssociation() {
    this.sourceTSOAssociation
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportAsExcelFile(value, "legal_entities_TSO_codes");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }
  exportAsCSVTSOAssociation() {
    this.sourceTSOAssociation
      .getFilteredAndSorted()
      .then((value) => {
        this.excelService.exportToCsv(value, "legal_entities_TSO_codes");
      })
      .catch((e) => {
        this.messageService.showToast("danger", "Error", e);
      });
  }

  refreshTSO() {
    this.loading = true;
    this.getLegalEntitiesTSOAssociation();
  }

  refreshEntity() {
    this.loading = true;
    this.getLegalEntities();
  }
}
