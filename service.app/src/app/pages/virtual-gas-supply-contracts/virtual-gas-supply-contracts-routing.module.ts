import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VirtualGasSupplyContractsComponent } from './virtual-gas-supply-contracts.component';
import { AuthGuard } from '../../AuthGuard';

const routes: Routes = [ {
  path: "",
  component: VirtualGasSupplyContractsComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "virtual-purchase-sale-contracts",
  },
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VirtualGasSupplyContractsRoutingModule { }
