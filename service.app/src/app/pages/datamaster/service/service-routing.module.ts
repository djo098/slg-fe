import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceComponent } from './service.component';
import { AuthGuard } from '../../../AuthGuard';

const routes: Routes = [   {
  path: "",
  component: ServiceComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "services",
  },
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServiceRoutingModule { }
