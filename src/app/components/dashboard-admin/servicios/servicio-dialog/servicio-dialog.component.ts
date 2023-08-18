import { MarcasRes } from './../../../../interfaces/marcas';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelect } from '@angular/material/select';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _moment from 'moment';
import 'moment/locale/es';
import { Convert } from 'src/app/interfaces/login';
import { ServiciosRes } from '../../../../interfaces/servicios';
import { UsuariosRes } from '../../../../interfaces/usuarios';
import { ClientesRes } from '../../../../interfaces/clientes';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MainService } from 'src/app/services/main.service';

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
    {provide: MAT_DATE_LOCALE, useValue: 'es-ES'},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],

})
export class ServicioDialogComponent implements OnInit {
  model = "Servicios";
  form!: FormGroup;
  mode!: Number;
  title!: String;
  usuarios!: UsuariosRes[];
  clientes!: ClientesRes[];
  marcas!: MarcasRes[];
  minDateTerminado!: Date;
  minDateEntregado!: Date;
  estatus = [{
    value: 'POR AUTORIZAR'
  },{
    value: 'PENDIENTE'
  },{
    value: 'TERMINADO'
  },{
    value: 'NO AUTORIZADO'
  },{
    value: 'ENTREGADO'
  },];
  tipos = [
    {
      value: 'GAS LP'
    },{
      value: 'BOMBEO'
    },{
      value: 'GASOLINA'
    },{
      value: 'HERRAMIENTA ELECTRICA'
    },{
      value: 'CLIMA'
    },{
      value: 'OTRO'
    },
  ]

  public usuariosFiltro: FormControl = new FormControl();
  public usuariosControl: FormControl = new FormControl();
  public usuariosFiltrados: ReplaySubject<UsuariosRes[]> = new ReplaySubject<UsuariosRes[]>(1);


  public clientesFiltro: FormControl = new FormControl();
  public clientesControl: FormControl = new FormControl();
  public clientesFiltrados: ReplaySubject<ClientesRes[]> = new ReplaySubject<ClientesRes[]>(1);
  protected _onDestroy = new Subject<void>();


  @ViewChild('singleSelectUsuarios') singleSelectUsuarios!: MatSelect;
  @ViewChild('singleSelectClientes') singleSelectClientes!: MatSelect;
  profile = sessionStorage.getItem('profile');


  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<ServicioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ServiciosRes,
    private mainService: MainService,
    private snackbar: MatSnackBar,
    ) {
      let user = Convert.toLoginRes(this.profile ?? '');


      if (this.data) {
        this.mode = 1;
        this.title = 'Actualizar';
        this.form = this.fb.group({
          id_cliente: [this.data.id_cliente, Validators.required],
          id_usuario: [this.data.id_usuario, Validators.required],
          fecha_ingreso: [this.data.fecha_ingreso],
          producto: [this.data.producto,Validators.required],
          id_marca: [this.data.id_marca,Validators.required],
          modelo: [this.data.modelo, Validators.required],
          tipo: [this.data.tipo, Validators.required],
          serie: [this.data.serie, Validators.required],
          falla_detectada: [this.data.falla_detectada, Validators.required],
          cotizacion: [this.data.cotizacion],
          garantia: [this.data.garantia, Validators.required],
          fecha_terminado: [this.data.fecha_terminado],
          fecha_entrega: [this.data.fecha_entrega],
          importe: [this.data.importe],
          estatus: [this.data.estatus, Validators.required],
          observaciones: [this.data.observaciones],
          avisado: [this.data.avisado],
          id_modificado:  [user.id]

        });
      } else {
        this.mode = 0;
        this.title = 'Nuevo';
        this.form = this.fb.group({
        fecha_ingreso: [new Date().toISOString().slice(0, 10)],
          id_cliente: ['', Validators.required],
          id_usuario: ['', Validators.required],
          producto: ['', Validators.required],
          id_marca: ['',Validators.required],
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
          id_modificado:  [user.id]
      });

  }
}
ngOnInit(): void {
  this.getMenus();
  this.usuariosControl.valueChanges.subscribe((data)=>{
    this.form.controls['id_usuario'].setValue(data.id);
  });
  this.clientesControl.valueChanges.subscribe((data)=>{
    this.form.controls['id_cliente'].setValue(data.id);
  });
  this.usuariosFiltro.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(()=> {

    this.filtrarUsuarios();
  });
  this.clientesFiltro.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(()=> {
    this.filtrarClientes();
  });
  this.minDateTerminado = this.form.controls['fecha_ingreso'].value;
  this.form.controls['fecha_ingreso'].valueChanges.subscribe((data)=>{
    this.minDateTerminado = data;
  });
  this.minDateEntregado = this.form.controls['fecha_terminado'].value;

  this.form.controls['fecha_terminado'].valueChanges.subscribe((data)=>{
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
    this.setInitialValueUsuarios();
  }
  onAdd(): void {

    const servicio: ServiciosRes = this.form.value;
    if (this.isCreateMode()) {
      this.mainService.requestOne({ _function: "fnCreateServicio", data: servicio }, this.model).subscribe
      ((data: any)=> {

        if (!data.error) {

          this.dialogRef.close(servicio);

        } else {
          this.snackbar.open('Error al registrar el servicio.', 'Aceptar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    } else {
      servicio.id = this.data.id;
      this.mainService.requestOne({ _function: "fnUpdateServicio", data: servicio }, this.model).subscribe
      ((data: any)=> {
        if (!data.error) {
          this.dialogRef.close(servicio);

        } else {

          this.snackbar.open('Error al actualizar el servicio.', 'Aceptar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });

        }
      });
    }

  }
  getMenus(){
      this.mainService.requestMany({ _function: "fnGetMarcas" }, this.model).subscribe((data: MarcasRes[]) => {
        this.marcas = data;

      });
      if (this.isUpdateMode()) {
        this.mainService.requestMany({ _function: "fnGetClientes" }, "Clientes").subscribe((data: ClientesRes[]) => {
          this.clientes = data;
          this.clientesFiltrados.next(this.clientes.slice());
        let filtro = data.filter(cliente => cliente.id == this.data.id_cliente);
        this.clientesControl.setValue(filtro[0]);
    });
    this.mainService.requestMany({ _function: "fnGetUsuarios" }, "Usuarios").subscribe((data: UsuariosRes[]) => {
      this.usuarios = data;
      this.usuariosFiltrados.next(this.usuarios.slice());
      let filtro = data.filter(usuario => usuario.id == this.data.id_usuario);
      this.usuariosControl.setValue(filtro[0]);
    });

    } else {
      this.mainService.requestMany({ _function: "fnGetClientes" }, "Clientes").subscribe((data: ClientesRes[]) => {
      this.clientes = data;
      this.clientesFiltrados.next(this.clientes.slice());
    });
    this.mainService.requestMany({ _function: "fnGetUsuarios" }, "Usuarios").subscribe((data: UsuariosRes[]) => {
      this.usuarios = data;
      this.usuariosFiltrados.next(this.usuarios.slice());

    });
      }

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
  protected setInitialValueClientes() {
    this.clientesFiltrados
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredBanks are loaded initially
        // and after the mat-option elements are available
        this.singleSelectClientes.compareWith = (a: ClientesRes, b: ClientesRes) => a && b && a.id === b.id;
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
      this.clientes.filter(cliente => {
        let filtrado = cliente.nombre + ' ' + cliente.apellido + ' ' + cliente.telefono;
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
  efectividadDias(start: Date, end: Date){
    var eventStartTime = new Date(start);
    var eventEndTime = new Date(end);
    var duration =  eventEndTime.getDate() - eventStartTime.getDate();
    return duration;
  }
  avisar(){
    let telefono = this.clientesControl.value.telefono;
    this.form.controls['avisado'].setValue('2');
    let mensaje = 'Buen día, estimado cliente. Centro de Servicio Don Pedro le informa que su ' + this.data.producto + ' esta listo para la entrega. Favor presentarse con su talón de entrega de equipo. Número de Folio: ' + this.data.id + ' Importe Total: $' + this.form.value.importe + '. ' + this.form.value.observaciones ?? '';
    window.open("https://web.whatsapp.com/send?phone=521" + telefono + "&text=" + mensaje, "_blank");
  }

  autorizar(){
    let telefono = this.clientesControl.value.telefono;
    this.form.controls['avisado'].setValue('1');
    let mensaje = 'Buen día, estimado cliente. Centro de Servicio Don Pedro le informa que la revisión de su ' + this.data.producto + ' fue realizada. El cobro total definido es de $' + this.form.value.importe + '. Número de Folio: ' + this.data.id + ' ¿Desea autorizar el servicio?' + ' ' + this.form.value.observaciones ?? '';
    window.open("https://web.whatsapp.com/send?phone=521" + telefono + "&text=" + mensaje, "_blank");

  }
  marcarTerminado(){
    const now = new Date();
    this.form.controls['estatus'].setValue('TERMINADO');
    this.form.controls['fecha_terminado'].setValue(now);
    this.onAdd();
  }
  marcarEntregado(){
    const now = new Date();
    this.form.controls['estatus'].setValue('ENTREGADO');
    this.form.controls['fecha_entrega'].setValue(now);
    this.onAdd();
  }
}


