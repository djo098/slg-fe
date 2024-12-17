import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-dialog-confirmation-delete',
  templateUrl: './dialog-confirmation-delete.component.html',
  styleUrls: ['./dialog-confirmation-delete.component.scss']
})
export class DialogConfirmationComponent implements OnInit {

  @Input() body: string;
  @Input() row_nominations: any;
  @Input() columns: any;
  @Input() body_dependencies: string;
  @Input() dependencies: any;
  @Input() body_nominations: string;
  @Input() button: string;
  @Input() title: string;
  @Input() status_cancel: string;
  @Input() status_confirm: string;
  @Input() idleState: string;
  constructor(protected ref: NbDialogRef<DialogConfirmationComponent>) { }
  
  ngOnInit(): void {
  }
  cancel(){
    this.ref.close();
  }
  delete(){
    this.ref.close('yes');
  }

}
