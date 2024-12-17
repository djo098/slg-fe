import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContractComponent } from './contract.component';
import { AuthGuard } from '../../AuthGuard';
import { MsalGuard } from '@azure/msal-angular';

const routes: Routes = [
  {
    path: "",
    component: ContractComponent,
    canActivate: [AuthGuard],
    data: {
      permission: 'view',
      resource: 'logistic-contracts'
    },
 

  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContractRoutingModule {
 
 }
