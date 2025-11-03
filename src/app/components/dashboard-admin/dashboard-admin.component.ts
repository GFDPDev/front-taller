import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';
import { Convert, User } from 'src/app/interfaces/user';

@Component({
    selector: 'app-dashboard-admin',
    templateUrl: './dashboard-admin.component.html',
    styleUrls: ['./dashboard-admin.component.scss'],
    standalone: false
})
export class DashboardAdminComponent {
 /** Based on the screen size, switch from standard to one column per row */
 @ViewChild(MatSidenav)
 sidenav!: MatSidenav;
 user!: User;

 constructor(private breakpointObserver: BreakpointObserver, private observer: BreakpointObserver, private router: Router) {
  this.user = Convert.toUser(sessionStorage.getItem('user_taller')??'');
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
  this.router.navigate(['/taller/login']);
}

}
