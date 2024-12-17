import { LOCALE_ID, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  NbAccordionModule,
  NbActionsModule,
  NbAlertModule,
  NbAutocompleteModule,
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbDatepickerModule,
  NbDialogModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbListModule,
  NbRadioModule,
  NbRouteTabsetModule,
  NbSelectModule,
  NbSpinnerModule,
  NbStepperModule,
  NbTabsetModule,
  NbTimepickerModule,
  NbToggleModule,
  NbUserModule,    
} from "@nebular/theme";
import { RouterModule } from "@angular/router";
import { Ng2SmartTableModule } from "ng2-smart-table";
import { RevoGridModule } from "@revolist/angular-datagrid";
import { MatInputModule } from "@angular/material/input";
import { ThemeModule } from "../../@theme/theme.module";
import { NbDateFnsDateModule } from "@nebular/date-fns";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { NbRoleProvider, NbSecurityModule } from "@nebular/security";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";
import { RoleProvider } from "../../role.provider";

import { WorkflowLogRoutingModule } from './workflow-log-routing.module';
import { WorkflowLogComponent } from "./workflow-log.component";
import { DialogWorkflowLogComponent } from "./dialog-workflow-log/dialog-workflow-log.component";
import { DialogWorkflowLogStructuredComponent } from "./dialog-workflow-log-structured/dialog-workflow-log-structured.component";

@NgModule({
  declarations: [WorkflowLogComponent, DialogWorkflowLogComponent, DialogWorkflowLogStructuredComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NbTabsetModule,
    NbRouteTabsetModule,
    NbCardModule,
    NbButtonModule,
    NbListModule,
    NbAccordionModule,
    RouterModule,
    NbCardModule,
    NbIconModule,
    NbInputModule,
    Ng2SmartTableModule,
    NbActionsModule,
    NbSelectModule,
    NbDialogModule,
    NbSpinnerModule,
    NbAlertModule,
    RevoGridModule,
    NbSpinnerModule,
    MatInputModule,
    ThemeModule,
    NbCheckboxModule,
    NbRadioModule,
    NbDateFnsDateModule,
    NbFormFieldModule,
    MatSnackBarModule,
    NbTimepickerModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbToggleModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    NbAutocompleteModule,
    AngularMultiSelectModule,
    MatIconModule,
    NbSecurityModule,
    WorkflowLogRoutingModule
  ],
  providers: [
    ExcelService,
    { provide: LOCALE_ID, useValue: "en-001" },
    { provide: NbRoleProvider, useClass: RoleProvider },
  ],
})
export class WorkflowLogModule { }
