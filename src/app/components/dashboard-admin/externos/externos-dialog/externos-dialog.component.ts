import { MarcasRes } from './../../../../interfaces/marcas';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelect } from '@angular/material/select';
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
import { Convert } from 'src/app/interfaces/login';
import { UsuariosRes } from '../../../../interfaces/usuarios';
import { ClientesRes } from '../../../../interfaces/clientes';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MainService } from 'src/app/services/main.service';
import { ExternosRes } from 'src/app/interfaces/externos';
import {
  NgxMatMomentModule,
  NgxMatMomentAdapter,
  NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular-material-components/moment-adapter';
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
  NGX_MAT_DATE_FORMATS,
  NgxMatDateAdapter,
} from '@angular-material-components/datetime-picker';
import * as moment from 'moment';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY, h:mm:ss',
  },
  display: {
    dateInput: 'DD/MM/YYYY, h:mm a',
    monthYearLabel: 'DD MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'DD MMMM YYYY',
  },
};
@Component({
  selector: 'app-externos-dialog',
  templateUrl: './externos-dialog.component.html',
  styleUrls: ['./externos-dialog.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    {
      provide: NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS,
      useValue: { useUtc: true },
    },
    { provide: NGX_MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: NgxMatDateAdapter, useClass: NgxMatMomentAdapter },
  ],
})
export class ExternosDialogComponent implements OnInit {
  model = 'Externos';
  form!: FormGroup;
  mode!: Number;
  title!: String;
  clientes!: ClientesRes[];
  usuarios!: UsuariosRes[];
  estatus = [
    {
      value: 'PENDIENTE',
    },
    {
      value: 'AGENDADO',
    },
    {
      value: 'TERMINADO',
    },
  ];
  marcas = [
    {
      value: 'BOSCH',
    },
    {
      value: 'RHEEM',
    },
    {
      value: 'RINNAI',
    },
    {
      value: 'CALOREX',
    },
    {
      value: 'IUSA',
    },
    {
      value: 'OTRO',
    },
  ];
  public usuariosFiltro: FormControl = new FormControl();
  public usuariosControl: FormControl = new FormControl();
  public usuariosFiltrados: ReplaySubject<UsuariosRes[]> = new ReplaySubject<
    UsuariosRes[]
  >(1);

  public clientesFiltro: FormControl = new FormControl();
  public clientesControl: FormControl = new FormControl();
  public clientesFiltrados: ReplaySubject<ClientesRes[]> = new ReplaySubject<
    ClientesRes[]
  >(1);
  protected _onDestroy = new Subject<void>();

  @ViewChild('singleSelectUsuarios') singleSelectUsuarios!: MatSelect;
  @ViewChild('singleSelectClientes') singleSelectClientes!: MatSelect;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ExternosDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExternosRes,
    private mainService: MainService,
    private snackbar: MatSnackBar
  ) {

    if (this.data) {
      this.mode = 1;
      this.title = 'Actualizar';
      this.form = this.fb.group({
        folio: [this.data.folio, Validators.required],
        garantia: [this.data.garantia, Validators.required],
        marca: [this.data.marca, Validators.required],
        id_cliente: [this.data.id_cliente, Validators.required],
        id_usuario: [this.data.id_usuario, Validators.required],
        cotizacion: [this.data.cotizacion],
        cita: [this.data.cita],
        importe: [this.data.importe],
        estado: [this.data.estado, Validators.required],
        observaciones: [this.data.observaciones],
        avisado: [this.data.avisado],
      });
    } else {
      this.mode = 0;
      this.title = 'Nuevo';
      this.form = this.fb.group({
        folio: ['', Validators.required],
        garantia: ['', Validators.required],
        marca: ['BOSCH', Validators.required],
        id_cliente: ['', Validators.required],
        id_usuario: ['', Validators.required],
        cotizacion: [null],
        cita: [null],
        importe: [null],
        estado: [this.estatus[0].value, Validators.required],
        observaciones: [' '],
      });
    }
  }

  ngOnInit(): void {
    this.getMenus();
    this.clientesControl.valueChanges.subscribe((data) => {
      this.form.controls['id_cliente'].setValue(data.id);
    });
    this.usuariosControl.valueChanges.subscribe((data) => {
      this.form.controls['id_usuario'].setValue(data.id);
    });
    this.usuariosFiltro.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtrarUsuarios();
      });
    this.clientesFiltro.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtrarClientes();
      });
  }
  protected filtrarUsuarios() {
    if (!this.usuarios) {
      return;
    }
    // get the search keyword
    let search = this.usuariosFiltro.value;
    if (!search) {
      this.usuariosFiltrados.next(this.usuarios.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.usuariosFiltrados.next(
      this.usuarios.filter(usuario => usuario.nombre.toLowerCase().indexOf(search) > -1)
    );

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
  onNoClick(): void {
    this.dialogRef.close();
  }
  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
  ngAfterViewInit(): void {
    this.setInitialValueClientes();
    this.setInitialValueUsuarios();
  }
  getMenus() {
    if (this.isUpdateMode()) {
      this.mainService
        .requestMany({ _function: 'fnGetClientes' }, 'Clientes')
        .subscribe((data: ClientesRes[]) => {
          this.clientes = data;
          this.clientesFiltrados.next(this.clientes.slice());
          let filtro = data.filter(
            (cliente) => cliente.id == this.data.id_cliente
          );
          this.clientesControl.setValue(filtro[0]);
        });
      this.mainService
        .requestMany({ _function: 'fnGetUsuarios' }, 'Usuarios')
        .subscribe((data: UsuariosRes[]) => {
          this.usuarios = data;
          this.usuariosFiltrados.next(this.usuarios.slice());
          let filtro = data.filter(
            (usuario) => usuario.id == this.data.id_usuario
          );
          this.usuariosControl.setValue(filtro[0]);
        });
    } else {
      this.mainService
        .requestMany({ _function: 'fnGetClientes' }, 'Clientes')
        .subscribe((data: ClientesRes[]) => {
          this.clientes = data;
          this.clientesFiltrados.next(this.clientes.slice());
        });
      this.mainService
        .requestMany({ _function: 'fnGetUsuarios' }, 'Usuarios')
        .subscribe((data: UsuariosRes[]) => {
          this.usuarios = data;
          this.usuariosFiltrados.next(this.usuarios.slice());
        });
    }
  }
  protected setInitialValueClientes() {
    this.clientesFiltrados
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredBanks are loaded initially
        // and after the mat-option elements are available
        this.singleSelectClientes.compareWith = (
          a: ClientesRes,
          b: ClientesRes
        ) => a && b && a.id === b.id;
      });
  }
  protected setInitialValueUsuarios() {
    this.usuariosFiltrados
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredBanks are loaded initially
        // and after the mat-option elements are available
        this.singleSelectUsuarios.compareWith = (a: UsuariosRes, b: UsuariosRes) => a && b && a.id === b.id;
      });
  }
  onAdd(): void {
    const servicio: ExternosRes = this.form.value;


    if (this.isCreateMode()) {
      this.mainService
        .requestOne(
          { _function: 'fnCreateExterno', data: servicio },
          this.model
        )
        .subscribe((data: any) => {

          if (!data.error) {
            this.dialogRef.close(servicio);
          } else {
            this.snackbar.open('Error al registrar el servicio.', 'Aceptar', {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }
        });
    } else {
      servicio.id = this.data.id;
      this.mainService
        .requestOne(
          { _function: 'fnUpdateExterno', data: servicio },
          this.model
        )
        .subscribe((data: any) => {
          if (!data.error) {
            this.dialogRef.close(servicio);
          } else {
            this.snackbar.open('Error al actualizar el servicio.', 'Aceptar', {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
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
  avisar() {
    let telefono = this.clientesControl.value.telefono;
    let fecha = moment(new Date(this.form.value.cita)).format(
      'dddd DD [de] MMMM [a las] h:mm a'
    );

    this.form.controls['avisado'].setValue('1');
    let mensaje =
      'Buen día, estimado cliente. Centro de Servicio Don Pedro le informa hemos recibido su reporte reralizado a ' +
      this.form.value.marca +
      '. La fecha y hora asignadas para la visita del técnico es ' +
      fecha +
      '. En caso de tener inconvenientes con la fecha y hora asignadas, favor mencionarlos en este mismo chat.';
    window.open(
      'https://web.whatsapp.com/send?phone=521' + telefono + '&text=' + mensaje,
      '_blank'
    );
  }
}
