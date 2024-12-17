import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SimulationComponent } from './simulation.component';
import { AuthGuard } from '../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: SimulationComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "simulations",
  },
  //canDeactivate: [PendingChangesGuard]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SimulationRoutingModule { }
