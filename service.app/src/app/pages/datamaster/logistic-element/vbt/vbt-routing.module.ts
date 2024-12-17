import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VbtComponent } from './vbt.component';
import { AuthGuard } from '../../../../AuthGuard';

const routes: Routes = [    {
  path: "",
  component: VbtComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "LNG-tanks",
  },
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VbtRoutingModule { }
