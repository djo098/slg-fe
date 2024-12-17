import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChartReportingComponent } from './chart-reporting.component';
import { AuthGuard } from '../../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: ChartReportingComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "charts-reporting",
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChartReportingRoutingModule { }
