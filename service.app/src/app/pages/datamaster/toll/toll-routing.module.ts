import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TollComponent } from './toll.component';
import { AuthGuard } from '../../../AuthGuard';

const routes: Routes = [ {
  path: "",
  component: TollComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "tolls-types",
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TollRoutingModule { }
