import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { NbDialogRef } from "@nebular/theme";
import { SupplyPointsAreaService } from "../../../../@core/services/supplyPointsArea.service";
import { messageService } from "../../../../@core/utils/messages";

@Component({
  selector: "ngx-dialog-supply-area",
  templateUrl: "./dialog-supply-point.component.html",
  styleUrls: ["./dialog-supply-point.component.scss"],
})
export class DialogPointComponent implements OnInit {
  @Input() action: string;
  @Input() title: string;
  @Input() id: number;
  @Input() label: string;
  @Input() area_id: number;
  PointForm!: FormGroup;
  areaOptions: any;

  ngOnInit(): void {
    this.PointForm = this.formBuilder.group({
      id: new FormControl("", []),
      label: new FormControl("", [
        Validators.required,
     
      ]),
      area_id: new FormControl("", [Validators.required]),
    });
    if (this.action == "Update") {
    
      this.PointForm.controls["id"].setValue(this.id);
      this.PointForm.controls["id"].disable();

      this.PointForm.controls["label"].setValue(this.label);
      this.PointForm.controls["area_id"].setValue(this.area_id);
    }
    this.PointForm.controls["id"].disable();
  }

  constructor(
    private messageService: messageService,
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogPointComponent>,
    private apiSupplyAreasAndPoints: SupplyPointsAreaService
  ) {
    this.getPoints();
  }

  cancel() {
    this.ref.close();
  }
  add() {
    if (this.PointForm.valid) {
      if (this.action == "Add") {
        this.apiSupplyAreasAndPoints.addSupplyPoint
        (this.PointForm.value)
          .subscribe({
            next: (res) => {
              this.messageService.showToast(
                "success",
                "Success",
                "Supply point added successfully!"
              );

              this.PointForm.reset();
              this.ref.close("save");
            },
            error: (e) => {
              if (e.error.title == "Internal Server Error") {
                this.messageService.showToast(
                  "danger",
                  "Error",
                  "Internal server error while adding supply point"
                );
              } else {
                this.messageService.showToast("danger", "Error", e.error);
              }
            },
          });
      } else if (this.action == "Update") {
        this.update();
      }
    }
  }

  update() {
    if (this.PointForm.valid) {
      this.apiSupplyAreasAndPoints.updateSupplyPoint(this.PointForm.getRawValue())
        .subscribe({
          next: (res) => {
            this.messageService.showToast(
              "success",
              "Success",
              "Supply Point updated successfully!"
            );
            this.PointForm.reset();
            this.ref.close("update");
          },
          error: (e) => {
            if (e.error.title == "Internal Server Error") {
              this.messageService.showToast(
                "danger",
                "Error",
                "Internal server error while updating supply point"
              );
            } else {
              this.messageService.showToast("danger", "Error", e.error);
            }
          },
        });
    }
  }
  getPoints() {
    this.apiSupplyAreasAndPoints.getSupplyAreas().subscribe({
      next: (res) => {
        this.areaOptions = res;
      },
      error: (e) => {
        if (e.error.title == "Internal Server Error") {
          this.messageService.showToast(
            "danger",
            "Error",
            "Internal server error while getting supply points"
          );
        } else {
          this.messageService.showToast("danger", "Error", e.error);
        }
      },
    });
  }

}
