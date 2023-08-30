import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { interval, Subscription } from 'rxjs';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment } from 'moment';
import 'moment/locale/es';
import Swal from 'sweetalert2';
import { UntypedFormControl } from '@angular/forms';
import * as moment from 'moment';
import { ExpressDialogComponent } from './express-dialog/express-dialog.component';
import { MainService } from 'src/app/services/main.service';
import { User, Convert } from 'src/app/interfaces/user';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Res } from 'src/app/interfaces/response';
import { ToolService } from 'src/app/interfaces/toolservice';
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
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class ExpressComponent implements OnInit {
  private route = '/express';
  subscription!: Subscription;
  user!: User;
  displayedColumns: string[] = [
    'id',
    'fecha',
    'encargado',
    'herramienta',
    'cotizacion',
    'falla',
    'importe',
    'acciones',
  ];
  dataSource = new MatTableDataSource<ToolService>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  date = new UntypedFormControl(moment());
  constructor(
    private snackbar: MatSnackBar,
    private mainService: MainService,
    public dialog: MatDialog
  ) {
    this.user = Convert.toUser(sessionStorage.getItem('user') ?? '');
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngOnInit(): void {
    this.getExpress();
  }
  getExpress() {
    this.mainService
      .getRequest(
        {
          id: this.user.id,
          month: this.date.value.month() + 1,
          year: this.date.value.year(),
        },
        `${this.route}/tech_by_month`
      )
      .subscribe((res: Res) => {
        if (res.error) {
          this.snackbar.open(`${res.data} (${res.code})`, 'Aceptar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        } else {
          this.dataSource.data = res.data;
        }
      });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  setMonthAndYear(
    normalizedMonthAndYear: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    const ctrlValue = this.date.value;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    this.getExpress();
    datepicker.close();
  }

  createServicio() {
    const dialogRef = this.dialog.open(ExpressDialogComponent, {
      width: '50%',
      data: null,
    });
    dialogRef.afterClosed().subscribe((result: ToolService) => {
      if (result) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se ha registrado el servicio correctamente.',
          showConfirmButton: false,
          timer: 1500,
        });
        this.getExpress();
      }
    });
  }
  updateServicio(servicio: ToolService) {
    const dialogRef = this.dialog.open(ExpressDialogComponent, {
      width: '50%',
      data: servicio,
    });
    dialogRef.afterClosed().subscribe((result: ToolService) => {
      if (result) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se ha actualizado el servicio correctamente.',
          showConfirmButton: false,
          timer: 1500,
        });
        this.getExpress();
      }
    });
  }
}
