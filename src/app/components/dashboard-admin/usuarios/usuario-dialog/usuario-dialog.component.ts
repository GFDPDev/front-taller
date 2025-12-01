import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../../interfaces/user';
import { MainService } from 'src/app/services/main.service';
import { Res } from 'src/app/interfaces/response';
import { DataService } from 'src/app/services/data.service';

@Component({
    selector: 'app-usuario-dialog',
    templateUrl: './usuario-dialog.component.html',
    styleUrls: ['./usuario-dialog.component.scss'],
    standalone: false
})
export class UsuarioDialogComponent{
  private route = '/user';
  form: FormGroup;
  mode: Number;
  title: String;
  constructor( private fb: FormBuilder,
    public dialogRef: MatDialogRef<UsuarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private mainService: MainService,
    private dataService: DataService,
    private snackbar: MatSnackBar,) {
      if (this.data) {
        this.mode = 1;
        this.title = 'Actualizar';
        this.form = this.fb.group({
          id: [this.data.id, Validators.required],
          nombre: [this.data.nombre, Validators.required],
          apellido: [this.data.apellido, Validators.required],
          tipo: [this.data.tipo.toString(), Validators.required],
          curp: [this.data.curp],
          password: ['', Validators.required]
        });
      } else {
        this.mode = 0;
        this.title = 'Nuevo';
        this.form = this.fb.group({
          nombre: ['', Validators.required],
          apellido: ['', Validators.required],
          tipo: ['', Validators.required],
          curp: [' '],
          password: ['', Validators.required]
        });
      }
    }
  onNoClick(): void {
    this.dialogRef.close();

  }

  onAdd(): void{
    const usuario: User = this.form.value;
    this.dataService.invalidateUsersCache();
    if (this.isCreateMode()) {
      this.mainService
        .postRequest(usuario, this.route)
        .subscribe((res: Res) => {
          if (res.error) {
            this.snackbar.open(`${res.data} (${res.code})`, 'Aceptar', {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          } else {
            this.dialogRef.close(usuario);
          }
        });
    } else {
      this.mainService.putRequest(usuario, this.route).subscribe((res: Res) => {
        if (res.error) {
          this.snackbar.open(`${res.data} (${res.code})`, 'Aceptar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        } else {
          this.dialogRef.close(usuario);
        }
      });
    }
  }
  isCreateMode() {
    return this.mode === 0;
  }

  isUpdateMode() {
    return this.mode === 1;
  }
}
