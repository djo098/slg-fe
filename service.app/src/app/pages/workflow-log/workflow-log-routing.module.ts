import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkflowLogComponent } from './workflow-log.component';
import { AuthGuard } from '../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: WorkflowLogComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "workflow-logs",
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowLogRoutingModule { }
