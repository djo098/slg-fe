import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { WorkflowsComponent } from "./workflows.component";
import { AuthGuard } from "../../AuthGuard";

const routes: Routes = [
  {
    path: "",
    component: WorkflowsComponent,
    canActivate: [AuthGuard],
    data: {
      permission: "view",
      resource: "workflows",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkflowsRoutingModule {}
