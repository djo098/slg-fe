import { DatePipe } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { NbDialogRef, NbDialogService } from "@nebular/theme";
import { DialogWorkflowLogStructuredComponent } from "../dialog-workflow-log-structured/dialog-workflow-log-structured.component";

import { messageService } from "../../../@core/utils/messages";
import { WorkflowService } from "../../../@core/services/workflow.service";

interface DialogContext {
  title: string;
  action: string;
  id: any;
  request_data?: string;
  timestamp?: string;
  user_id?: string;
  status?: string;
  source?: string;
  response_data?: string;
  resource?: string;
  method?: string;
  endpoint?: string;
  destination?: string;
}

@Component({
  selector: "ngx-dialog-workflow-log",
  templateUrl: "./dialog-workflow-log.component.html",
  styleUrls: ["./dialog-workflow-log.component.scss"],
})
export class DialogWorkflowLogComponent implements OnInit {
  @Input() title: string;
  @Input() action: string;
  @Input() id: number;
  @Input() request_data: any;
  @Input() timestamp: string;
  @Input() user_id: string;
  @Input() status: string;
  @Input() source: string;
  @Input() response_data: string;
  @Input() resource: string;
  @Input() method: string;
  @Input() endpoint: string;
  @Input() destination: string;
  loading: boolean = false;

  detailForm!: FormGroup;
  
  constructor(
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<DialogWorkflowLogComponent>,
    public datepipe: DatePipe,
    private apiWorkflow: WorkflowService, 
    private dialogService: NbDialogService,
    private messageService: messageService,

  ) {}

  ngOnInit(): void {
    

    /*
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
      */
    
      this.detailForm = this.formBuilder.group({
        request_data: [this.request_data, Validators.required],
        timestamp: [this.timestamp, Validators.required],
        user_id: [this.user_id, Validators.required],
        status: [this.status, Validators.required],
        source: [this.source, Validators.required],
        response_data: [this.response_data, Validators.required],
        resource: [this.resource, Validators.required],
        method: [this.method, Validators.required],
        endpoint: [this.endpoint, Validators.required],
        destination: [this.destination, Validators.required],
      
    
      
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
    this.apiWorkflow.getWorkflowLog(id)
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
  getStructuredRequestData(id: any) {
    const context: DialogContext = {
      title: "Step Result - Details",
      action: "View",
      id: id,
      request_data: this.request_data,
      timestamp: this.timestamp,
      user_id: this.user_id,
      status: this.status,
      source: this.source,
      response_data: this.response_data,
      resource: this.resource,
      method: this.method,
      endpoint: this.endpoint,
      destination: this.destination
    };
  
    this.dialogService.open(DialogWorkflowLogStructuredComponent, {
      closeOnEsc: true,
      closeOnBackdropClick: false,
      context: context,
      autoFocus: false,
    });
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
