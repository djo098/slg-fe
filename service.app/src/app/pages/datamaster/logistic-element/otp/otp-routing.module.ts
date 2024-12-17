import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OtpComponent } from './otp.component';
import { AuthGuard } from '../../../../AuthGuard';

const routes: Routes = [ {
  path: "",
  component: OtpComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "overseas-trading-point",
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OtpRoutingModule { }
