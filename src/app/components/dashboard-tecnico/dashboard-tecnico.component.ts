import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';
import { LoginRes, Convert } from 'src/app/interfaces/login';

@Component({
  selector: 'app-dashboard-tecnico',
  templateUrl: './dashboard-tecnico.component.html',
  styleUrls: ['./dashboard-tecnico.component.scss']
})
export class DashboardTecnicoComponent {

  @ViewChild(MatSidenav)
 sidenav!: MatSidenav;
 profile!: LoginRes;

 constructor(private breakpointObserver: BreakpointObserver, private observer: BreakpointObserver, private router: Router) {
  this.profile = Convert.toLoginRes(sessionStorage.getItem('profile')??'');
 }
 ngAfterViewInit() {
   this.observer.observe(['(max-width: 1200px)']).subscribe((res) => {
     setTimeout(() => {
       if (res.matches) {
         this.sidenav.mode = 'over';
         this.sidenav.close();
       } else {
         this.sidenav.mode = 'side';
         this.sidenav.open();
       }
     }, 300);

   });

 }
 logout(){
  sessionStorage.clear();
  this.router.navigate(['/login']);
}
}
