import { MarcasRes } from './../../../../interfaces/marcas';
import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelect } from '@angular/material/select';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
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
// tslint:disable-next-line:no-duplicate-imports
import { Moment } from 'moment';
import 'moment/locale/es';
import { Convert, User } from 'src/app/interfaces/user';
import { ClientesRes } from 'src/app/interfaces/clientes';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MainService } from 'src/app/services/main.service';
import { ToolService } from 'src/app/interfaces/toolservice';
import { Res } from 'src/app/interfaces/response';
import * as moment from 'moment';
import { ajax } from 'rxjs/ajax';

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
  selector: 'app-tecnico-dialog',
  templateUrl: './tecnico-dialog.component.html',
  styleUrls: ['./tecnico-dialog.component.scss'],
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
export class TecnicoDialogComponent implements OnInit, AfterViewInit {
  private route = '/service';
  form!: UntypedFormGroup;
  mode!: Number;
  title!: String;
  usuarios!: User[];
  user!: User;
  clientes!: ClientesRes[];
  marcas!: MarcasRes[];
  minDateTerminado!: Date;
  minDateEntregado!: Date;
  estatus = [
    {
      value: 'POR AUTORIZAR',
    },
    {
      value: 'PENDIENTE',
    },
    {
      value: 'TERMINADO',
    },
    {
      value: 'ENTREGADO',
    },
    {
      value: 'NO AUTORIZADO',
    },
  ];

  tipos = [
    {
      value: 'GAS LP',
    },
    {
      value: 'BOMBEO',
    },
    {
      value: 'GASOLINA',
    },
    {
      value: 'HERRAMIENTA ELECTRICA',
    },
    {
      value: 'CLIMA',
    },
    {
      value: 'OTRO',
    },
  ];

  public isLoading: boolean = true;

  public clientesFiltro: UntypedFormControl = new UntypedFormControl();
  public clientesControl: UntypedFormControl = new UntypedFormControl();
  public clientesFiltrados: ReplaySubject<ClientesRes[]> = new ReplaySubject<
    ClientesRes[]
  >(1);
  protected _onDestroy = new Subject<void>();

  @ViewChild('singleSelectClientes') singleSelectClientes!: MatSelect;

  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<TecnicoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ToolService,
    private mainService: MainService,
    private snackbar: MatSnackBar
  ) {
    this.user = Convert.toUser(sessionStorage.getItem('user_taller') ?? '');
    if (this.data) {
      this.mode = 1;
      this.title = 'Actualizar';
      this.form = this.fb.group({
        id: [this.data.id, Validators.required],
        fecha_ingreso: [{ value: this.data.fecha_ingreso, disabled: true }],
        id_cliente: [this.data.id_cliente, Validators.required],
        producto: [this.data.producto, Validators.required],
        id_marca: [this.data.id_marca, Validators.required],
        modelo: [this.data.modelo, Validators.required],
        tipo: [this.data.tipo, Validators.required],
        serie: [this.data.serie, Validators.required],
        garantia: [this.data.garantia.toString(), Validators.required],
        falla_detectada: [this.data.falla_detectada, Validators.required],
        id_usuario: [this.data.id_usuario, Validators.required],
        cotizacion: [this.data.cotizacion],
        fecha_terminado: [{ value: this.data.fecha_terminado, disabled: true }],
        fecha_entrega: [{ value: this.data.fecha_entrega, disabled: true }],
        importe: [this.data.importe],
        estatus: [
          { value: this.data.estatus, disabled: true },
          Validators.required,
        ],
        observaciones: [this.data.observaciones],
        avisado: [this.data.avisado],
        impreso: [this.data.impreso],
        id_modificado: [this.user.id],
      });
    } else {
      this.mode = 0;
      this.title = 'Nuevo';
      this.form = this.fb.group({
        fecha_ingreso: [
          { value:  moment().format('YYYY-MM-DD HH:mm:ss'), disabled: true },
        ],
        id_cliente: ['', Validators.required],
        producto: ['', Validators.required],
        id_marca: ['', Validators.required],
        modelo: ['', Validators.required],
        tipo: ['', Validators.required],
        serie: ['', Validators.required],
        garantia: ['', Validators.required],
        falla_detectada: ['', Validators.required],
        id_usuario: [3, Validators.required], // 3 es el ID del usuario SIN ENCARGADO
        cotizacion: [null],
        fecha_terminado: [null],
        fecha_entrega: [null],
        importe: [null],
        estatus: [
          { value: this.estatus[0].value, disabled: true },
          Validators.required,
        ],
        observaciones: [' '],
        id_modificado: [this.user.id],
      });
    }
  }

  ngOnInit(): void {
    this.getMenus();
    this.clientesControl.valueChanges.subscribe((data) => {
      this.form.controls['id_cliente'].setValue(data.id);
    });
    this.clientesFiltro.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtrarClientes();
      });
    this.minDateTerminado = this.form.controls['fecha_ingreso'].value;
    this.form.controls['fecha_ingreso'].valueChanges.subscribe((data) => {
      this.minDateTerminado = data;
    });
    this.minDateEntregado = this.form.controls['fecha_terminado'].value;

    this.form.controls['fecha_terminado'].valueChanges.subscribe((data) => {
      this.minDateEntregado = data;
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
  ngAfterViewInit(): void {
    this.setInitialValueClientes();
  }
  onAdd(): void {
    const servicio = this.form.getRawValue();
    servicio.fecha_terminado = servicio.fecha_terminado
      ? _moment(servicio.fecha_terminado).format('YYYY-MM-DD')
      : null;
    servicio.fecha_entrega = servicio.fecha_entrega
      ? _moment(servicio.fecha_entrega).format('YYYY-MM-DD')
      : null;
    if (this.isCreateMode()) {
      this.mainService
        .postRequest(servicio, this.route)
        .subscribe((res: Res) => {
          if (res.error) {
            this.snackbar.open(`${res.data} (${res.code})`, 'Aceptar', {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          } else {
            this.dialogRef.close(servicio);
          }
        });
    } else {
      this.mainService
        .putRequest(servicio, this.route)
        .subscribe((res: Res) => {
          if (res.error) {
            this.snackbar.open(`${res.data} (${res.code})`, 'Aceptar', {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          } else {
            this.dialogRef.close(servicio);
          }
        });
    }
  }
  getMenus() {
    this.mainService.getRequest({}, `/brand`).subscribe((res: Res) => {
      this.marcas = res.data;
    });
    if (this.isUpdateMode()) {
      this.mainService
        .getRequest({}, `/client/get_active_clients`)
        .subscribe((res: Res) => {
          this.clientes = res.data;
          this.clientesFiltrados.next(this.clientes.slice());
          let filtro = res.data.filter(
            (cliente: ClientesRes) => cliente.id == this.data.id_cliente
          );
          this.clientesControl.setValue(filtro[0]);
          this.isLoading = false;
        });
      this.mainService
        .getRequest({ id: this.user.id }, `/user/get_tech_users`)
        .subscribe((res: Res) => {
          this.usuarios = res.data;
        });
    } else {
      this.mainService.getRequest({}, `/client/get_active_clients`).subscribe({
        next: (res: Res) => (this.clientes = res.data),
        complete: () => {
          this.clientesFiltrados.next(this.clientes.slice());
          this.isLoading = false;
        },
      });
      this.mainService
        .getRequest({ id: this.user.id }, `/user/get_tech_users`)
        .subscribe((res: Res) => {
          this.usuarios = res.data;
        });
    }
  }
  protected setInitialValueClientes() {
    this.clientesFiltrados
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.singleSelectClientes.compareWith = (
          a: ClientesRes,
          b: ClientesRes
        ) => a && b && a.id === b.id;
      });
  }
  protected filtrarClientes() {
    if (!this.clientes) {
      return;
    }
    // get the search keyword
    let search = this.clientesFiltro.value;
    if (!search) {
      this.clientesFiltrados.next(this.clientes.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.clientesFiltrados.next(
      this.clientes.filter((cliente) => {
        let filtrado =
          cliente.nombre + ' ' + cliente.apellido + ' ' + cliente.telefono;
        return filtrado.toLowerCase().indexOf(search) > -1;
      })
    );
  }
  isCreateMode() {
    return this.mode === 0;
  }

  isUpdateMode() {
    return this.mode === 1;
  }
  efectividadDias(start: Date, end: Date) {
    var eventStartTime = new Date(start);
    var eventEndTime = new Date(end);
    var duration = eventEndTime.getDate() - eventStartTime.getDate();
    return duration;
  }
  marcarTerminado() {
    let telefono = this.clientesControl.value.telefono;
    let mensaje = '--- *SERVICIO TERMINADO* --- \nBuen día, estimado cliente. Centro de Servicio Don Pedro le informa que su ' +
    this.data.producto +
    ' esta *listo para la entrega.* Favor presentarse con su talón de entrega de equipo. Número de Folio: ' +
    this.data.id +
    ' Importe Total: $' +
    this.form.value.importe +
    '. ' +
    this.form.value.observaciones ?? '';
    const now = moment();
    this.form.controls['estatus'].setValue('TERMINADO');
    this.form.controls['fecha_terminado'].setValue(now.format('YYYY-MM-DD'));
    // ajax.post("http://192.168.50.200:3001/lead", {
    //   message : 
    //   mensaje,
    //   phone : "521" + telefono 
    // }, { 'Content-Type': 'application/json' })
    //   .subscribe({
    //     next: (res:any)=>{
    //       console.log(res.response.responseExSave.id)
    //       if(res.response.responseExSave.id != undefined){
    //         this.form.controls['avisado'].setValue(2);
    //         this.onAdd();
            
    //       } else {
    //         this.onAdd();
    //         this.snackbar.open(`No se envió el mensaje`, 'Aceptar', {
    //           duration: 4000,
    //           horizontalPosition: 'center',
    //           verticalPosition: 'top',
    //         });

    //       }
    //     }
    //   });
  }
  marcarEntregado() {
    const now = moment();
    this.form.controls['estatus'].setValue('ENTREGADO');
    this.form.controls['fecha_entrega'].setValue(now.format('YYYY-MM-DD'));
    this.onAdd();
  }
  marcarPendiente() {
    this.form.controls['estatus'].setValue('PENDIENTE');
    this.onAdd();
  }
}
