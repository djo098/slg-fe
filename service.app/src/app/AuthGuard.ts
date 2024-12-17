import { Parser } from "@angular/compiler";
import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { ProfileService } from "./@core/services/sharedServices/auth.service";
import { Observable } from "rxjs";
import { NbAccessChecker } from "@nebular/security";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: ProfileService,
    public accessChecker: NbAccessChecker
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return new Observable<boolean>((obs) => {
      this.accessChecker
        .isGranted(next.data["permission"], next.data["resource"])
        .subscribe((granted) => {
          obs.next(granted)
          if(granted==false){
            this.router.navigate(['/balance']);
          }
        });
    });
  }
 /* checkUserLogin(route: ActivatedRouteSnapshot): boolean {
    if (route.data && route.data["permission"] && route.data["resource"]) {
    }
    return false;
          if (route.data.role && route.data.role.indexOf(userRole) === -1) {
        this.router.navigate(['/balance']);
        return false;
      }
      return true; 
  }*/
}
