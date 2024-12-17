import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BalancingZoneComponent } from './balancing-zone.component';
import { AuthGuard } from '../../../AuthGuard';

const routes: Routes = [ {
  path: "",
  component: BalancingZoneComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "balancing-zones",
  },
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BalancingZoneRoutingModule { }
