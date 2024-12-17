import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";

import {
  NbContextMenuDirective,
  NbDialogService,
  NbMediaBreakpointsService,
  NbMenuItem,
  NbMenuService,
  NbSidebarService,
  NbThemeService,
} from "@nebular/theme";
import { LayoutService } from "../../../@core/utils";
import { filter, map, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { MsalBroadcastService, MsalService } from "@azure/msal-angular";
import { MatMenuTrigger } from "@angular/material/menu";
import { DialogHeaderSettingsComponent } from "./dialog-header-settings/dialog-header-settings.component";
const GRAPH_ENDPOINT = "https://graph.microsoft.com/v1.0/me"; // Prod graph endpoint. Uncomment to use.
import { platformBrowser } from "@angular/platform-browser";
import { platform } from "os";
import { ReportingService } from "../../../@core/services/reporting.service";
import { DatePipe } from "@angular/common";
import { ProfileService } from "../../../@core/services/sharedServices/auth.service";
import {
  EventMessage,
  EventType,
  InteractionStatus,
} from "@azure/msal-browser";
import { MENU_ITEMS } from "../../../pages/pages-menu";
import { DarkModeService } from "../../../@core/services/sharedServices/darkMode.service";
import { NbAccessChecker } from "@nebular/security";

@Component({
  selector: "app-header",
  styleUrls: ["./header.component.scss"],
  templateUrl: "./header.component.html",
})
export class HeaderComponent implements OnInit, OnDestroy {
  menu = MENU_ITEMS;
  @ViewChild(NbContextMenuDirective) contextMenu: NbContextMenuDirective;
  private destroy$: Subject<void> = new Subject<void>();
  private readonly _destroying$ = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;
  profile!: any;
  notificationCount: any = 0;
  accountHome: any;
  items = [{ title: "Profile" }, { title: "Log out" }];
  themes = [
    {
      value: "default",
      name: "Light",
    },
    {
      value: "dark",
      name: "Dark",
    },
    {
      value: "custom-theme",
      name: "Custom Theme",
    },
    {
      value: "cosmic",
      name: "Cosmic",
    },
    {
      value: "corporate",
      name: "Corporate",
    },
  ];
  icon_mode_theme: string = "moon";
  currentTheme = "default";
  intervalID: any;
  userMenu = [{ title: "Log out", data: { id: "logout" } }];
  modeDark: boolean = false;
  modeDarkValue = new EventEmitter();
  constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
    private http: HttpClient,
    private nbMenuService: NbMenuService,
    private authService: MsalService,
    private dialogService: NbDialogService,
    private apiReporting: ReportingService,
    private apiProfile: ProfileService,
    public datepipe: DatePipe,
    private msalBroadcastService: MsalBroadcastService,
    private darkModeService: DarkModeService,
    public accessChecker: NbAccessChecker
  ) {}

  ngOnInit() {
    this.modeDark = /true/.test(localStorage.getItem("dark_mode"));
    if (this.modeDark == true) {
      this.icon_mode_theme = "sun";
      this.themeService.changeTheme("dark-custom-theme");
    } else if (this.modeDark == false) {
      this.icon_mode_theme = "moon";
      this.themeService.changeTheme("default-custom-theme");
    }
    this.darkModeService.toggleDarkModeVisibility(this.modeDark);
    this.icon_mode_theme = "moon";
    this.msalBroadcastService.inProgress$
      .pipe(
        filter(
          (status: InteractionStatus) => status === InteractionStatus.None
        ),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
      });
    this.currentTheme = this.themeService.currentTheme;
    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService
      .onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$)
      )
      .subscribe(
        (isLessThanXl: boolean) => (this.userPictureOnly = isLessThanXl)
      );

    this.themeService
      .onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$)
      )
      .subscribe((themeName) => (this.currentTheme = themeName));

    this.nbMenuService
      .onItemClick()
      .pipe(filter(({ tag }) => tag === "my-context-menu"))
      .subscribe((item: any) => {
        if (item["item"]["title"] === "Log out") {
          this.logout();
        }
      });

    /* 
    this.intervalID = setInterval(() => {
      this.validateAlertImbalancePrices();
    }, 120 * 1000); */
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  setLoginDisplay() {
    this.http.get(GRAPH_ENDPOINT).subscribe((profile) => {
      this.profile = profile;

      this.accountHome = this.authService.instance.getAccountByLocalId(
        profile["id"]
      );
    });
    /*    this.http.get("https://graph.microsoft.com/v1.0/me/appRoleAssignments").subscribe((profile) => {

  
    }); */
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, "menu-sidebar");
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  logout(popup?: boolean) {
    if (popup) {
      this.authService.logoutPopup({
        mainWindowRedirectUri: "/",
      });
    } else {
      /*
    const logoutRequest = {
      account: this.authService.instance.getAccountByHomeId()
    };

    
/*     this.authService.logoutRedirect(logoutRequest);  */
      const currentAccount = this.authService.instance.getAccountByHomeId(
        this.authService.instance.getAllAccounts()[0].homeAccountId
      );

      // Extract login hint to use as logout hint
      const logoutHint = currentAccount.idTokenClaims.login_hint;
      this.authService.logoutRedirect({ logoutHint: logoutHint });
    }
  }

  openDialogSettings() {
    this.dialogService.open(DialogHeaderSettingsComponent, {
      autoFocus: false,
    });
  }

  getProfile() {
    this.apiProfile.getInfo().subscribe((res) => (this.profile = res));
  }
  openMyMenu(menuTrigger: MatMenuTrigger) {
    menuTrigger.openMenu();
  }

  validateAlertImbalancePrices() {}
  modeBackground() {
    this.modeDark = !this.modeDark;
    if (this.modeDark == true) {
      localStorage.setItem("dark_mode", this.modeDark.toString());
      this.icon_mode_theme = "sun";
      this.themeService.changeTheme("dark-custom-theme");
    } else if (this.modeDark == false) {
      localStorage.setItem("dark_mode", this.modeDark.toString());
      this.icon_mode_theme = "moon";
      this.themeService.changeTheme("default-custom-theme");
    }
    this.darkModeService.toggleDarkModeVisibility(this.modeDark);
  }
  help() {
    window.open(
      "https://eur05.safelinks.protection.outlook.com/?url=https%3A%2F%2Fconfluence.agile.corp.edp.pt%2Fpages%2Fviewpage.action%3FspaceKey%3DNSLG%26title%3DGuides&data=05%7C01%7C%7C3764b04aa95f493838cf08dbbeaa24a7%7Ca6bf56db18444fb089f3ad07c1f40c8b%7C0%7C0%7C638313410214594373%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C3000%7C%7C%7C&sdata=szL7%2Bo2v%2B7o6b6symfbdp7VC5Q1Of5ufyOJRzgSpAVc%3D&reserved=0",
      "_blank"
    );
  }
}
