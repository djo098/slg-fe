import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogisticsCostsComponent } from './logistics-costs.component';
import { AuthGuard } from '../../AuthGuard';


const routes: Routes = [{
  path: "",
  component: LogisticsCostsComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "logistics-costs",
  }
  //canDeactivate: [PendingChangesGuard]
}];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogisticsCostsRoutingModule { }
