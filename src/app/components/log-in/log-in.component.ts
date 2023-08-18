import { Component, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LoginRes, Convert } from '../../interfaces/login';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss']
})
export class LogInComponent implements OnInit {
  form: UntypedFormGroup;
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

    this.mainService.requestOne({ _function: "fnGetUsuario", curp: curp, passw: password }, "Usuarios").subscribe((data:LoginRes) =>{
      if (!data.error) {
        sessionStorage.setItem('profile', Convert.loginResToJson(data));

        if (data.tipo == '1') {

        this.router.navigate(['/dashboard-admin']);
        } else {

          this.router.navigateByUrl("/dashboard-tecnico");
        }

      } else {
        this.form.controls['password'].reset();

        this.snackbar.open(data.message ?? 'Error de conexión con el servidor', 'Aceptar', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }


}
