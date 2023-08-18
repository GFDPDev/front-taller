import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDatepicker} from '@angular/material/datepicker';
import { interval, Subscription } from 'rxjs';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment} from 'moment';
import 'moment/locale/es';
import Swal from 'sweetalert2';
import { ServiciosRes } from '../../../interfaces/servicios';
import { UntypedFormControl } from '@angular/forms';
import * as moment from 'moment';
import { Convert, LoginRes } from 'src/app/interfaces/login';
import { ExpressDialogComponent } from './express-dialog/express-dialog.component';
import { MainService } from 'src/app/services/main.service';
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-express',
  templateUrl: './express.component.html',
  styleUrls: ['./express.component.scss'],
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
export class ExpressComponent implements OnInit {
  model = "Express";
  subscription!: Subscription;
  profile: LoginRes = Convert.toLoginRes(sessionStorage.getItem('profile')??'');
  displayedColumns: string[] = ['id', 'fecha_ingreso', 'producto', 'encargado', 'cotizacion', 'importe', 'acciones'];
  dataSource= new MatTableDataSource<ServiciosRes>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  date = new UntypedFormControl(moment());
  constructor(private mainService: MainService, public dialog: MatDialog) { }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngOnInit(): void {
      this.getExpress();
  }
  getExpress(){
    this.mainService.requestMany({ _function: "fnGetExpressPorMesTec", mes: this.date.value.month() + 1, ano: this.date.value.year(), id_usuario: this.profile.id }, this.model).subscribe((data: ServiciosRes[])=>{
      this.dataSource.data = data;
    });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    this.getExpress();
    datepicker.close();
  }

  createServicio(){
    const dialogRef =this.dialog.open(ExpressDialogComponent, {
      width: '50%',
      data: null
    });
    dialogRef.afterClosed().subscribe((result: ServiciosRes) => {
      if (result) {
        Swal.fire(
          {
            position: 'center',
            icon: 'success',
            title: 'Se ha registrado el servicio correctamente.',
            showConfirmButton: false,
            timer: 1500
          }
        );
        this.getExpress();
      }
    });

  }
  updateServicio(servicio: ServiciosRes){
    const dialogRef =this.dialog.open(ExpressDialogComponent, {
      width: '50%',
      data: servicio
    });
    dialogRef.afterClosed().subscribe((result: ServiciosRes) => {
    if (result) {
      Swal.fire(
        {
          position: 'center',
          icon: 'success',
          title: 'Se ha actualizado el servicio correctamente.',
          showConfirmButton: false,
          timer: 1500
        }
      );
      this.getExpress();
    }
  });
}

}
