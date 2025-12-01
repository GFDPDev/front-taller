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

// tslint:disable-next-line:no-duplicate-imports
import { Moment } from 'moment';
import 'moment/locale/es';
import { Convert, User } from 'src/app/interfaces/user';
import { ClientesRes } from 'src/app/interfaces/clientes';
import { forkJoin, ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';
import { MainService } from 'src/app/services/main.service';
import { ToolService } from 'src/app/interfaces/toolservice';
import { Res } from 'src/app/interfaces/response';
import moment from 'moment';
import { ajax } from 'rxjs/ajax';
import { DataService } from 'src/app/services/data.service';

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
    standalone: false
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
    private dataService: DataService,
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
      ? moment(servicio.fecha_terminado).format('YYYY-MM-DD')
      : null;
    servicio.fecha_entrega = servicio.fecha_entrega
      ? moment(servicio.fecha_entrega).format('YYYY-MM-DD')
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
    const brands$ =this.dataService.getBrands();
    
    // 1. Define las dos peticiones HTTP como observables
    const clientes$ = this.dataService.getActiveClients().pipe(
      // Uso de tap para procesar los datos de clientes apenas llegan
      // Esto mantiene el código de procesamiento fuera de la suscripción final
      tap((res: Res) => {
        this.clientes = res.data;
        this.clientesFiltrados.next(this.clientes.slice(0, 30));

        // El procesamiento específico de updateMode se manejará en la suscripción final.
      })
    );

    const usuarios$ = this.mainService.getRequest({ id: this.user.id }, `/user/get_tech_users`)

  
    // 2. Ejecuta ambas peticiones en paralelo
    forkJoin({
      clientesRes: clientes$,
      usuariosRes: usuarios$,
      brandRes: brands$
    }).subscribe({
      next: ({ clientesRes, usuariosRes, brandRes }) => {
        // Este bloque se ejecuta una vez que ambas peticiones han retornado con éxito.
        this.marcas = brandRes.data;
        this.usuarios = usuariosRes.data;
        // Si estamos en modo de actualización, se realiza la lógica de filtrado y asignación
        if (this.isUpdateMode()) {
          // Lógica para Clientes
          let filtroClientes = clientesRes.data.filter(
            (cliente: ClientesRes) => cliente.id == this.data.id_cliente
          );
          if (filtroClientes.length > 0) {
            this.clientesControl.setValue(filtroClientes[0]);
          }
          this.filtrarClientes();
        }
      },
      error: (err) => {
        console.error('Error al cargar menús:', err);
        // Opcional: Manejar errores aquí
      },
      complete: () => {
        // Este bloque se ejecuta al final, después de procesar todo
        this.isLoading = false;
      },
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
  protected filtrarClientes() {
    if (!this.clientes) {
      return;
    }

    let filteredClients = [...this.clientes];
    const selectedClient = this.clientesControl.value;

    // Aplicar filtro de búsqueda si existe
    let search = this.clientesFiltro.value;
    if (search) {
      search = search.toLowerCase();
      const searchTerms = search
        .split(' ')
        .filter((term: string) => term.length > 0);
      filteredClients = this.clientes.filter((cliente) => {
        const searchString = (
          cliente.nombre +
          ' ' +
          cliente.apellido +
          ' ' +
          cliente.telefono
        ).toLowerCase();
        return searchTerms.every((term: string) => searchString.includes(term));
      });
    }

    // Asegurar que el cliente seleccionado esté siempre en la lista
    if (
      selectedClient &&
      !filteredClients.some((c) => c.id === selectedClient.id)
    ) {
      filteredClients = [selectedClient, ...filteredClients];
    }

    // Limitar resultados pero asegurando que el seleccionado esté incluido
    if (filteredClients.length > 30 && !search) {
      const firstItems = filteredClients.slice(0, 29);
      if (
        selectedClient &&
        !firstItems.some((c) => c.id === selectedClient.id)
      ) {
        filteredClients = [selectedClient, ...firstItems];
      } else {
        filteredClients = firstItems;
      }
    }

    this.clientesFiltrados.next(filteredClients);
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
    const now = moment();
    this.form.controls['estatus'].setValue('TERMINADO');
    this.form.controls['fecha_terminado'].setValue(now.format('YYYY-MM-DD'));
    this.onAdd();
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
