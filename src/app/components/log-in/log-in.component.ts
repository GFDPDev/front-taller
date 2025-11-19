import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Res } from 'src/app/interfaces/response';
import { User, Convert } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import packageJson from '../../../../package.json';

@Component({
    selector: 'app-log-in',
    templateUrl: './log-in.component.html',
    styleUrls: ['./log-in.component.scss'],
    standalone: false
})
export class LogInComponent implements OnInit {
  form: UntypedFormGroup;
  route = '/login';
  mode: ProgressSpinnerMode = 'indeterminate';
  version = packageJson.version;
  isLoading: boolean = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackbar: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      curp: ['', Validators.required],
      password: ['', Validators.required],
    });
    sessionStorage.clear();
  }

  ngOnInit(): void {}

  login() {
    let curp = this.form.value.curp;
    let password = this.form.value.password;

    this.authService
      .loginRequest({ curp: curp, password: password }, this.route)
      .subscribe((res: Res) => {
        if (!res.error) {
          const user: User = res.data;
          sessionStorage.setItem('token',user.token);
          sessionStorage.setItem('user_taller', Convert.userToJson(user));
          if (user.tipo == 1) {
            this.router.navigate(['/taller/dashboard-admin']);
          } else {
            this.router.navigateByUrl('/taller/dashboard-tecnico');
          }
        } else {
          this.form.controls['password'].reset();
          this.snackbar.open(`${res.data} (${res.code})`, 'Aceptar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      });
  }
}
