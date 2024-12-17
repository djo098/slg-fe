import { DatePipe } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { NbDialogRef, NbDialogService } from "@nebular/theme";
import { AuditService } from "../../../@core/services/audit.service";
import { DialogAuditLogStructuredComponent } from "../dialog-audit-log-structured/dialog-audit-log-structured.component";

import { messageService } from "../../../@core/utils/messages";
@Component({
  selector: "ngx-dialog-audit-log",
  templateUrl: "./dialog-audit-log.component.html",
  styleUrls: ["./dialog-audit-log.component.scss"],
})
export class DialogAuditLogComponent implements OnInit {
  @Input() request_data: string;
  @Input() title: string;
  @Input() timestamp: string;
  @Input() user_id: string;
  @Input() status: string;
  @Input() source: string;
  @Input() response_data: string;
  @Input() resource: string;
  @Input() method: string;
  @Input() endpoint: string;
  @Input() destination: string;
  @Input() id: number;
  loading: boolean = false;

  detailForm!: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogAuditLogComponent>,
    public datepipe: DatePipe,
    private apiAuditService: AuditService,
    private dialogService: NbDialogService,
    private messageService: messageService
  ) {}

  ngOnInit(): void {
    this.detailForm = this.formBuilder.group({
      request_data: new FormControl("", Validators.required),
      timestamp: new FormControl("", Validators.required),
      user_id: new FormControl("", Validators.required),
      status: new FormControl("", Validators.required),
      source: new FormControl("", Validators.required),
      response_data: new FormControl("", Validators.required),
      resource: new FormControl("", Validators.required),
      method: new FormControl("", Validators.required),
      endpoint: new FormControl("", Validators.required),
      destination: new FormControl("", Validators.required),
    });
    /*   this.detailForm
      .get("request_data")
      .setValue(JSON.stringify(JSON.parse(this.request_data), null, "\t")); */
    this.detailForm
      .get("timestamp")
      .setValue(
        this.datepipe.transform(
          new Date(
            Number(this.timestamp.split("-")[0]),
            Number(this.timestamp.split("-")[1]) - 1,
            Number(this.timestamp.split("-")[2].split("T")[0]),
            Number(this.timestamp.split("-")[2].split("T")[1].split(":")[0]),
            Number(this.timestamp.split("-")[2].split("T")[1].split(":")[1]),
            Number(
              this.timestamp
                .split("-")[2]
                .split("T")[1]
                .split(":")[2]
                .replace("Z", "")
            )
          ),
          "yyyy-MM-dd HH:mm"
        )
      );
    this.detailForm
      .get("user_id")
      .setValue(this.user_id == null ? "none" : this.user_id);
    this.detailForm.get("status").setValue(this.status);
    this.detailForm.get("source").setValue(this.source);
    this.detailForm.get("resource").setValue(this.resource);
    this.detailForm.get("method").setValue(this.method);
    this.detailForm.get("endpoint").setValue(this.endpoint);
    this.detailForm.get("destination").setValue(this.destination);
    this.getLog(this.id);
    this.detailForm.disable();
  }
  cancel() {
    this.ref.close();
  }
  getLog(id) {
    this.apiAuditService
      .getLog(id)
      .subscribe({
        next: (res) => {
   
          this.request_data = res.request_data.toString();
          this.response_data = res.response_data.toString();

        },
        error: (e) => {
          if (e.error.title == "Internal Server Error") {
            this.messageService.showToast(
              "danger",
              "Error",
              "Internal server error while getting logs"
            );
          } else {
            this.messageService.showToast("danger", "Error", e.error);
          }
        },
      })
      .add(() => {
        this.loading = false;
        this.detailForm
          .get("request_data")
          .setValue(this.GetInputType(this.request_data));  

         this.detailForm
          .get("response_data")
          .setValue(
            this.GetInputType(this.response_data)
          ); 
      });
  }
  getStructuredRequestData(id) {
    this.dialogService
      .open(DialogAuditLogStructuredComponent, {
        closeOnEsc: true,
        closeOnBackdropClick: false,
        context: {
          title: "Structured log",
          action: "View",
          id: id,
        },
        autoFocus: false,
      })
  }
 GetInputType(response) {

    try {
      //try to parse via json 
      var a = JSON.stringify(JSON.parse(response), null, "\t")

      return a;
    } catch(e) {
     //try xml parsing 
     let parser = new DOMParser;
     var xmlDoc = parser.parseFromString(response,"application/xml");
  
        if(this.isParseError(xmlDoc))
           return response.toString();
        else 
           return new XMLSerializer().serializeToString(xmlDoc);
   }     
}
isParseError(parsedDocument) {
  // parser and parsererrorNS could be cached on startup for efficiency
  var parser = new DOMParser(),
      errorneousParse = parser.parseFromString('<', 'application/xml'),
      parsererrorNS = errorneousParse.getElementsByTagName("parsererror")[0].namespaceURI;

  if (parsererrorNS === 'http://www.w3.org/1999/xhtml') {
      // In PhantomJS the parseerror element doesn't seem to have a special namespace, so we are just guessing here :(
      return parsedDocument.getElementsByTagName("parsererror").length > 0;
  }

  return parsedDocument.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0;
};
}
