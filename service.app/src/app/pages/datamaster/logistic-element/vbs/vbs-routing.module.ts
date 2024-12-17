import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VbsComponent } from './vbs.component';
import { AuthGuard } from '../../../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: VbsComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "underground-storages",
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VbsRoutingModule { }
