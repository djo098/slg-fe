import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { LOCALE_ID, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ExcelService } from "../../../@core/services/sharedServices/excel.service";
import {
  NbAccordionModule,
  NbButtonModule,
  NbCardModule,
  NbListModule,
  NbRouteTabsetModule,
  NbStepperModule,
  NbTabsetModule,
  NbUserModule,
  NbIconModule,
  NbInputModule,
  NbTreeGridModule,
  NbActionsModule,
  NbSelectModule,
  NbDialogModule,
  NbDatepickerModule,
  NbSpinnerModule,
  NbAlertModule,
  NbCheckboxModule,
  NbRadioModule,
  NbFormFieldModule,
  NbTimepickerModule,
  NB_TIME_PICKER_CONFIG,
  NbToggleModule,
  NbAutocompleteModule,
} from "@nebular/theme";
import { Ng2SmartTableModule } from "ng2-smart-table";

import { CountryService } from "../../../@core/services/country.service";

import { NbMomentDateModule } from "@nebular/moment";
import { NbDateFnsDateModule } from "@nebular/date-fns";
import { LegalEntityService } from "../../../@core/services/legalEntity.service";

import { PercentageDirective } from "../../../@core/utils/percentage.directive";

import { RevoGridModule } from "@revolist/angular-datagrid";
import { BalanceService } from "../../../@core/services/balance.service";
import { BalanceZoneService } from "../../../@core/services/balanceZone.service";

import { MatInputModule } from "@angular/material/input";
import { ThemeModule } from "../../../@theme/theme.module";

import { MatSnackBarModule } from "@angular/material/snack-bar";

import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { NbRoleProvider, NbSecurityModule } from "@nebular/security";

import { RoleProvider } from "../../../role.provider";

import { VesselRoutingModule } from "./vessel-routing.module";
import { VesselService } from "../../../@core/services/vessel.service";
import { VesselComponent } from "./vessel.component";
import { DialogVesselComponent } from "./dialog-vessel/dialog-vessel.component";

@NgModule({
  declarations: [VesselComponent, DialogVesselComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NbTabsetModule,
    NbRouteTabsetModule,
    NbStepperModule,
    NbCardModule,
    NbButtonModule,
    NbListModule,
    NbAccordionModule,
    NbUserModule,
    RouterModule,
    NbCardModule,
    NbTreeGridModule,
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
    NbInputModule,
    NbCardModule,
    NbButtonModule,
    NbActionsModule,
    NbUserModule,
    NbCheckboxModule,
    NbRadioModule,
    NbDateFnsDateModule,
    NbSelectModule,
    NbIconModule,
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
    VesselRoutingModule,
  ],
  providers: [
    ExcelService,
    VesselService,
    { provide: LOCALE_ID, useValue: "en-001" },
    { provide: NbRoleProvider, useClass: RoleProvider },
  ],
})
export class VesselModule {}
