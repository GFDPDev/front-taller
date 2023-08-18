import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { LoginRes, Convert } from './interfaces/login';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  profile = sessionStorage.getItem('profile');
  constructor(private router: Router) {
  }

  canLoad() {
    if (!this.profile) {
      return this.router.navigate(['/notFound']).then(() => false);
    } else{
      let perfil = Convert.toLoginRes(this.profile);
      if (perfil.tipo === '0') {
        return true;
      } else {
        return false;


      }
    }
  }

}
