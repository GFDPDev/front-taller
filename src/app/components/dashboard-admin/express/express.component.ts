import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
// tslint:disable-next-line:no-duplicate-imports
import { Moment } from 'moment';
import 'moment/locale/es';
import Swal from 'sweetalert2';
import { UntypedFormControl } from '@angular/forms';
import moment from 'moment';
import { ExpressAdminComponent } from './express-admin/express-admin.component';
import { MainService } from 'src/app/services/main.service';
import { ExpressRes, Convert } from 'src/app/interfaces/express';
import { Res } from 'src/app/interfaces/response';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CellClickedEvent,
  ColDef,
  GridReadyEvent,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy,
  ValueFormatterParams,
} from 'ag-grid-community';
import { ButtonRendererComponent } from '../ag-grid/button-renderer/button-renderer.component';
import { AgGridAngular } from 'ag-grid-angular';
import { CurrencyFormatComponent } from '../ag-grid/currency-format/currency-format.component';
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
    standalone: false
})
export class ExpressComponent {
  private route = '/express';
  date = new UntypedFormControl(moment());
  public columnDefs: ColDef[] = [
    {
      headerName: 'No.',
      field: 'id',
      cellStyle: { textAlign: 'center' },
      width: 250

    },
    {
      headerName: 'Fecha',
      field: 'fecha',
      hide: true
    },
    {
      headerName: 'Encargado',
      field: 'encargado',
      cellStyle: { textAlign: 'center' },
      width: 270
    },
    {
      headerName: 'Herramienta',
      field: 'herramienta',
      cellStyle: { textAlign: 'center' },
      width: 270
    },
    {
      headerName: 'Cotizacion',
      field: 'cotizacion',
      cellStyle: { textAlign: 'center' },
      width: 270

    },
    {
      headerName: 'Falla',
      field: 'falla',
      cellStyle: { textAlign: 'center' },
      width: 270

    },
    {
      headerName: 'Importe',
      field: 'importe',
      cellRenderer: CurrencyFormatComponent,
      cellStyle: { textAlign: 'center' },
      width: 260,
    },
    {
      headerName: '',
      field: 'delete',
      cellRenderer: ButtonRendererComponent,
      cellRendererParams: {
        icon: 'delete',
        color: 'warn',
        tooltip: 'Eliminar Registro',
      },
      cellStyle: { textAlign: 'center' },

      width: 80,
      flex: 1,
      filter: false
    },
  ];
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
  };
  public autoSizeStrategy:
    | SizeColumnsToFitGridStrategy
    | SizeColumnsToFitProvidedWidthStrategy
    | SizeColumnsToContentStrategy = {
    type: 'fitGridWidth',

  };
  public rowData: ExpressRes[] = [];
  public paginationPageSizeSelector = [20, 50, 100];
  public paginationPageSize = 20;
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  constructor(
    private snackbar: MatSnackBar,
    private mainService: MainService,
    public dialog: MatDialog
  ) {}

  getExpress() {
    this.mainService
      .getRequest(
        { month: this.date.value.month() + 1, year: this.date.value.year() },
        `${this.route}/by_month`
      )
      .subscribe((res: Res) => {
        if (res.error) {
          this.snackbar.open(`${res.data} (${res.code})`, 'Aceptar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        } else {
          this.rowData = res.data;
        }
      });
  }
  onGridReady(params: GridReadyEvent) {
    this.getExpress();
  }
  onCellClicked(e: CellClickedEvent): void {
    const id = e.column.getColId();
    if (id == 'delete') {
      this.deleteServicio(e.data);
    } else {
      this.updateServicio(e.data);
    }
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
    const dialogRef = this.dialog.open(ExpressAdminComponent, {
      width: '50%',
      data: null,
    });
    dialogRef.afterClosed().subscribe((result: ExpressRes) => {
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
  updateServicio(servicio: ExpressRes) {
    const dialogRef = this.dialog.open(ExpressAdminComponent, {
      width: '50%',
      data: servicio,
    });
    dialogRef.afterClosed().subscribe((result: ExpressRes) => {
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

  deleteServicio(express:ExpressRes) {
    Swal.fire({
      title: '¿Seguro que quiere eliminar el servicio #' + express.id + '?',
      text: 'Esta operación no se puede revertir.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this.mainService
          .deleteRequest({}, `${this.route}/${express.id}`)
          .subscribe((data) => {
            this.getExpress();
            Swal.fire(
              'Eliminado',
              'El servicio #' + express.id + ' ha sido eliminado del registro.',
              'success'
            );
          });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Haz cancelado la operación.',
          'Ningún registro eliminado',
          'error'
        );
      }
    });
    this.getExpress();
  }
  getCSVMes() {
    this.agGrid.api.exportDataAsCsv({ allColumns: true, columnSeparator: ';' });
  }
}
