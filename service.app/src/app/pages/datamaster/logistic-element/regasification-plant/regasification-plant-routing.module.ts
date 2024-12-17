import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegasificationPlantComponent } from './regasification-plant.component';
import { AuthGuard } from '../../../../AuthGuard';

const routes: Routes = [ {
  path: "",
  component: RegasificationPlantComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "regasification-plants",
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegasificationPlantRoutingModule { }
