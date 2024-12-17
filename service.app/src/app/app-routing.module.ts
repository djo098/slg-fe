import { ExtraOptions, RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import {
  NbAuthComponent,
  NbLoginComponent,
  NbLogoutComponent,
  NbRegisterComponent,
  NbRequestPasswordComponent,
  NbResetPasswordComponent,
} from "@nebular/auth";

import { MiscellaneousComponent } from "./pages/miscellaneous/miscellaneous.component";
import { BrowserUtils } from "@azure/msal-browser";
import { MsalGuard } from "@azure/msal-angular";
import { AuthGuard } from "./AuthGuard";

export const routes: Routes = [
  {
    path: "balance",
    loadChildren: () =>
      import("./pages/balance/balance.module").then((m) => m.BalanceModule),
    canActivate: [MsalGuard],
  },
  {
    path: "layout",
    loadChildren: () =>
      import("./pages/layout-management/layout-management.module").then(
        (m) => m.LayoutManagementModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "simulations",
    loadChildren: () =>
      import("./pages/simulation/simulation.module").then(
        (m) => m.SimulationModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "virtual-balance",
    loadChildren: () =>
      import("./pages/virtual-balance/virtual-balance.module").then(
        (m) => m.VirtualBalanceModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "virtual-logistic-contracts",
    loadChildren: () =>
      import(
        "./pages/virtual-logistic-contracts/virtual-logistic-contracts.module"
      ).then((m) => m.VirtualLogisticContractsModule),
    canActivate: [MsalGuard],
  },
  {
    path: "virtual-swaps-contracts",
    loadChildren: () =>
      import("./pages/virtual-exchanges/virtual-exchanges.module").then(
        (m) => m.VirtualExchangesModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "virtual-purchase-sale-contracts",
    loadChildren: () =>
      import(
        "./pages/virtual-gas-supply-contracts/virtual-gas-supply-contracts.module"
      ).then((m) => m.VirtualGasSupplyContractsModule),
    canActivate: [MsalGuard],
  },
  {
    path: "logistic-contracts",
    loadChildren: () =>
      import("./pages/contract/contract.module").then((m) => m.ContractModule),
    canActivate: [MsalGuard],
  },
  {
    path: "nomination",
    loadChildren: () =>
      import("./pages/nomination/nomination.module").then(
        (m) => m.NominationModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "assignments",
    loadChildren: () =>
      import("./pages/assignments/assignments.module").then(
        (m) => m.AssignmentsModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "swap-contracts",
    loadChildren: () =>
      import("./pages/exchanges/exchanges.module").then(
        (m) => m.ExchangesModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "purchase-sale-contract",
    loadChildren: () =>
      import("./pages/gas-supply-contract/gas-supply-contract.module").then(
        (m) => m.GasSupplyContractModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "physical-contracts-comparison",
    loadChildren: () =>
      import("./pages/physical-contracts-comparison/physical-contracts-comparison.module").then(
        (m) => m.PhysicalContractsComparisonModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "demand-curves",
    loadChildren: () =>
      import("./pages/demand/demand.module").then((m) => m.DemandModule),
    canActivate: [MsalGuard],
  },
  {
    path: "consumption",
    loadChildren: () =>
      import("./pages/consumption-demand/consumption-demand.module").then(
        (m) => m.ConsumptionDemandModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "request-single-clients",
    loadChildren: () =>
      import("./pages/request-single-client/request-single-client.module").then(
        (m) => m.RequestSingleClientModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "orders-management",
    loadChildren: () =>
      import(
        "./pages/tanker-truck-order-management/tanker-truck-order-management.module"
      ).then((m) => m.TankerTruckOrderManagementModule),
    canActivate: [MsalGuard],
  },
  {
    path: "master-data/balancing-zones",
    loadChildren: () =>
      import("./pages/datamaster/balancing-zone/balancing-zone.module").then(
        (m) => m.BalancingZoneModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "master-data/balancing-rules",
    loadChildren: () =>
      import("./pages/datamaster/balancing-rule/balancing-rule.module").then(
        (m) => m.BalancingRuleModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "master-data/countries",
    loadChildren: () =>
      import("./pages/datamaster/country/country.module").then(
        (m) => m.CountryModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "master-data/legal-entities",
    loadChildren: () =>
      import("./pages/datamaster/entity/entity.module").then(
        (m) => m.EntityModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "master-data/supply-points-and-supply-areas",
    loadChildren: () =>
      import(
        "./pages/datamaster/supply-point-and/supply-point-and.module"
      ).then((m) => m.SupplyPointAndModule),
    canActivate: [MsalGuard],
  },
  {
    path: "master-data/logistic-elements/connection-points",
    loadChildren: () =>
      import(
        "./pages/datamaster/connection-point/connection-point.module"
      ).then((m) => m.ConnectionPointModule),
    canActivate: [MsalGuard],
  },
  {
    path: "master-data/services",
    loadChildren: () =>
      import("./pages/datamaster/service/service.module").then(
        (m) => m.ServiceModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "master-data/tolls-types",
    loadChildren: () =>
      import("./pages/datamaster/toll/toll.module").then((m) => m.TollModule),
    canActivate: [MsalGuard],
  },
  {
    path: "master-data/currencies",
    loadChildren: () =>
      import("./pages/datamaster/currency/currency.module").then(
        (m) => m.CurrencyModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "master-data/vessels",
    loadChildren: () =>
      import("./pages/datamaster/vessel/vessel.module").then(
        (m) => m.VesselModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "master-data/sources",
    loadChildren: () =>
      import("./pages/datamaster/source-location/source-location.module").then(
        (m) => m.SourceLocationModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "master-data/logistic-elements/balancing-points",
    loadChildren: () =>
      import("./pages/datamaster/logistic-element/vbp/vbp.module").then(
        (m) => m.VbpModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "master-data/logistic-elements/LNG-tanks",
    loadChildren: () =>
      import("./pages/datamaster/logistic-element/vbt/vbt.module").then(
        (m) => m.VbtModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "master-data/logistic-elements/underground-storages",
    loadChildren: () =>
      import("./pages/datamaster/logistic-element/vbs/vbs.module").then(
        (m) => m.VbsModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "master-data/logistic-elements/regasification-plants",
    loadChildren: () =>
      import(
        "./pages/datamaster/logistic-element/regasification-plant/regasification-plant.module"
      ).then((m) => m.RegasificationPlantModule),
    canActivate: [MsalGuard],
  },
  {
    path: "master-data/logistic-elements/satellite-plants",
    loadChildren: () =>
      import(
        "./pages/datamaster/logistic-element/satellite-plant/satellite-plant.module"
      ).then((m) => m.SatellitePlantModule),
    canActivate: [MsalGuard],
  },
  {
    path: "master-data/logistic-elements/overseas-trading-point",
    loadChildren: () =>
      import("./pages/datamaster/logistic-element/otp/otp.module").then(
        (m) => m.OtpModule
      ),
    canActivate: [MsalGuard],
  }, {
    path: "report",
    loadChildren: () =>
      import("./pages/reporting/report/report.module").then(
        (m) => m.ReportModule
      ),
    canActivate: [MsalGuard],
  },{
    path: "charts-reporting",
    loadChildren: () =>
      import("./pages/reporting/chart-reporting/chart-reporting.module").then(
        (m) => m.ChartReportingModule
      ),
    canActivate: [MsalGuard],
  },{
    path: "imbalance-prices",
    loadChildren: () =>
      import("./pages/imbalance-price/imbalance-price.module").then(
        (m) => m.ImbalancePriceModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "logistics-costs",
    loadChildren: () =>
      import("./pages/logistics-costs/logistics-costs.module").then(
        (m) => m.LogisticsCostsModule
      ),
    canActivate: [MsalGuard],
  }, {
    path: "optimization",
    loadChildren: () =>
      import("./pages/optimization/optimization.module").then(
        (m) => m.OptimizationModule
      ),
    canActivate: [MsalGuard],
  },{
    path: "audit-logs",
    loadChildren: () =>
      import("./pages/audit-log/audit-log.module").then(
        (m) => m.AuditLogModule
      ),
    canActivate: [MsalGuard],
  },
  {
    path: "workflow-logs",
    loadChildren: () =>
      import("./pages/workflow-log/workflow-log.module").then(
        (m) => m.WorkflowLogModule
      ),
    canActivate: [MsalGuard],
  },

  {
    path: "workflows",
    loadChildren: () =>
      import("./pages/workflows/workflows.module").then(
        (m) => m.WorkflowsModule
      ),
    canActivate: [MsalGuard],
  },
  { path: "", redirectTo: "balance", pathMatch: "full" },
  {
    path: "**",
    redirectTo: "balance"
   /*  loadChildren: () =>
      import("./pages/miscellaneous/miscellaneous.module").then(
        (m) => m.MiscellaneousModule
      ), */
  },
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
    // Don't perform initial navigation in iframes or popups
    useHash: false,
    initialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup()
        ? "enabledNonBlocking"
        : "disabled", // Remove this line to use Angular Universal
}),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
