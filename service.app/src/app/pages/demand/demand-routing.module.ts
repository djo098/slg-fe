import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemandComponent } from './demand.component';
import { AuthGuard } from '../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: DemandComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "demand-curves",
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DemandRoutingModule { }
