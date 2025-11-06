import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';
import { User, Convert } from 'src/app/interfaces/user';

@Component({
    selector: 'app-dashboard-tecnico',
    templateUrl: './dashboard-tecnico.component.html',
    styleUrls: ['./dashboard-tecnico.component.scss'],
    standalone: false
})
export class DashboardTecnicoComponent {

  @ViewChild(MatSidenav)
 sidenav!: MatSidenav;
 user!: User;
 sidenavMode: 'over' | 'side' = 'side';
 opened = true;
 title='Panel'
 constructor(private breakpointObserver: BreakpointObserver, private observer: BreakpointObserver, private router: Router) {
  this.user = Convert.toUser(sessionStorage.getItem('user_taller')??'');
 }
 ngAfterViewInit() {
   this.observer.observe([Breakpoints.Handset]).subscribe((res) => {
      this.sidenavMode = 'side';

   });

 }
 logout(){
  sessionStorage.clear();
  this.router.navigate(['/taller/login']);
}
setMenuTitle(title: string) {
    this.title = title;
  }

}
