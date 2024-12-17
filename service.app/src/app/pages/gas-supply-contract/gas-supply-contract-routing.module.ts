import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GasSupplyContractComponent } from './gas-supply-contract.component';
import { AuthGuard } from '../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: GasSupplyContractComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "purchase-sale-contract",
  }
  //canDeactivate: [PendingChangesGuard]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GasSupplyContractRoutingModule { }
