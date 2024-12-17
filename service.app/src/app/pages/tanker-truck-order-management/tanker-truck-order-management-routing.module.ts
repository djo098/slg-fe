import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TankerTruckOrderManagementComponent } from './tanker-truck-order-management.component';
import { AuthGuard } from '../../AuthGuard';

const routes: Routes = [ {
  path: "",
  component: TankerTruckOrderManagementComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "orders-management",
  },
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TankerTruckOrderManagementRoutingModule { }
