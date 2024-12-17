import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  NbActionsModule,
  NbLayoutModule,
  NbMenuModule,
  NbSearchModule,
  NbSidebarModule,
  NbUserModule,
  NbContextMenuModule,
  NbButtonModule,
  NbSelectModule,
  NbIconModule,
  NbThemeModule,
  NbCardModule,
  NbCalendarModule,
  NbCalendarKitModule,
  NbBadgeModule,
  DARK_THEME,
} from "@nebular/theme";
import { NbEvaIconsModule } from "@nebular/eva-icons";
import { NbSecurityModule } from "@nebular/security";

import {
  FooterComponent,
  HeaderComponent,
} from "./components";
import {
  CapitalizePipe,
  PluralPipe,
  RoundPipe,
  TimingPipe,
  NumberWithCommasPipe,
} from "./pipes";
import {
  AppLayoutComponent
} from "./layouts";
import { DEFAULT_THEME } from "./styles/theme.default";
import { MatMenuModule } from "@angular/material/menu";
import { RevoGridModule } from "@revolist/angular-datagrid";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatCardModule } from "@angular/material/card";
import { DialogHeaderSettingsComponent } from "./components/header/dialog-header-settings/dialog-header-settings.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormsRoutingModule } from "../pages/forms/forms-routing.module";
import { D, M } from "@angular/cdk/keycodes";
import { DialogConfirmationComponent } from "./components/confirmation-dialog/dialog-confirmation-delete.component";

const NB_MODULES = [
  NbLayoutModule,
  NbMenuModule,
  NbUserModule,
  NbActionsModule,
  NbSearchModule,
  NbSidebarModule,
  NbContextMenuModule,
  NbSecurityModule,
  NbButtonModule,
  NbSelectModule,
  NbIconModule,
  NbEvaIconsModule,
  NbCardModule,
  FormsModule,
  ReactiveFormsModule,
  NbCalendarModule,
  NbCalendarKitModule,
  NbBadgeModule,
  NbCardModule,
  NbButtonModule,

  
];
const COMPONENTS = [
  HeaderComponent,
  FooterComponent,
 AppLayoutComponent
];
const PIPES = [
  CapitalizePipe,
  PluralPipe,
  RoundPipe,
  TimingPipe, 
  NumberWithCommasPipe,
];

@NgModule({
  imports: [CommonModule, ...NB_MODULES, MatMenuModule, RevoGridModule],
  exports: [CommonModule, ...PIPES, ...COMPONENTS],
  declarations: [...COMPONENTS, ...PIPES, DialogHeaderSettingsComponent, DialogConfirmationComponent],
})
export class ThemeModule {
  static forRoot(): ModuleWithProviders<ThemeModule> {
    return {
      ngModule: ThemeModule,
      providers: [
        ...NbThemeModule.forRoot(
          {
            name: "default-custom-theme",
          },
          [DEFAULT_THEME,DARK_THEME],
       
        ).providers,
      ],
    };
  }
}
