import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VbpComponent } from './vbp.component';
import { AuthGuard } from '../../../../AuthGuard';

const routes: Routes = [ {
  path: "",
  component: VbpComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "balancing-points",
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VbpRoutingModule { }
