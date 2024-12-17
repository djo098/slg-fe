import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsumptionDemandComponent } from './consumption-demand.component';
import { AuthGuard } from '../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: ConsumptionDemandComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "consumption",
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsumptionDemandRoutingModule { }
