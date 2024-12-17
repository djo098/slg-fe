import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VesselComponent } from './vessel.component';
import { AuthGuard } from '../../../AuthGuard';

const routes: Routes = [  {
  path: "",
  component: VesselComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "vessels",
  },
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VesselRoutingModule { }
