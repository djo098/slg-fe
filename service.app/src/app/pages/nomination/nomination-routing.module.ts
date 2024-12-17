import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NominationComponent } from './nomination.component';
import { AuthGuard } from '../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: NominationComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "nomination",
  }
  //canDeactivate: [PendingChangesGuard]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NominationRoutingModule { }
