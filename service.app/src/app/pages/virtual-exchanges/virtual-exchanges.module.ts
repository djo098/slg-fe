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
import { ThemeModule } from "../../@theme/theme.module";
import { NbDateFnsDateModule } from "@nebular/date-fns";
import { MatMenuModule } from "@angular/material/menu";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { NbRoleProvider, NbSecurityModule } from "@nebular/security";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";
import { RoleProvider } from "../../role.provider";
import { DualListComponent } from "../dual-list/dual-list.component";
import { VirtualExchangesRoutingModule } from "./virtual-exchanges-routing.module";
import { VirtualExchangesComponent } from "./virtual-exchanges.component";
import { DialogVirtualExchangesComponent } from "./dialog-virtual-exchanges/dialog-virtual-exchanges.component";

@NgModule({
  declarations: [VirtualExchangesComponent, DialogVirtualExchangesComponent],
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
    ThemeModule,
    NbCheckboxModule,
    NbRadioModule,
    NbDateFnsDateModule,
    NbFormFieldModule,
    NbTimepickerModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbToggleModule,
    MatMenuModule,
    NbAutocompleteModule,
    AngularMultiSelectModule,
    NbSecurityModule,
    VirtualExchangesRoutingModule,
  ],
  providers: [
    ExcelService,
    { provide: LOCALE_ID, useValue: "en-001" },
    { provide: NbRoleProvider, useClass: RoleProvider },
  ],
})
export class VirtualExchangesModule {}
