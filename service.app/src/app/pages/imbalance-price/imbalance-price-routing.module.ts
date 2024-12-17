import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImbalancePriceComponent } from './imbalance-price.component';
import { AuthGuard } from '../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: ImbalancePriceComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "imbalance-prices",
  },
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImbalancePriceRoutingModule { }
