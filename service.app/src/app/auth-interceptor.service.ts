import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MsalService } from '@azure/msal-angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private readonly _destroying$ = new Subject<void>();
    constructor(private msalService: MsalService) { }

    private isTokenExpired(): boolean {
        const decodedToken = this.msalService.instance.getActiveAccount().idTokenClaims;
        return new Date(decodedToken.exp * 1000) < new Date();
    }

    getIdToken(): Observable<string> {
        return this.msalService.acquireTokenSilent({
            scopes: ['openid', 'profile'],
            forceRefresh: this.isTokenExpired()
        })
            .pipe(
                map(response => response.idToken)
            );
    }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        // const token = 'token';
        // const cloned = req.clone({
        //     headers: req.headers.set("X-Auth", token)
        // });
        // return next.handle(cloned);

        return this.getIdToken()
            .pipe(
                switchMap(idToken => {
                    const authenticatedRequest = req.clone({
                        headers: req.headers.set('X-Auth', `Bearer ${idToken}`)
                    });
                    return next.handle(authenticatedRequest);
                })
            );

    }

}