import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelect } from '@angular/material/select';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment} from 'moment';
import 'moment/locale/es';

import { User, Convert } from 'src/app/interfaces/user';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MainService } from 'src/app/services/main.service';
import { Res } from 'src/app/interfaces/response';
import { ExpressRes } from 'src/app/interfaces/express';
import { ToolService } from 'src/app/interfaces/toolservice';
import * as moment from 'moment';

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
  selector: 'app-express-dialog',
  templateUrl: './express-dialog.component.html',
  styleUrls: ['./express-dialog.component.scss'],
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
export class ExpressDialogComponent implements OnInit {
  private route = '/express'
  form!: UntypedFormGroup;
  mode!: Number;
  title!: String;
  usuarios!: User[];
  user!: User;

  public usuariosFiltro: UntypedFormControl = new UntypedFormControl();
  public usuariosControl: UntypedFormControl = new UntypedFormControl();
  public usuariosFiltrados: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
  protected _onDestroy = new Subject<void>();


  @ViewChild('singleSelectUsuarios') singleSelectUsuarios!: MatSelect;

  constructor(private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<ExpressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExpressRes,
    private mainService: MainService,
    private snackbar: MatSnackBar,) {
      this.user = Convert.toUser(sessionStorage.getItem('user_taller')??'');


      if (this.data) {
        this.mode = 1;
        this.title = 'Actualizar';
        this.form = this.fb.group({
            id: [this.data.id, Validators.required],
            herramienta: [this.data.herramienta,Validators.required],
            falla: [this.data.falla, Validators.required],
            id_usuario: [{value: this.data.id_usuario, disabled: true}, Validators.required],
            cotizacion: [this.data.cotizacion],
            importe: [this.data.importe],

          });
      } else {
        this.mode = 0;
        this.title = 'Nuevo';
        this.form = this.fb.group({
            herramienta: ['', Validators.required],
            fecha: [moment().format("YYYY-MM-DD")],
            falla: ['', Validators.required],
            id_usuario: [{value: this.user.id, disabled: true}, Validators.required],
            cotizacion: [null],
            importe: [null],
        });
      }
    }

  ngOnInit(): void {
    this.getMenus();
    this.usuariosControl.valueChanges.subscribe((data)=>{
      this.form.controls['id_usuario'].setValue(data.id);
    });
    this.usuariosFiltro.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(()=> {

      this.filtrarUsuarios();
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
  onAdd(): void {

    const servicio: ToolService = this.form.getRawValue();
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

  getMenus(){

    this.mainService.getRequest({ id: this.user.id }, `/user/get_tech_users`).subscribe((res: Res) => {
    this.usuarios = res.data;
    this.usuariosFiltrados.next(this.usuarios.slice());
    let filtro = res.data.filter((usuario: User) => usuario.id == this.user.id);
    this.usuariosControl.setValue(filtro[0]);
    this.usuariosControl.disable();

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
        this.singleSelectUsuarios.compareWith = (a: User, b: User) => a && b && a.id === b.id;
      });
  }
  onNoClick(): void {
    this.dialogRef.close();

  }
  ngAfterViewInit(): void {
    this.setInitialValueUsuarios();
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
