import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VirtualBalanceComponent } from './virtual-balance.component';
import { AuthGuard } from '../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: VirtualBalanceComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "virtual-balance",
  }
  //canDeactivate: [PendingChangesGuard]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VirtualBalanceRoutingModule { }
