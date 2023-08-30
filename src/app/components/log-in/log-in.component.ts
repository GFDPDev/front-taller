import { Component, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { MainService } from 'src/app/services/main.service';
import { Res } from 'src/app/interfaces/response';
import { User, Convert } from 'src/app/interfaces/user';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss']
})
export class LogInComponent implements OnInit {
  form: UntypedFormGroup;
  route = '/login'
  mode: ProgressSpinnerMode = 'indeterminate';
  isLoading : boolean = false;
  constructor(private fb: FormBuilder,
              private mainService: MainService,
              private snackbar: MatSnackBar,
              private router: Router) {
    this.form = this.fb.group({
      curp: ['', Validators.required],
      password: ['', Validators.required],
    });
   }

  ngOnInit(): void {
    
  }

  login(){

    let curp = this.form.value.curp;
    let password = this.form.value.password;

    this.mainService.postRequest({"curp" : curp, "password" : password }, this.route).subscribe((res:Res) =>{
      if (!res.error) {
        const user: User = res.data;
        sessionStorage.setItem('user', Convert.userToJson(user));
        sessionStorage.setItem('token', res.token ?? '');

        if (user.tipo == 1) {
          this.router.navigate(['/dashboard-admin']);
        } else {
          this.router.navigateByUrl("/dashboard-tecnico");
        }

      } else {
        this.form.controls['password'].reset();
        this.snackbar.open(`${res.data} (${res.code})`, 'Aceptar', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }


}
