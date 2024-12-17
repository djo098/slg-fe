import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectionPointComponent } from './connection-point.component';
import { AuthGuard } from '../../../AuthGuard';

const routes: Routes = [  {
  path: "",
  component: ConnectionPointComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "connection-points",
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConnectionPointRoutingModule { }
