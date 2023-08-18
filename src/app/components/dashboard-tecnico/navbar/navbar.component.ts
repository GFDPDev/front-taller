import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Convert, LoginRes } from 'src/app/interfaces/login';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  profile: LoginRes = Convert.toLoginRes(sessionStorage.getItem('profile')??'');

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }
  logout(){
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
