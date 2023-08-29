import { MarcasRes } from './../../../../interfaces/marcas';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelect } from '@angular/material/select';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment } from 'moment';
import 'moment/locale/es';
import { User } from 'src/app/interfaces/user';
import { ClientesRes } from 'src/app/interfaces/clientes';
import { ReplaySubject, Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { ServiciosRes } from 'src/app/interfaces/servicios';
import { Convert } from 'src/app/interfaces/login';
import { MainService } from 'src/app/services/main.service';
import { ToolService } from 'src/app/interfaces/toolservice';


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
    {provide: MAT_DATE_LOCALE, useValue: 'es-ES'},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],

})
export class TecnicoDialogComponent implements OnInit {
  model = "Servicios";
  form!: UntypedFormGroup;
  mode!: Number;
  title!: String;
  usuarios!: User[];
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
    value: 'ENTREGADO'
  },{
    value: 'NO AUTORIZADO'
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
  public usuariosFiltro: UntypedFormControl = new UntypedFormControl();
  public usuariosControl: UntypedFormControl = new UntypedFormControl();
  public usuariosFiltrados: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);


  public clientesFiltro: UntypedFormControl = new UntypedFormControl();
  public clientesControl: UntypedFormControl = new UntypedFormControl();
  public clientesFiltrados: ReplaySubject<ClientesRes[]> = new ReplaySubject<ClientesRes[]>(1);
  protected _onDestroy = new Subject<void>();

  profile = sessionStorage.getItem('profile');


  @ViewChild('singleSelectUsuarios') singleSelectUsuarios!: MatSelect;
  @ViewChild('singleSelectClientes') singleSelectClientes!: MatSelect;

  constructor(private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<TecnicoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ToolService,
    private mainService: MainService,
    private snackbar: MatSnackBar,) {
      let user = Convert.toLoginRes(this.profile ?? '');
      if (this.data) {
        this.mode = 1;
        this.title = 'Actualizar';
        this.form = this.fb.group({
        fecha_ingreso: [{ value: this.data.fecha_ingreso, disabled: true }],
          id_cliente: [{ value: this.data.id_cliente, disabled: true }, Validators.required],
          producto: [this.data.producto,Validators.required],
          id_marca: [this.data.id_marca,Validators.required],
          modelo: [this.data.modelo, Validators.required],
          tipo: [this.data.tipo, Validators.required],
          serie: [this.data.serie, Validators.required],
          garantia: [this.data.garantia, Validators.required],
          falla_detectada: [this.data.falla_detectada, Validators.required],
          id_usuario: [{value: this.data.id_usuario, disabled: true}, Validators.required],
          cotizacion: [this.data.cotizacion],
          fecha_terminado: [{value: this.data.fecha_terminado, disabled: true}],
          fecha_entrega: [{value: this.data.fecha_entrega, disabled: true}],
          importe: [this.data.importe],
          estatus: [{value: this.data.estatus, disabled: true} , Validators.required],
          observaciones: [this.data.observaciones],
          avisado: [this.data.avisado],
          id_modificado:  [user.id]

        });
      } else {
        this.mode = 0;
        this.title = 'Nuevo';
        this.form = this.fb.group({
        fecha_ingreso: [ {value: null, disabled: true }],
          id_cliente: ['', Validators.required],
          producto: ['', Validators.required],
          id_marca: ['',Validators.required],
          modelo: ['', Validators.required],
          tipo: ['', Validators.required],
          serie: ['', Validators.required],
          garantia: ['', Validators.required],
          falla_detectada: ['', Validators.required],
          id_usuario: ['3', Validators.required], // 3 es el ID del usuario SIN ENCARGADO
          cotizacion: [null],
          fecha_terminado: [ {value: null, disabled: true }],
          fecha_entrega: [ {value: null, disabled: true }],
          importe: [null],
          estatus: [{value: this.estatus[0].value, disabled: true}, Validators.required],
          observaciones: [' '],
          id_modificado:  [user.id]
      });


  }
    }

  ngOnInit(): void {
    this.getMenus();
    this.clientesControl.valueChanges.subscribe((data)=>{
      this.form.controls['id_cliente'].setValue(data.id);
    });
    this.usuariosControl.valueChanges.subscribe((data)=>{
      this.form.controls['id_usuario'].setValue(data.id);
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

    const servicio: ToolService = this.form.getRawValue();
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
      let user = Convert.toLoginRes(this.profile ?? '');
      this.mainService.requestMany({ _function: "fnGetMarcas" }, this.model).subscribe((data: MarcasRes[]) => {
        this.marcas = data;

      });
      if (this.isUpdateMode()) {
        this.mainService.requestOne({ _function: "fnGetClientes" }, "Clientes").subscribe((data: ClientesRes[]) => {
          this.clientes = data;
          this.clientesFiltrados.next(this.clientes.slice());
        let filtro = data.filter(cliente => cliente.id == this.data.id_cliente);
        this.clientesControl.setValue(filtro[0]);
    });
    this.mainService.requestOne({ _function: "fnGetUsuariosTecnico", id: user.id }, "Usuarios").subscribe((data: User[]) => {
      this.usuarios = data;
      this.usuariosFiltrados.next(this.usuarios.slice());
      let filtro = data.filter(usuario => usuario.id == this.data.id_usuario);
      this.usuariosControl.setValue(filtro[0]);
    });

    } else {
      this.mainService.requestOne({ _function: "fnGetClientes" }, "Clientes").subscribe((data: ClientesRes[]) => {
      this.clientes = data;
      this.clientesFiltrados.next(this.clientes.slice());
    });
    this.mainService.requestOne({ _function: "fnGetUsuariosTecnico", id: user.id }, "Usuarios").subscribe((data: User[]) => {
      this.usuarios = data;
      this.usuariosFiltrados.next(this.usuarios.slice());
      let filtro = data.filter(usuario => usuario.id.toString() == '3');
      this.usuariosControl.setValue(filtro[0]);

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
        this.singleSelectUsuarios.compareWith = (a: User, b: User) => a && b && a.id === b.id;
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
      this.usuarios.filter(usuario => usuario.curp.toLowerCase().indexOf(search) > -1)
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
  marcarPendiente(){
    this.form.controls['estatus'].setValue('PENDIENTE');
    this.onAdd();
  }
}
