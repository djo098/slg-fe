import { Component, EventEmitter, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { NbDialogRef } from "@nebular/theme";
import { messageService } from "../../../../@core/utils/messages";

@Component({
  selector: "ngx-dialog-service",
  templateUrl: "./dialog-service.component.html",
  styleUrls: ["./dialog-service.component.scss"],
})
export class DialogServiceComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() code: string;
  @Input() description: string;
  serviceForm!: FormGroup;
  columns: any;
  rows: any;
  errorConnectionPoint = false;
  connectionPointOptions = false;
  ngOnInit(): void {
    this.serviceForm = this.formBuilder.group({
      label: new FormControl("", [Validators.required]),
      connection_point_id: new FormControl("", [Validators.required]),
    });


    if (this.action == "Update") {
      this.serviceForm.controls["code"].setValue(this.code);
      this.serviceForm.controls["code"].disable();
      this.serviceForm.controls["name"].setValue(this.description);
    }
  }

  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogServiceComponent>
  ) {}

  cancel() {
    this.ref.close();
  }
  add() {
    if (this.serviceForm.valid) {
      if (this.action == "Add") {
      } else if (this.action == "Update") {
        this.update();
      }
    }
  }

  update() {
    if (this.serviceForm.valid) {
    }
  }
 getConnectionPoints(){

 }
 
}
