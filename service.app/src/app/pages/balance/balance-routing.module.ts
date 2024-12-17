import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BalanceComponent } from './balance.component';
import { AuthGuard } from '../../AuthGuard';

const routes: Routes = [
  {
    path: "",
    component: BalanceComponent,
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
export class BalanceRoutingModule { }
