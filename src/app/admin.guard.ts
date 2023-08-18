import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree, CanLoad } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginRes, Convert } from './interfaces/login';


@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanLoad, CanActivate {
  profile = sessionStorage.getItem('profile');
  constructor(private router: Router){

  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean> {
    if (!this.profile) {
      return false;
    } else{
      let perfil = Convert.toLoginRes(this.profile);
      if (perfil.tipo === '1') {
        return true;
      } else {
        return false;


      }
    }
  }
  canLoad() {
    if (!this.profile) {
      return this.router.navigate(['/notFound']).then(() => false);
    } else{
      let perfil = Convert.toLoginRes(this.profile);
      if (perfil.tipo === '1') {
        return true;
      } else {
        return false;


      }
    }
  }

}
