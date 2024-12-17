/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import "@angular/common/locales/global/en-001";
import { BrowserModule } from "@angular/platform-browser";
import { NbSecurityModule, NbRoleProvider } from '@nebular/security';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from "@angular/platform-browser/animations";
import { LOCALE_ID, NgModule } from "@angular/core";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { CoreModule } from "./@core/core.module";
import { ThemeModule } from "./@theme/theme.module";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { AuthInterceptor } from './auth-interceptor.service';
import {
  NbDatepickerModule,
  NbDialogModule,
  NbMenuModule,
  NbSidebarModule,
  NbTimepickerModule,
  NbToastrModule,
  NbWindowModule,
} from "@nebular/theme";
import { NbDateFnsDateModule } from "@nebular/date-fns";
import {
  MsalBroadcastService,
  MsalGuard,
  MsalGuardConfiguration,
  MsalInterceptor,
  MsalInterceptorConfiguration,
  MsalModule,
  MsalRedirectComponent,
  MsalService,
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
} from "@azure/msal-angular";
import {
  BrowserCacheLocation,
  InteractionType,
  IPublicClientApplication,
  LogLevel,
  PublicClientApplication,
} from "@azure/msal-browser";
import { ExcelService } from "./@core/services/sharedServices/excel.service";
import {
  AngularMultiSelectModule,
} from "angular2-multiselect-dropdown";
import { environment } from "./../environments/environment";
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { RoleProvider } from "./role.provider";
import { accessControl } from "./access-control";
import { AuthGuard } from "./AuthGuard";


const isIE =
  window.navigator.userAgent.indexOf("MSIE ") > -1 ||
  window.navigator.userAgent.indexOf("Trident/") > -1; // Remove this line to use Angular Universal

export function loggerCallback(logLevel: LogLevel, message: string) { }

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.clientId,
      authority: environment.authority,
      redirectUri: "/",
      postLogoutRedirectUri: "/",
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: isIE, // set to true for IE 11. Remove this line to use Angular Universal
    },
    system: {
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false,
      },
    },
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set("https://graph.microsoft.com/v1.0/me", [
    "user.read",
  ]);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ["user.read"],
    },
    loginFailedRoute: "/login-failed",
  };
}
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbDialogModule.forRoot(),
    NbWindowModule.forRoot(),
    NbToastrModule.forRoot(),
    CoreModule.forRoot(),
    ThemeModule.forRoot(),
    MsalModule,
    NgIdleKeepaliveModule.forRoot(),
    NbSecurityModule.forRoot({
      accessControl: accessControl,
    }),
    AngularMultiSelectModule,
    NbDatepickerModule.forRoot(),
    NbTimepickerModule.forRoot(),
    NbDateFnsDateModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory,
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    { provide: LOCALE_ID, useValue: "en-001" },
    { provide: NbRoleProvider, useClass: RoleProvider },
    AuthGuard,
    ExcelService,
  ],
  bootstrap: [AppComponent, MsalRedirectComponent],
})

export class AppModule {

}