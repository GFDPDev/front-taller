import { MarcasRes } from './../../../../interfaces/marcas';
import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
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

import 'moment/locale/es';
import { ClientesRes } from '../../../../interfaces/clientes';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MainService } from 'src/app/services/main.service';
import { User, Convert } from 'src/app/interfaces/user';
import { ToolService } from 'src/app/interfaces/toolservice';
import { Res } from 'src/app/interfaces/response';
import moment from 'moment';

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
    selector: 'app-servicio-dialog',
    templateUrl: './servicio-dialog.component.html',
    styleUrls: ['./servicio-dialog.component.scss'],
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
export class ServicioDialogComponent implements OnInit, AfterViewInit {
  private route = '/service';
  form!: FormGroup;
  mode!: Number;
  title!: String;
  usuarios!: User[];
  clientes!: ClientesRes[];
  marcas!: MarcasRes[];
  minDateTerminado!: Date;
  minDateEntregado!: Date;
  user!: User;
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
      value: 'NO AUTORIZADO',
    },
    {
      value: 'ENTREGADO',
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

  public usuariosFiltro: FormControl = new FormControl();
  public usuariosControl: FormControl = new FormControl();
  public usuariosFiltrados: ReplaySubject<User[]> = new ReplaySubject<User[]>(
    1
  );
  public isLoading: boolean = true;
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
    public dialogRef: MatDialogRef<ServicioDialogComponent>,
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
        id_cliente: [this.data.id_cliente, Validators.required],
        id_usuario: [this.data.id_usuario, Validators.required],
        fecha_ingreso: [{ value: this.data.fecha_ingreso, disabled: true }],
        producto: [this.data.producto, Validators.required],
        id_marca: [this.data.id_marca, Validators.required],
        modelo: [this.data.modelo, Validators.required],
        tipo: [this.data.tipo, Validators.required],
        serie: [this.data.serie, Validators.required],
        falla_detectada: [this.data.falla_detectada, Validators.required],
        cotizacion: [this.data.cotizacion],
        garantia: [this.data.garantia.toString(), Validators.required],
        fecha_terminado: [this.data.fecha_terminado],
        fecha_entrega: [this.data.fecha_entrega],
        importe: [this.data.importe],
        estatus: [this.data.estatus, Validators.required],
        observaciones: [this.data.observaciones],
        avisado: [this.data.avisado],
        impreso: [this.data.impreso],
        id_modificado: [this.user.id],
      });
    } else {
      this.mode = 0;
      this.title = 'Nuevo';
      this.form = this.fb.group({
        id_cliente: ['', Validators.required],
        id_usuario: ['', Validators.required],
        fecha_ingreso: [
          { value: moment().format('YYYY-MM-DD HH:mm:ss'), disabled: true },
        ],
        producto: ['', Validators.required],
        id_marca: ['', Validators.required],
        modelo: ['', Validators.required],
        tipo: ['', Validators.required],
        serie: ['', Validators.required],
        falla_detectada: ['', Validators.required],
        garantia: ['', Validators.required],
        cotizacion: [null],
        fecha_terminado: [null],
        fecha_entrega: [null],
        importe: [null],
        estatus: [this.estatus[0].value, Validators.required],
        observaciones: [' '],
        id_modificado: [this.user.id],
      });
    }
  }
  ngOnInit(): void {
    this.getMenus();
    this.usuariosControl.valueChanges.subscribe((data) => {
      this.form.controls['id_usuario'].setValue(data.id);
    });
    this.clientesControl.valueChanges.subscribe((data) => {
      this.form.controls['id_cliente'].setValue(data.id);
    });
    this.usuariosFiltro.valueChanges
      .pipe(
        takeUntil(this._onDestroy),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.filtrarUsuarios();
      });
    this.clientesFiltro.valueChanges
      .pipe(
        takeUntil(this._onDestroy),
        debounceTime(300),
        distinctUntilChanged()
      )
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
    if (this.singleSelectClientes) {
      this.setInitialValueClientes();
    }
    if (this.singleSelectUsuarios) {
      this.setInitialValueUsuarios();
    }
  }
  onAdd(): void {
    const servicio = this.form.getRawValue();
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
    // Carga inicial optimizada
    Promise.resolve().then(() => {
      this.mainService.getRequest({}, `/brand`).subscribe((res: Res) => {
        this.marcas = res.data;
      });

      if (this.isUpdateMode()) {
        this.mainService
          .getRequest({}, `/client/get_active_clients`)
          .subscribe((res: Res) => {
            this.clientes = res.data;
            // Inicialmente mostramos solo los primeros 30 resultados
            this.clientesFiltrados.next(this.clientes.slice(0, 30));
            
            // Si estamos en modo actualización, buscamos el cliente específico
            let filtro = res.data.filter(
              (cliente: ClientesRes) => cliente.id == this.data.id_cliente
            );
            if (filtro.length > 0) {
              this.clientesControl.setValue(filtro[0]);
            }
            this.filtrarClientes();
            this.isLoading = false;
          });

        this.mainService
          .getRequest({}, `/user/get_active_users`)
          .subscribe((res: Res) => {
            this.usuarios = res.data;
            // Inicialmente mostramos solo los primeros 30 resultados
            this.usuariosFiltrados.next(this.usuarios.slice(0, 30));
            
            // Si estamos en modo actualización, buscamos el usuario específico
            let filtro = res.data.filter(
              (usuario: User) => usuario.id == this.data.id_usuario
            );
            if (filtro.length > 0) {
              this.usuariosControl.setValue(filtro[0]);
            }
          });
      } else {
        this.mainService
          .getRequest({}, `/client/get_active_clients`)
          .subscribe((res: Res) => {
            this.clientes = res.data;
            // Inicialmente mostramos solo los primeros 30 resultados
            this.clientesFiltrados.next(this.clientes.slice(0, 30));
            this.isLoading = false;
          });

        this.mainService
          .getRequest({}, `/user/get_active_users`)
          .subscribe((res: Res) => {
            this.usuarios = res.data;
            // Inicialmente mostramos solo los primeros 30 resultados
            this.usuariosFiltrados.next(this.usuarios.slice(0, 30));
          });
      }
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
  onDateChange(event: any, controlName: string) {
    const selectedDate = event.value;

    if (selectedDate) {
      // Formatear la fecha seleccionada al formato "YYYY-MM-DD"
      const formattedDate = selectedDate.format('YYYY-MM-DD');

      // Actualizar el valor del FormControl con la fecha formateada
      this.form.controls[controlName].setValue(formattedDate);
    }
  }
  protected filtrarUsuarios() {
    if (!this.usuarios) {
      return;
    }

    let filteredUsers = [...this.usuarios];
    const selectedUser = this.usuariosControl.value;
    
    // Aplicar filtro de búsqueda si existe
    let search = this.usuariosFiltro.value;
    if (search) {
      search = search.toLowerCase();
      const searchTerms = search.split(' ').filter((term: string) => term.length > 0);
      filteredUsers = this.usuarios.filter((usuario) => {
        const searchString = (usuario.nombre + ' ' + usuario.apellido + ' ' + usuario.curp).toLowerCase();
        return searchTerms.every((term: string) => searchString.includes(term));
      });
    }

    // Asegurar que el usuario seleccionado esté siempre en la lista
    if (selectedUser && !filteredUsers.some(u => u.id === selectedUser.id)) {
      filteredUsers = [selectedUser, ...filteredUsers];
    }

    // Limitar resultados pero asegurando que el seleccionado esté incluido
    if (filteredUsers.length > 30 && !search) {
      const firstItems = filteredUsers.slice(0, 29);
      if (selectedUser && !firstItems.some(u => u.id === selectedUser.id)) {
        filteredUsers = [selectedUser, ...firstItems];
      } else {
        filteredUsers = firstItems;
      }
    }

    this.usuariosFiltrados.next(filteredUsers);
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
      const searchTerms = search.split(' ').filter((term: string) => term.length > 0);
      filteredClients = this.clientes.filter((cliente) => {
        const searchString = (cliente.nombre + ' ' + cliente.apellido + ' ' + cliente.telefono).toLowerCase();
        return searchTerms.every((term: string) => searchString.includes(term));
      });
    }

    // Asegurar que el cliente seleccionado esté siempre en la lista
    if (selectedClient && !filteredClients.some(c => c.id === selectedClient.id)) {
      filteredClients = [selectedClient, ...filteredClients];
    }

    // Limitar resultados pero asegurando que el seleccionado esté incluido
    if (filteredClients.length > 30 && !search) {
      const firstItems = filteredClients.slice(0, 29);
      if (selectedClient && !firstItems.some(c => c.id === selectedClient.id)) {
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
  avisar() {
    let telefono = this.clientesControl.value.telefono;
    this.form.controls['avisado'].setValue('2');
    let mensaje =
      'Buen día, estimado cliente. Centro de Servicio Don Pedro le informa que su ' +
      this.data.producto +
      ' esta listo para la entrega. Favor presentarse con su talón de entrega de equipo. Número de Folio: ' +
      this.data.id +
      ' Importe Total: $' +
      this.form.value.importe +
      '. ' +
      this.form.value.observaciones;
    window.open(
      'https://web.whatsapp.com/send?phone=521' + telefono + '&text=' + mensaje,
      '_blank'
    );
  }

  autorizar() {
    let telefono = this.clientesControl.value.telefono;
    this.form.controls['avisado'].setValue('1');
    let mensaje = `--- *ESTE ES UN MENSAJE DE AUTORIZACIÓN* ---

Buen día, estimado cliente. Centro de Servicio Don Pedro le informa que la revisión de su *${this.data.producto} ${this.data.marca} ${this.data.modelo}* fue realizada. 

El cobro total definido es de *$${this.form.value.importe}*.
Número de Folio: ${this.data.id}

¿Desea autorizar el servicio?
${this.form.value.observaciones}

*Aviso IMPORTANTE:* 
En caso de no autorizar la reparación, dispone de 3 meses para la recolección del equipo. 
Pasado este plazo, y por motivos de optimización de espacio, el equipo será considerado como merma y será dispuesto para su destrucción.`;
    window.open(
      'https://web.whatsapp.com/send?phone=521' + telefono + '&text=' + mensaje,
      '_blank'
    );
  }
  marcarTerminado() {
    let telefono = this.clientesControl.value.telefono;
    let mensaje =
      '--- *SERVICIO TERMINADO* --- \nBuen día, estimado cliente. Centro de Servicio Don Pedro le informa que su ' +
      this.data.producto +
      ' esta *listo para la entrega.* Favor presentarse con su talón de entrega de equipo. Número de Folio: ' +
      this.data.id +
      ' Importe Total: $' +
      this.form.value.importe +
      '. ' +
      this.form.value.observaciones;
    const now = moment();

    this.form.controls['fecha_terminado'].setValue(now.format('YYYY-MM-DD'));
    this.form.controls['estatus'].setValue('TERMINADO');

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
}
