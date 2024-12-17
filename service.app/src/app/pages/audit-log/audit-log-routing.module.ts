import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuditLogComponent } from './audit-log.component';
import { AuthGuard } from '../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: AuditLogComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "audit-logs",
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuditLogRoutingModule { }
