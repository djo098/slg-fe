import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VirtualExchangesComponent } from './virtual-exchanges.component';
import { AuthGuard } from '../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: VirtualExchangesComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "virtual-swaps-contracts",
  }
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VirtualExchangesRoutingModule { }
