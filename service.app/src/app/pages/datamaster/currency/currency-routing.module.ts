import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CurrencyComponent } from "./currency.component";
import { AuthGuard } from "../../../AuthGuard";

const routes: Routes = [
  {
    path: "",
    component: CurrencyComponent,
    canActivate: [AuthGuard],
    data: {
      permission: "view",
      resource: "currencies",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CurrencyRoutingModule {}
