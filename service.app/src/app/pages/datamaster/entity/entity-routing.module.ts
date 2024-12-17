import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntityComponent } from './entity.component';
import { AuthGuard } from '../../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: EntityComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "legal-entities",
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntityRoutingModule { }
