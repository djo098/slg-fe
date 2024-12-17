import { NbComponentStatus, NbGlobalPhysicalPosition, NbGlobalPosition, NbToastrConfig, NbToastrService } from "@nebular/theme";
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class messageService{

    constructor(private toastrService: NbToastrService) {}

    config: NbToastrConfig;

    index = 1;
    destroyByClick = false;
    duration = 7000;
    icon='';
    position: NbGlobalPosition = NbGlobalPhysicalPosition.BOTTOM_RIGHT;
    preventDuplicates = true;

    showToast(type: NbComponentStatus, title: string, body: string) {
      this.icon = type == 'danger' ? 'close-outline' : type =='info' || type=='primary' ? 'email-outline' : 'checkmark-outline'
        const config = {
          status: type,
          limit: 3,
          destroyByClick: this.destroyByClick,
          duration: this.duration,
          icon: this.icon,
          position: this.position,
          preventDuplicates: this.preventDuplicates,
        };
        const titleContent = title ? `${title}` : '';
    
        this.index += 1;
        this.toastrService.show(
          body,
          `${titleContent}`,
          config);
      }
  }
  