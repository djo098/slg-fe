import { LOCALE_ID, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { FormsModule } from "@angular/forms";
import {
  NbButtonModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
} from "@nebular/theme";

import { NbRoleProvider, NbSecurityModule } from "@nebular/security";
import { ExcelService } from "../../@core/services/sharedServices/excel.service";
import { RoleProvider } from "../../role.provider";
import { DualListComponent } from "../dual-list/dual-list.component";

@NgModule({
  declarations: [DualListComponent],
  exports: [
    DualListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NbButtonModule,
    NbFormFieldModule,
    NbIconModule,
    NbInputModule
  ],
  providers: [
  ],
})
export class DualListsModule {}
