import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutManagementComponent } from './layout-management.component';
import { AuthGuard } from '../../AuthGuard';
const routes: Routes = [
  {
    path: "",
    component: LayoutManagementComponent,
    canActivate: [AuthGuard],
    data: {
      permission: "view",
      resource: "layout",
    },

  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutManagementRoutingModule { }
