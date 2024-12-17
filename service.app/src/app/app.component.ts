/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit, Inject, TemplateRef } from "@angular/core";
import {
  MsalBroadcastService,
  MsalGuardConfiguration,
  MsalService,
  MSAL_GUARD_CONFIG,
} from "@azure/msal-angular";
import {
  AuthenticationResult,
  EventMessage,
  EventType,
  InteractionStatus,
  PopupRequest,
  RedirectRequest,
} from "@azure/msal-browser";
import { NbDialogService, NbIconLibraries, NbMenuItem } from "@nebular/theme";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { AnalyticsService } from "./@core/utils/analytics.service";
import { SeoService } from "./@core/utils/seo.service";
import { Buffer } from "buffer";
import { Idle, DEFAULT_INTERRUPTSOURCES } from "@ng-idle/core";
import { Keepalive } from "@ng-idle/keepalive";
import { NbAccessChecker } from "@nebular/security";
import { MENU_ITEMS } from "./pages/pages-menu";
import {  Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent implements OnInit {
  menu = MENU_ITEMS;
  idleState = "Not started.";
  timedOut = false;
  lastPing?: Date = null;
  title = "angular-idle-timeout";
  isIframe = false;
  loginDisplay = false;
  intervalID: any;
  profile= null;
  isUserLoggedIn=false;
  loading = false;
  private readonly _destroying$ = new Subject<void>();

  constructor(
    private analytics: AnalyticsService,
    private seoService: SeoService,
    private iconLibraries: NbIconLibraries,
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private idle: Idle,
    private keepalive: Keepalive,
    public accessChecker: NbAccessChecker,
    private router: Router
  ) {
    this.router.events.subscribe((event: Event) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.loading = true;
          break;
        }

        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          this.loading = false;
          break;
        }
        default: {
          break;
        }
      }
    });
    this.iconLibraries.registerFontPack("fas", {
      packClass: "fas",
      iconClassPrefix: "fa",
    });
    this.iconLibraries.registerFontPack("far", {
      packClass: "far",
      iconClassPrefix: "fa",
    });
    this.iconLibraries.registerFontPack("fab", {
      packClass: "fab",
      iconClassPrefix: "fa",
    });
    this.iconLibraries.registerFontPack("fal", {
      packClass: "fal",
      iconClassPrefix: "fa",
    });
    idle.setIdle(3540);
    // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    idle.setTimeout(60);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleEnd.subscribe(() => {
      this.reset();
    });

    idle.onTimeout.subscribe(() => {
      this.timedOut = true;
      const currentAccount = this.authService.instance.getAccountByHomeId(
        this.authService.instance.getAllAccounts()[0].homeAccountId
      );

      // Extract login hint to use as logout hint
      const logoutHint = currentAccount.idTokenClaims.login_hint;
      this.authService.logoutRedirect({ logoutHint: logoutHint });
    });

    keepalive.interval(15);

    keepalive.onPing.subscribe(() => (this.lastPing = new Date()));

    this.reset();
  }

  ngOnInit(): void {
    
    this.authMenuItems();
    this.setLoginDisplay();
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();
    const numeral = NumberColumnType.getNumeralInstance();
    numeral.register("locale", "es", {
      delimiters: {
        thousands: ".",
        decimal: ",",
      },
      abbreviations: {
        thousand: "k",
        million: "m",
        billion: "b",
        trillion: "t",
      },
      ordinal: function (number) {
        return number === 1 ? "er" : "er";
      },
      currency: {
        symbol: "€",
      },
    });
    if (typeof window !== 'undefined') {
      this.isIframe = window !== window.parent && !window.opener; 
    }
  
    this.authService.instance.enableAccountStorageEvents(); // Optional - This will enable ACCOUNT_ADDED and ACCOUNT_REMOVED events emitted when a user logs in or out of another tab or window
/*     this.msalBroadcastService.msalSubject$
      .pipe(
        filter(
          (msg: EventMessage) =>
            msg.eventType === EventType.ACCOUNT_ADDED ||
            msg.eventType === EventType.ACCOUNT_REMOVED
        )
      )
      .subscribe((result: EventMessage) => {
        if (this.authService.instance.getAllAccounts().length === 0) {
          window.location.pathname = "/";
        } else {
          this.setLoginDisplay();
        }
      }); */
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS)
      )
      .subscribe((result: EventMessage) => {
        this.authService.instance.getAllAccounts().length > 0 ? this.isUserLoggedIn=true : ''
        const payload = result.payload as AuthenticationResult;
        this.authService.instance.setActiveAccount(payload.account);
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter(
          (status: InteractionStatus) => status === InteractionStatus.None
        ),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.authService.instance.getAllAccounts().length > 0 ? this.isUserLoggedIn=true : ''
        this.setLoginDisplay();
      });
  }
  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }
/* 
  checkAndSetActiveAccount() {

    let activeAccount = this.authService.instance.getActiveAccount();

    if (
      !activeAccount &&
      this.authService.instance.getAllAccounts().length > 0
    ) {
      let accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  } */

  loginRedirect() {
    if (this.msalGuardConfig.authRequest) {
      this.authService.loginRedirect({
        ...this.msalGuardConfig.authRequest,
      } as RedirectRequest);
    } else {
      this.authService.loginRedirect();
    }
  }

  loginPopup() {
    if (this.msalGuardConfig.authRequest) {
      this.authService
        .loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
        .subscribe((response: AuthenticationResult) => {
          this.authService.instance.setActiveAccount(response.account);
        });
    } else {
      this.authService
        .loginPopup()
        .subscribe((response: AuthenticationResult) => {
          this.authService.instance.setActiveAccount(response.account);
        });
    }
  }

  logout(popup?: boolean) {
    if (popup) {
      this.authService.logoutPopup({
        mainWindowRedirectUri: "/",
      });
    } else {
      this.authService.logoutRedirect();
    }
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

  reset() {
    this.idle.watch();
    this.timedOut = false;
  }
  authMenuItems() {
    this.menu.forEach((item) => {
      this.authMenuItem(item);
    });
  }

  authMenuItem(menuItem: NbMenuItem) {
    if (
      menuItem.data &&
      menuItem.data["permission"] &&
      menuItem.data["resource"]
    ) {
      this.accessChecker
        .isGranted(menuItem.data["permission"], menuItem.data["resource"])
        .subscribe((granted) => {
          menuItem.hidden = !granted;
        });
    } else {
      menuItem.hidden = true;
    }
    if (!menuItem.hidden && menuItem.children != null) {
      menuItem.children.forEach((item) => {
        if (item.data && item.data["permission"] && item.data["resource"]) {
          this.accessChecker
            .isGranted(item.data["permission"], item.data["resource"])
            .subscribe((granted) => {
              item.hidden = !granted;
            });
        } else {
          // if child item do not config any `data.permission` and `data.resource` just inherit parent item's config
          item.hidden = menuItem.hidden;
        }
      });
    }
  }
  
}
