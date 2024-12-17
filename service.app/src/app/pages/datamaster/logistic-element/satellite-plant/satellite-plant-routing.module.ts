import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SatellitePlantComponent } from './satellite-plant.component';
import { AuthGuard } from '../../../../AuthGuard';

const routes: Routes = [  {
  path: "",
  component: SatellitePlantComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "satellite-plants",
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SatellitePlantRoutingModule { }
