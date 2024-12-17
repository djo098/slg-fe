import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MsalBroadcastService, MsalService } from "@azure/msal-angular";
import { InteractionStatus } from "@azure/msal-browser";
import { Observable, Subject } from "rxjs";
import { of as observableOf } from 'rxjs/observable/of';
import { filter, map, takeUntil } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private readonly _destroying$ = new Subject<void>();
  constructor(private authService: MsalService,    private msalBroadcastService: MsalBroadcastService) {
  }

  getUsername(): Observable<string> {
    return this.msalBroadcastService.inProgress$
    .pipe(
      filter(
        (status: InteractionStatus) => status === InteractionStatus.None
      ),
      takeUntil(this._destroying$),
      map(()=>{
        return this.authService.instance.getAccountByHomeId(
          this.authService.instance.getAllAccounts()[0].homeAccountId
        ).username
      })
    )
    
  }
  getInfo(): Observable<any> {
    
    return observableOf( this.authService.instance.getAccountByHomeId(this.authService.instance.getAllAccounts()[0].homeAccountId));
  }
  
  getRole(): Observable<string> {
    
   
    return observableOf(this.authService.instance.getAccountByHomeId(
        this.authService.instance.getAllAccounts()[0].homeAccountId
      ).idTokenClaims.roles[0])
  }

  getRoleString(): string {
    
   
    return this.authService.instance.getAccountByHomeId(
        this.authService.instance.getAllAccounts()[0].homeAccountId
      ).idTokenClaims.roles[0].toString()
  }
 

}
