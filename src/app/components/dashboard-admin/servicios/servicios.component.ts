import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { interval, Subscription } from 'rxjs';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment } from 'moment';
import 'moment/locale/es';
import Swal from 'sweetalert2';
import { UntypedFormControl } from '@angular/forms';
import { ServicioDialogComponent } from './servicio-dialog/servicio-dialog.component';
import * as moment from 'moment';
import { MainService } from 'src/app/services/main.service';
import { ToolService } from 'src/app/interfaces/toolservice';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Res } from 'src/app/interfaces/response';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellClickedEvent,
  ColDef,
  GridReadyEvent,
  RowClassRules,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy,
} from 'ag-grid-community';
import { ButtonRendererComponent } from '../ag-grid/button-renderer/button-renderer.component';
import { Router } from '@angular/router';
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
  selector: 'app-servicios',
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.scss'],
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
export class ServiciosComponent implements OnDestroy {
  private route = '/service';
  eventSource!: EventSource;
  date = new UntypedFormControl(moment());
  private eventSubscription!: Subscription;
  private intervalId: any;

  public columnDefs: ColDef[] = [
    {
      headerName: 'No.',
      field: 'id',
      cellStyle: { textAlign: 'center' },
      width: 100,
    },
    {
      headerName: 'F. de Ingreso',
      field: 'fecha_ingreso',
      filter: 'agDateColumnFilter',
      cellStyle: { textAlign: 'center' },
      valueFormatter: this.dateFormatter,
      width: 140,
    },
    {
      headerName: 'Cliente',
      field: 'nombre_cliente',
      cellStyle: { textAlign: 'center' },
      width: 220,
    },
    {
      headerName: 'Telefono',
      field: 'telefono_cliente',
      hide: true,
    },
    {
      headerName: 'Producto',
      field: 'producto',
      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: 'Marca',
      field: 'marca',
      cellStyle: { textAlign: 'center' },
      width: 100,
    },
    {
      headerName: 'Encargado',
      field: 'encargado',
      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: 'Falla',
      field: 'falla_detectada',
      hide: true,
    },
    {
      headerName: 'Cotización',
      field: 'cotizacion',
      cellStyle: { textAlign: 'center', fontSize: '14px' },
      width: 90,
    },
    {
      headerName: 'Importe',
      field: 'importe',
      hide: true,
    },
    {
      headerName: 'F. de Terminado',
      field: 'fecha_terminado',
      cellStyle: { textAlign: 'center' },
      filter: 'agDateColumnFilter',
      valueFormatter: this.dateFormatter,
      width: 140,
    },
    {
      headerName: 'F. de Entrega',
      field: 'fecha_entrega',
      filter: 'agDateColumnFilter',
      cellStyle: { textAlign: 'center' },
      valueFormatter: this.dateFormatter,
      width: 140,
    },

    {
      headerName: 'Estado',
      field: 'estatus',
      cellStyle: { textAlign: 'center' },
      width: 140,

    },
    {
      headerName: 'Garantía',
      field: 'garantia',
      hide: true,
    },
    {
      headerName: 'Observaciones',
      field: 'observaciones',
      hide: true,
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
      width: 80,
      flex: 1,
    },
    {
      headerName: '',
      field: 'receipt',
      cellRenderer: ButtonRendererComponent,
      cellRendererParams: {
        icon: 'receipt_log',
        color: '',
        tooltip: 'Generar Recibo',
      },
      cellStyle: { textAlign: 'center' },

      filter: false,
      width: 80,
      flex: 1,
    },
  ];
  public rowClassRules: RowClassRules = {
    yellow: 'data.avisado == 1',
    green: 'data.avisado == 2',
  };

  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
  };
  public autoSizeStrategy:
    | SizeColumnsToFitGridStrategy
    | SizeColumnsToFitProvidedWidthStrategy
    | SizeColumnsToContentStrategy = {
    type: 'fitCellContents',
    skipHeader: true,
  };
  public rowData: ToolService[] = [];
  public paginationPageSizeSelector = [20, 50, 100];
  public paginationPageSize = 20;
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  constructor(
    private snackbar: MatSnackBar,
    private mainService: MainService,
    public dialog: MatDialog,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.getServicios();
    }, 180000);

    this.eventSubscription = this.mainService
      .getServerEvent(`${this.route}/sse`)
      .subscribe(() => {
        this.getServicios();
      });
  }

  dateFormatter(params: any) {
    if (params.value) {
      return moment(params.value).format('DD/MM/YYYY');
    } else {
      return '';
    }
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
  onGridReady(params: GridReadyEvent) {
    this.getServicios();
  }
  onCellClicked(e: CellClickedEvent): void {
    const id = e.column.getColId();
    if (id == 'delete') {
      this.deleteServicio(e.data);
    } else if(id=='receipt') {
      this.printReceipt(e.data);
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
  deleteServicio(service: ToolService) {
    Swal.fire({
      title:
        '¿Seguro que quiere eliminar el servicio del cliente ' +
        service.nombre_cliente +
        '?',
      text: 'Esta operación no se puede revertir.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this.mainService
          .deleteRequest({}, `${this.route}/${service.id}`)
          .subscribe((data) => {
            Swal.fire(
              'Eliminado',
              'El servicio de ' +
                service.nombre_cliente +
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
    const dialogRef = this.dialog.open(ServicioDialogComponent, {
      width: '50%',
      data: null,
    });
    dialogRef.afterClosed().subscribe((result: ToolService) => {
      if (result) {
        this.getServicios();

        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se ha registrado el servicio correctamente.',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  }
  updateServicio(data: ToolService) {
    const dialogRef = this.dialog.open(ServicioDialogComponent, {
      width: '50%',
      data: data,
    });
    dialogRef.afterClosed().subscribe((result: ToolService) => {
      if (result) {
        this.getServicios();

        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se ha actualizado el registro correctamente.',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  }
  getCSV() {
    this.agGrid.api.exportDataAsCsv({ allColumns: true, columnSeparator: ';' });
  }
  printReceipt(data: ToolService) {
    const url =  this.router.createUrlTree(['/taller/factura', data.id]).toString();
    window.open(url, '_blank');
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.mainService.disconnectEventSource();
    this.eventSubscription.unsubscribe();
  }
}
