import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BalancingRuleComponent } from './balancing-rule.component';
import { AuthGuard } from '../../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: BalancingRuleComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "balancing-rules",
  },
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BalancingRuleRoutingModule { }
