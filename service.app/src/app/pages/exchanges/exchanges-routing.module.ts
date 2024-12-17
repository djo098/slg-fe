import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExchangesComponent } from './exchanges.component';
import { AuthGuard } from '../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: ExchangesComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "swap-contracts",
  }
  //canDeactivate: [PendingChangesGuard]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExchangesRoutingModule { }
