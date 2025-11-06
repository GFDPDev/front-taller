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
import { MAT_DATE_LOCALE } from '@angular/material/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import { forkJoin} from 'rxjs';
import { tap } from 'rxjs/operators';
import 'moment/locale/es';
import { ClientesRes } from '../../../../interfaces/clientes';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MainService } from 'src/app/services/main.service';
import { ExternosRes } from 'src/app/interfaces/externos';
import moment from 'moment';
import { User } from 'src/app/interfaces/user';
import { Res } from 'src/app/interfaces/response';
import { DataService } from 'src/app/services/data.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
    selector: 'app-externos-dialog',
    templateUrl: './externos-dialog.component.html',
    styleUrls: ['./externos-dialog.component.scss'],
    providers: [
        provideNativeDateAdapter(),
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
    ],
    standalone: false
})
export class ExternosDialogComponent implements OnInit {
  private route = '/external';
  public isLoading: boolean = true;
  form!: FormGroup;
  mode!: Number;
  title!: String;
  maxDate: Date = new Date();
  minDate: Date = new Date();
  clientes!: ClientesRes[];
  usuarios!: User[];
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
  public usuariosFiltrados: ReplaySubject<User[]> = new ReplaySubject<User[]>(
    1
  );

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
    private dataService: DataService,
    public dialogRef: MatDialogRef<ExternosDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExternosRes,
    private mainService: MainService,
    private snackbar: MatSnackBar
  ) {
    // Configurar fechas mínimas y máximas
    const now = moment().format("YYYY-MM-DD h:mm:ss");

    if (this.data) {
      this.mode = 1;
      this.title = 'Actualizar';

      this.form = this.fb.group({
        id: [this.data.id, Validators.required],
        fecha_registro: [this.data.fecha_registro],
        folio: [this.data.folio, Validators.required],
        garantia: [this.data.garantia.toString(), Validators.required],
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
        cotizacion: [''],
        cita: [now],
        importe: [0, Validators.required],
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

      // Sincronizar los valores de fecha y hora
    if (this.form.get('cita')) {
      this.form.get('cita')!.valueChanges.subscribe(value => {
        if (value instanceof Date) {
          console.log(value)
          const hours = value.getHours();
          const minutes = value.getMinutes();
          const date = new Date(value);
          date.setHours(hours);
          date.setMinutes(minutes);
          const formattedDate = moment(date).format('YYYY-MM-DDTHH:mm:ssZ');
          this.form.patchValue({ cita: formattedDate }, { emitEvent: false });
        }
      });
    }
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
      this.usuarios.filter((usuario) => {
        let filtrado =
          usuario.nombre + ' ' + usuario.apellido + ' ' + usuario.curp;
        return filtrado.toLowerCase().indexOf(search) > -1;
      })
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
    if (this.singleSelectClientes) {
      this.setInitialValueClientes();
    }
    if (this.singleSelectUsuarios) {
      this.setInitialValueUsuarios();
    }
  }
  getMenus() {
    // 1. Define las dos peticiones HTTP como observables
    const clientes$ = this.dataService.getActiveClients()
      .pipe(
        // Uso de tap para procesar los datos de clientes apenas llegan
        // Esto mantiene el código de procesamiento fuera de la suscripción final
        tap((res: Res) => {
          this.clientes = res.data;
          this.clientesFiltrados.next(this.clientes.slice());
          
          // El procesamiento específico de updateMode se manejará en la suscripción final.
        })
      );

    const usuarios$ = this.mainService
      .getRequest({}, `/user/get_active_users`)
      .pipe(
        // Uso de tap para procesar los datos de usuarios
        tap((res: Res) => {
          this.usuarios = res.data;
          this.usuariosFiltrados.next(this.usuarios.slice());

          // El procesamiento específico de updateMode se manejará en la suscripción final.
        })
      );
    
    // 2. Ejecuta ambas peticiones en paralelo
    forkJoin({
      clientesRes: clientes$,
      usuariosRes: usuarios$,
    }).subscribe({
      next: ({ clientesRes, usuariosRes }) => {
        // Este bloque se ejecuta una vez que ambas peticiones han retornado con éxito.
        
        // Si estamos en modo de actualización, se realiza la lógica de filtrado y asignación
        if (this.isUpdateMode()) {
          
          // Lógica para Clientes
          let filtroClientes = clientesRes.data.filter(
            (cliente: ClientesRes) => cliente.id == this.data.id_cliente
          );
          this.clientesControl.setValue(filtroClientes[0]);

          // Lógica para Usuarios
          let filtroUsuarios = usuariosRes.data.filter(
            (usuario: User) => usuario.id == this.data.id_usuario
          );
          this.usuariosControl.setValue(filtroUsuarios[0]);
        }
      },
      error: (err) => {
        console.error('Error al cargar menús:', err);
        // Opcional: Manejar errores aquí
      },
      complete: () => {
        // Este bloque se ejecuta al final, después de procesar todo
        this.isLoading = false;
      }
    });
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
  protected setInitialValueUsuarios() {
    this.usuariosFiltrados
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.singleSelectUsuarios.compareWith = (a: User, b: User) =>
          a && b && a.id === b.id;
      });
  }
  onAdd(): void {
    const servicio = this.form.value;
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
  isCreateMode() {
    return this.mode === 0;
  }

  isUpdateMode() {
    return this.mode === 1;
  }

  avisar() {
    let telefono = this.clientesControl.value.telefono;
    let fecha = moment(this.form.value.cita).locale('es').format(
      'dddd DD [de] MMMM [a las] h:mm a'
    );

    this.form.controls['avisado'].setValue('1');
    let mensaje = `Buen día, estimado cliente. Centro de Servicio Don Pedro le informa hemos recibido su reporte realizado a ${this.form.value.marca}.
La fecha y hora asignadas para la visita del técnico es ${fecha}.
En caso de tener inconvenientes con la fecha y hora asignadas, favor mencionarlos en este mismo chat.`;

    window.open(
      'https://web.whatsapp.com/send?phone=521' + telefono + '&text=' + mensaje,
      '_blank'
    );
  }
}
