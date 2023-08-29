import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import * as _moment from 'moment';
import 'moment/locale/es';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MainService } from 'src/app/services/main.service';
import { GarantiasRes } from 'src/app/interfaces/garantias';
import { Convert, User } from 'src/app/interfaces/user';
import { Res } from 'src/app/interfaces/response';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'DD MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'DD MMMM YYYY',
  },
};

@Component({
  selector: 'app-garantia-dialog',
  templateUrl: './garantia-dialog.component.html',
  styleUrls: ['./garantia-dialog.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class GarantiaDialogComponent implements OnInit {
  private route = '/warranty';
  form!: FormGroup;
  mode!: Number;
  title!: String;
  user!: User;

  estatusC = [
    {
      value: 'EN TRÁMITE',
    },
    {
      value: 'ENVIADO',
    },
    {
      value: 'AUTORIZADO',
    },
    {
      value: 'NO AUTORIZADO',
    },
    {
      value: 'CORTESÍA',
    },
  ];
  estatusP = [
    {
      value: 'EN TRÁMITE',
    },
    {
      value: 'CAMBIO FÍSICO',
    },
    {
      value: 'NOTA DE CRÉDITO',
    },
    {
      value: 'MERMA',
    },
  ];
  comprobante = [
    {
      value: 'REMISIÓN',
    },
    {
      value: 'FACTURA ',
    },
  ];

  protected _onDestroy = new Subject<void>();
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<GarantiaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GarantiasRes,
    private mainService: MainService,
    private snackbar: MatSnackBar
  ) {
    this.user = Convert.toUser(localStorage.getItem('user') ?? '');

    if (this.data) {
      this.mode = 1;
      this.title = 'Actualizar';
      this.form = this.fb.group({
        id: [this.data.id, Validators.required],
        comprobante: [this.data.comprobante, Validators.required],
        folio: [this.data.folio, Validators.required],
        autorizo: [this.data.autorizo],
        producto: [this.data.producto, Validators.required],
        marca: [this.data.marca, Validators.required],
        modelo: [this.data.modelo, Validators.required],
        cantidad: [this.data.cantidad, Validators.required],
        costo_unitario: [this.data.costo_unitario, Validators.required],
        total: [this.data.total, Validators.required],
        motivo: [this.data.motivo],
        fecha_proveedor: [this.data.fecha_proveedor],
        fecha_resuelto_proveedor: [this.data.fecha_resuelto_proveedor],
        fecha_resuelto_cliente: [this.data.fecha_resuelto_cliente],
        estado_cliente: [this.data.estado_cliente],
        estado_proveedor: [this.data.estado_proveedor],
        id_modificado: [this.user.id],
      });
    } else {
      this.mode = 0;
      this.title = 'Nuevo';
      this.form = this.fb.group({
        comprobante: ['', Validators.required],
        folio: ['', Validators.required],
        autorizo: [''],

        producto: ['', Validators.required],
        marca: ['', Validators.required],
        modelo: ['', Validators.required],
        cantidad: ['', Validators.required],
        costo_unitario: ['', Validators.required],
        total: ['', Validators.required],
        motivo: ['', Validators.required],
        fecha_proveedor: [null],
        fecha_resuelto_proveedor: [null],
        fecha_resuelto_cliente: [null],
        estado_proveedor: [this.estatusP[0].value, Validators.required],
        estado_cliente: [this.estatusC[0].value, Validators.required],
        id_modificado: [this.user.id],
      });
    }
  }
  ngOnInit(): void {}
  onNoClick(): void {
    this.dialogRef.close();
  }
  onAdd(): void {
    const garantia: GarantiasRes = this.form.value;
    if (this.isCreateMode()) {
      this.mainService
        .postRequest(garantia, this.route)
        .subscribe((res: Res) => {
          if (res.error) {
            this.snackbar.open(`${res.data} (${res.code})`, 'Aceptar', {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          } else {
            this.dialogRef.close(garantia);
          }
        });
    } else {
      this.mainService
        .putRequest(garantia, this.route)
        .subscribe((res: Res) => {
          if (res.error) {
            this.snackbar.open(`${res.data} (${res.code})`, 'Aceptar', {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          } else {
            this.dialogRef.close(garantia);
          }
        });
    }
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
  isCreateMode() {
    return this.mode === 0;
  }

  isUpdateMode() {
    return this.mode === 1;
  }
}
