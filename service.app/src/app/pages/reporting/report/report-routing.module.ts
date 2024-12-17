import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportComponent } from './report.component';
import { AuthGuard } from '../../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: ReportComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "report",
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
