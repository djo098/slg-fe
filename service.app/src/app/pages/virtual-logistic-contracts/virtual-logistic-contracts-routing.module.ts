import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { VirtualLogisticContractsComponent } from "./virtual-logistic-contracts.component";
import { AuthGuard } from "../../AuthGuard";

const routes: Routes = [
  {
    path: "",
    component: VirtualLogisticContractsComponent,
    canActivate: [AuthGuard],
    data: {
      permission: "view",
      resource: "virtual-logistic-contracts",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VirtualLogisticContractsRoutingModule {}
