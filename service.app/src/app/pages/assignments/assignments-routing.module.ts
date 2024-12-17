import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignmentsComponent } from './assignments.component';
import { AuthGuard } from '../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: AssignmentsComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "assignments",
  }
  //canDeactivate: [PendingChangesGuard]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssignmentsRoutingModule { }
