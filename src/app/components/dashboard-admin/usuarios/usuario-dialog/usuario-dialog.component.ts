import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsuariosRes } from '../../../../interfaces/usuarios';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-usuario-dialog',
  templateUrl: './usuario-dialog.component.html',
  styleUrls: ['./usuario-dialog.component.scss']
})
export class UsuarioDialogComponent implements OnInit {
  model = "Usuarios";
  form: FormGroup;
  mode: Number;
  title: String;
  constructor( private fb: FormBuilder,
    public dialogRef: MatDialogRef<UsuarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UsuariosRes,
    private mainService: MainService,
    private snackbar: MatSnackBar,) {
      if (this.data) {
        this.mode = 1;
        this.title = 'Actualizar';
        this.form = this.fb.group({
          nombre: [this.data.nombre, Validators.required],
          apellido: [this.data.apellido, Validators.required],
          tipo: [this.data.tipo, Validators.required],
          curp: [this.data.curp,  [Validators.required, Validators.minLength(10)]],
          password: ['', Validators.required]
        });
      } else {
        this.mode = 0;
        this.title = 'Nuevo';
        this.form = this.fb.group({
          nombre: ['', Validators.required],
          apellido: ['', Validators.required],
          tipo: ['', Validators.required],
          curp: ['',  [Validators.required, Validators.minLength(10)]],
          password: ['', Validators.required]
        });
      }
    }

  ngOnInit(): void {
  }
  onNoClick(): void {
    this.dialogRef.close();

  }

  onAdd(): void{
    const usuario: UsuariosRes = this.form.value;
    if (this.mode === 0) {
      this.mainService.requestOne({ _function: "fnCreateUsuario", data: usuario }, this.model).subscribe
      ((data: any)=> {
        if (data.errno === 1062) {
          this.snackbar.open('Este usuario ya está registrado.', 'Aceptar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });

        } else if(data.error) {
          this.snackbar.open('Error registrando usuario.', 'Aceptar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
        else {
          this.dialogRef.close(usuario);
        }
      });
    } else {
      usuario.id = this.data.id;
      this.mainService.requestOne({ _function: "fnUpdateUsuario", data: usuario }, this.model).subscribe
      ((data: any)=> {
        if (data.errno === 1062) {
          this.snackbar.open('Este usuario ya está registrado.', 'Aceptar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });

        } else if(data.error) {
          this.snackbar.open('Error actualizando usuari.', 'Aceptar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
        else {
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
