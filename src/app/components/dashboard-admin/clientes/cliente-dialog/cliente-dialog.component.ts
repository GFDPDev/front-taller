import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClientesRes } from '../../../../interfaces/clientes';
import { MainService } from 'src/app/services/main.service';
import { Res } from 'src/app/interfaces/response';

@Component({
  selector: 'app-cliente-dialog',
  templateUrl: './cliente-dialog.component.html',
  styleUrls: ['./cliente-dialog.component.scss'],
})
export class ClienteDialogComponent {
  private route = '/client';
  form!: FormGroup;
  mode!: Number;
  title!: String;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ClienteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClientesRes,
    private mainService: MainService,
    private snackbar: MatSnackBar
  ) {
    if (this.data) {
      this.mode = 1;
      this.title = 'Actualizar';
      this.form = this.fb.group({
        id: [this.data.id, Validators.required],
        nombre: [this.data.nombre, Validators.required],
        apellido: [this.data.apellido, Validators.required],
        telefono: [
          this.data.telefono,
          [
            Validators.required,
            Validators.minLength(10),
            Validators.pattern('^[0-9]*$'),
          ],
        ],
        curp: [this.data.curp],
      });
    } else {
      this.mode = 0;
      this.title = 'Nuevo';

      this.form = this.fb.group({
        nombre: ['', Validators.required],
        apellido: ['', Validators.required],
        telefono: [
          '',
          [
            Validators.required,
            Validators.minLength(10),
            Validators.pattern('^[0-9]*$'),
          ],
        ],
        curp: [null],
      });
    }
  }


  onAdd(): void {
    const cliente: ClientesRes = this.form.value;
    if (this.isCreateMode()) {
      this.mainService
        .postRequest(cliente, this.route)
        .subscribe((res: Res) => {
          if (res.error) {
            this.snackbar.open(`${res.data} (${res.code})`, 'Aceptar', {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          } else {
            this.dialogRef.close(cliente);
          }
        });
    } else {
      this.mainService.putRequest(cliente, this.route).subscribe((res: Res) => {
        if (res.error) {
          this.snackbar.open(`${res.data} (${res.code})`, 'Aceptar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        } else {
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
  onNoClick(): void {
    this.dialogRef.close();
  }
}
