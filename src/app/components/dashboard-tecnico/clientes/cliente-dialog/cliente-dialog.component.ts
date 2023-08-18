import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ClientesRes } from '../../../../interfaces/clientes';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-cliente-dialog',
  templateUrl: './cliente-dialog.component.html',
  styleUrls: ['./cliente-dialog.component.scss']
})
export class ClienteDialogComponent implements OnInit {
  model = "Clientes";
  form!: UntypedFormGroup;
  mode!: Number;
  title!: String;
  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<ClienteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClientesRes, private mainService: MainService, private snackbar: MatSnackBar,) {
      if (this.data) {
        this.mode = 1;
        this.title = 'Actualizar';
        this.form = this.fb.group({
          nombre: [this.data.nombre, Validators.required],
          apellido: [this.data.apellido, Validators.required],
          telefono: [this.data.telefono, [Validators.required, Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
          curp: [this.data.curp]
        });
      } else {
        this.mode = 0;
        this.title = 'Nuevo';

        this.form = this.fb.group({
          nombre: ['', Validators.required],
          apellido:  ['', Validators.required],
          telefono: [ '', [Validators.required, Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
          curp: [null]
        });
      }

    }

    ngOnInit(): void {



    }
  onNoClick(): void {
    this.dialogRef.close();

  }
  onAdd(): void {
    const cliente: ClientesRes = this.form.value;
    if (this.mode === 0) {
      this.mainService.requestOne({ _function: "fnCreateCliente", data: cliente }, this.model).subscribe
      ((data: any)=> {
        if (data.errno === 1062) {
          this.snackbar.open('Este numero de telefono de cliente ya está registrado.', 'Aceptar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });

        } else if(data.error) {
          this.snackbar.open('Error registrando cliente.', 'Aceptar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
        else {
          this.dialogRef.close(cliente);
        }
      });
    } else {
      cliente.id = this.data.id;

      this.mainService.requestOne({ _function: "fnUpdateCliente", data: cliente }, this.model).subscribe
      ((data: any)=> {
        if (data.errno === 1062) {
          this.snackbar.open('Este numero de telefono de cliente ya está registrado.', 'Aceptar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });

        } else if(data.error) {
          this.snackbar.open('Error actualizando cliente.', 'Aceptar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
        else {
          this.dialogRef.close(cliente);
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
