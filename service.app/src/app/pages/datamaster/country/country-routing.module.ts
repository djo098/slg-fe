import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CountryComponent } from './country.component';
import { AuthGuard } from '../../../AuthGuard';

const routes: Routes = [{
  path: "",
  component: CountryComponent,
  canActivate: [AuthGuard],
  data: {
    permission: "view",
    resource: "countries",
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CountryRoutingModule { }
