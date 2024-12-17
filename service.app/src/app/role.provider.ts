import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { of as observableOf } from 'rxjs/observable/of';
import { NbAuthService, NbAuthJWTToken } from '@nebular/auth';
import { NbRoleProvider } from '@nebular/security';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable()
export class RoleProvider implements NbRoleProvider {
  private readonly _destroying$ = new Subject<void>();
  constructor(private authService: MsalService,    private msalBroadcastService: MsalBroadcastService) {
  }

  getRole(): Observable<string> {
    
    return this.msalBroadcastService.inProgress$
    .pipe(
      filter(
        (status: InteractionStatus) => status === InteractionStatus.None
      ),
      takeUntil(this._destroying$),
      map(()=>{
        return this.authService.instance.getAllAccounts().length > 0 ? this.authService.instance.getAccountByHomeId(
          this.authService.instance.getAllAccounts()[0].homeAccountId
        ).idTokenClaims.roles[0] : null
      })
    );

   

  }
}