import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestSingleClientComponent } from './request-single-client.component';
import { AuthGuard } from '../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: RequestSingleClientComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "request-single-clients",
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestSingleClientRoutingModule { }
