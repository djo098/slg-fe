import { DatePipe } from "@angular/common";
import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { messageService } from "../../../@core/utils/messages";
import { NbDialogRef } from "@nebular/theme";
import { map } from "rxjs/operators";
import { ReportingService } from "../../../@core/services/reporting.service";
import NumberColumnType from "@revolist/revogrid-column-numeral";
import { DarkModeService } from "../../../@core/services/sharedServices/darkMode.service";
import { Subscription } from "rxjs";

@Component({
  selector: "ngx-dialog-export-services",
  templateUrl: "./dialog-export-services.component.html",
  styleUrls: ["./dialog-export-services.component.scss"],
})
export class DialogExportServicesComponent implements OnInit, OnDestroy {
  @Input() balanceZone: number;
  @Input() legalEntity: number;
  @Input() start_date: string;
  @Input() end_date: string;
  @Input() legalEntityName: string;
  @Input() connection_point: number;
  @Input() title: string;
  @Input() service: number;
  @Input() granularity: any;
  @Input() option: string;
  @Input() action: string;
  @Input() id: number;
  @Input() nomination_type: string;

  operationForm!: FormGroup;
  loading = false;
  numeral = NumberColumnType.getNumeralInstance();
  revogridTheme: string;
  current_hour_index: any[] = [];
  subscriptions: Subscription[] = [];
  dataView: any;
  services_differences: string;
  compareTSO = false;
  validateCapacity = true;
  validateRevogridView = true;
  private mutationObserver: MutationObserver;

  constructor(
    private formBuilder: FormBuilder,
    private messageService: messageService,
    public datepipe: DatePipe,
    protected ref: NbDialogRef<DialogExportServicesComponent>,
    private apiReports: ReportingService,
    private darkModeService: DarkModeService
  ) {}

  ngOnInit(): void {
    this.numeral.locale("es");
    this.setRevoGridTheme();

    this.operationForm = this.formBuilder.group({
      id: new FormControl("", [Validators.required]),
      balancing_zone: new FormControl("", [Validators.required]),
      country_code: new FormControl("", [Validators.required]),
      connection_type: new FormControl("", [Validators.required]),
      connection_point: new FormControl("", [Validators.required]),
      service: new FormControl([], [Validators.required]),
      legal_entity: new FormControl("", [Validators.required]),
      granularity: new FormControl("", [Validators.required]),
      nominationType: new FormControl("", [Validators.required]),
    });

    if (localStorage.getItem("service_array_no")) {
      this.service = JSON.parse(localStorage.getItem("service_array_no"));
    }

    this.loading = false;
    this.compareAllNominations(this.balanceZone, this.legalEntity, this.start_date, this.end_date);

    // Listen to the afterRender event to make adjustments after grid is fully rendered
    document
      .querySelector('revo-grid')
      ?.addEventListener('afterRender', this.adjustRevoGridAfterRender.bind(this));
  }

  ngOnDestroy(): void {
    // Disconnect the observer when the component is destroyed
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  ngAfterViewInit(): void {
    this.applyHeaderCellStyles();

    // Set up a MutationObserver to ensure styles are applied even when the grid updates
    this.mutationObserver = new MutationObserver(() => {
      this.applyHeaderCellStyles();
    });

    // Observe changes to the entire document body for dynamic updates
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial application of styles after the view is fully initialized
    setTimeout(() => this.applyHeaderCellStyles(), 500);
  }

  private applyHeaderCellStyles() {
    // Applying styles directly and ensuring they override other styles
    const headerCells = document.querySelectorAll<HTMLElement>(".rgHeaderCell");
    headerCells.forEach((element) => {
      element.style.setProperty("height", "50px", "important");
    });
  }

  private setRevoGridTheme() {
    this.revogridTheme = this.darkModeService.isDarkMode
      ? "darkMaterial"
      : "material";
    this.subscriptions.push(
      this.darkModeService.darkModeChange.subscribe((isDarkMode) => {
        this.revogridTheme = isDarkMode ? "darkMaterial" : "material";
      })
    );
  }

  compareAllNominations(balancing_zone: number, legal_entity: number, start_date: string, end_date: string) {
    this.loading = true;
    const subscription = this.apiReports
      .getComparisonAllNominatedServices(balancing_zone, legal_entity, start_date, end_date)
      .pipe(
        map((data) => {
          this.handleApiResponse(data);
          return this.formatDataForRevoGrid(data["data"]);
        })
      )
      .subscribe({
        next: (res) => (this.dataView = res),
        error: (e) => this.handleError(e),
      });

    this.subscriptions.push(subscription);
  }

  private handleApiResponse(data) {
    this.current_hour_index = [];
    localStorage.setItem(
      "rgRow_no_new",
      localStorage.getItem("rgRow_no") || ""
    );
    localStorage.setItem(
      "rgCol_no_new",
      localStorage.getItem("rgCol_no") || ""
    );

    this.services_differences = null;
    if (data["msg"] === "") {
      this.compareTSO = false;
    } else if (/incorrectly/i.test(data["msg"])) {
      this.messageService.showToast("danger", "Error", data["msg"]);
    } else if (/correctly/i.test(data["msg"])) {
      this.messageService.showToast("success", "Success", data["msg"]);
    } else {
      this.compareTSO = false;
      this.messageService.showToast("danger", "Error", data["msg"]);
    }
  }

  private formatDataForRevoGrid(data) {
    return data.map((x, index) => {
      this.legalEntityName = x["name"];
      this.formatRows(x["rows"]);
      this.formatColumns(x["columns"]);
      this.loading = false;
      return x;
    });
  }

  private formatRows(rows) {
    rows?.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key !== "DATE") {
          row[key] = this.numeral(Number(row[key].toFixed(4))).format(
            "0,0.[0000]"
          );
        }
      });
    });
  }

  private formatColumns(columns) {
    columns?.forEach((col) => {
      col.sortable = true;
      this.setColumnProperties(col);
      col.children?.forEach((child) => this.setColumnProperties(child));
    });
  }

  private setColumnProperties(col) {
    col.size = col.name === "Date" && this.granularity === "hourly" ? 180 : 160;
    col.columnType = col.filter === "string" ? "string" : "numeric";
    col.pin = col.name === "Date" ? "colPinStart" : undefined;
    col.cellTemplate = this.createCellTemplate.bind(this);
    col.cellProperties = ({ prop, model, data, column }) => ({
      class: { numeric: true },
    });
  }

  private createCellTemplate(createElement, props) {
    const isHighlighted = this.current_hour_index.includes(
      props.data.indexOf(props.model)
    );
    if (isHighlighted) {
      return createElement(
        "div",
        {
          style: { background: "#263CC8", color: "white" },
          class: { bubble: true },
        },
        props.model[props.prop]
      );
    }
  }

  private handleError(e) {
    this.dataView = null;
    const errorMessage =
      e.error?.title === "Internal Server Error"
        ? "Internal server error while getting nomination"
        : e.error;
    this.messageService.showToast("danger", "Error", errorMessage);
  }

  private adjustRevoGridAfterRender() {
    document.querySelectorAll<HTMLElement>("nb-card.main-container .rgHeaderCell")
      .forEach((element) => {
        element.style.height = "50px";
        element.style.overflow = "hidden";
      });

    const x = Number(localStorage.getItem("rgCol_no_new"));
    const y = Number(localStorage.getItem("rgRow_no_new"));
    if (!isNaN(x) && !isNaN(y)) {
      document
        .querySelectorAll("revo-grid")
        .forEach((element) => element.scrollToCoordinate({ x, y }));
    }
  }

  onBeforeEditStart(e, { detail }) {
    if (!detail.val) {
      detail.val = detail.model[detail.prop].toString().replace(/\./g, "");
    }
  }

  cancel() {
    this.ref.close();
  }

  refresh() {
    const legalEntity = Number(localStorage.getItem("entity_no"));
    const balanceZone = Number(localStorage.getItem("balance_zone_no"));
    const startDate = localStorage.getItem("start_date_no");
    const endDate = localStorage.getItem("end_date_no");

    if (!isNaN(balanceZone) && !isNaN(legalEntity)) {
      this.compareAllNominations(balanceZone, legalEntity, startDate, endDate);
    } else {
      this.messageService.showToast(
        "danger",
        "Error",
        "Invalid data in local storage."
      );
    }
  }
}