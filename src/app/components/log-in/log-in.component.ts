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
declare global {
  interface Window {
    electronAPI: {
      saveCredentials: (data: any) => Promise<any>;
      getCredentials: () => Promise<any>;
      deleteCredentials: () => Promise<any>;
    };
  }
}
@Component({
    selector: 'app-log-in',
    templateUrl: './log-in.component.html',
    styleUrls: ['./log-in.component.scss'],
    standalone: false
})
export class LogInComponent implements OnInit {
  form: UntypedFormGroup;
  rememberMe: boolean = false;
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
      remember: [false]
    });
    sessionStorage.clear();
  }

  async ngOnInit(): Promise<void> {
    await this.checkSavedCredentials();
  }

  async checkSavedCredentials() {
    if (window.electronAPI) {
      const credentials = await window.electronAPI.getCredentials();
      if (credentials) {
        this.form.patchValue({
          curp: credentials.username,
          password: credentials.password,
          remember: true
        });
        this.rememberMe = true;
      }
    }
  }

  login() {
    let curp = this.form.value.curp;
    let password = this.form.value.password;

    this.authService
      .loginRequest({ curp: curp, password: password }, this.route)
      .subscribe((res: Res) => {
        if (!res.error) {
          console.log(window.electronAPI)
          if (window.electronAPI) {
            if (this.form.value.remember) {
              window.electronAPI.saveCredentials({ username: curp, password: password });
            } else {
              window.electronAPI.deleteCredentials();
            }
          }
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
