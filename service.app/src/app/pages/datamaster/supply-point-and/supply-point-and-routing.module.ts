import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SupplyPointAndComponent } from './supply-point-and.component';
import { AuthGuard } from '../../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: SupplyPointAndComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "supply-points-and-supply-areas",
  },

}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupplyPointAndRoutingModule { }
