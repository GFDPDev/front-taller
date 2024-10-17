import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { MainService } from 'src/app/services/main.service';
// tslint:disable-next-line:no-duplicate-imports
import { Moment } from 'moment';
import 'moment/locale/es';
import Swal from 'sweetalert2';
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
import { UntypedFormControl } from '@angular/forms';
import { Convert, ExternosRes } from 'src/app/interfaces/externos';
import { ExternosDialogComponent } from './externos-dialog/externos-dialog.component';
import { CSVService } from 'src/app/services/csv.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Res } from 'src/app/interfaces/response';
import {
  CellClickedEvent,
  ColDef,
  GridReadyEvent,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy,
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { DatetimeFormatComponent } from '../ag-grid/datetime-format/datetime-format.component';
import { ButtonRendererComponent } from '../ag-grid/button-renderer/button-renderer.component';
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
  selector: 'app-externos',
  templateUrl: './externos.component.html',
  styleUrls: ['./externos.component.scss'],
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
export class ExternosComponent {
  private route = '/external';
  date = new UntypedFormControl(moment());
  public columnDefs: ColDef[] = [
    {
      headerName: 'No.',
      field: 'id',
      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: 'Fecha de Registro',
      field: 'fecha_registro',
      cellStyle: { textAlign: 'center' },
      filter: 'agDateColumnFilter',
      hide: true
    },
    {
      headerName: 'Garantía',
      field: 'garantia',
      cellStyle: { textAlign: 'center' },
      hide: true
    },
    {
      headerName: 'Cliente',
      field: 'nombre_cliente',
      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: 'Encargado',
      field: 'encargado',
      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: 'Folio',
      field: 'folio',
      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: 'Marca',
      field: 'marca',
      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: 'Cotización',
      field: 'cotizacion',
      cellStyle: { textAlign: 'center' },
      width: 130,
    },
    {
      headerName: 'Estado',
      field: 'estado',
      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: 'Cita',
      field: 'cita',
      cellRenderer: DatetimeFormatComponent,
      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: 'Observaciones',
      field: 'observaciones',
      cellRenderer: DatetimeFormatComponent,
      cellStyle: { textAlign: 'center' },
      hide: true
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

      filter: false,
      flex: 1,
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
  public rowData: ExternosRes[] = [];
  public paginationPageSizeSelector = [20, 50, 100];
  public paginationPageSize = 20;
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  constructor(
    private snackbar: MatSnackBar,
    private mainService: MainService,
    public dialog: MatDialog
  ) {}
  onGridReady(params: GridReadyEvent) {
    this.getServicios();
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
    this.getServicios();
    datepicker.close();
  }
  getServicios() {
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

  deleteServicio(servicio: ExternosRes) {
    Swal.fire({
      title:
        '¿Seguro que quiere eliminar el servicio del cliente ' +
        servicio.nombre_cliente +
        '?',
      text: 'Esta operación no se puede revertir.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this.mainService
          .deleteRequest({}, `${this.route}/${servicio.id}`)
          .subscribe((data) => {
            this.getServicios();
            Swal.fire(
              'Eliminado',
              'El servicio #' +
                servicio.id +
                ' ha sido eliminado del registro.',
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
  }
  createServicio() {
    const dialogRef = this.dialog.open(ExternosDialogComponent, {
      width: '50%',
      data: null,
    });
    dialogRef.afterClosed().subscribe((result: ExternosRes) => {
      if (result) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se ha registrado el servicio correctamente.',
          showConfirmButton: false,
          timer: 1500,
        });
        this.getServicios();
      }
    });
  }
  updateServicio(servicio: ExternosRes) {
    const dialogRef = this.dialog.open(ExternosDialogComponent, {
      width: '50%',
      data: servicio,
    });
    dialogRef.afterClosed().subscribe((result: ExternosRes) => {
      if (result) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se ha actualizado el servicio correctamente.',
          showConfirmButton: false,
          timer: 1500,
        });
        this.getServicios();
      }
    });
  }
  getCSVMes() {
    this.agGrid.api.exportDataAsCsv({ allColumns: true, columnSeparator: ';' });
  }
}
