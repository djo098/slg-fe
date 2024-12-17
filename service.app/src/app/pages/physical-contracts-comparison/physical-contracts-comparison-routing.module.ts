import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhysicalContractsComparisonComponent } from './physical-contracts-comparison.component';
import { AuthGuard } from '../../AuthGuard';

const routes: Routes = [
  {
    path: "",
    component: PhysicalContractsComparisonComponent,
    canActivate: [AuthGuard],
    data: {
      permission: "view",
      resource: "balance",
    },

  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PhysicalContractsComparisonRoutingModule { }
