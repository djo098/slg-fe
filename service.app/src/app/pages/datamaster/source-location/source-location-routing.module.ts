import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SourceLocationComponent } from './source-location.component';
import { AuthGuard } from '../../../AuthGuard';

const routes: Routes = [{
  path: "",
  canActivate: [AuthGuard],
  component: SourceLocationComponent,
  data: {
    permission: "view",
    resource: "sources",
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SourceLocationRoutingModule { }
