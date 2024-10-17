import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
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
import {
  BehaviorSubject,
  combineLatest,
  interval,
  map,
  mapTo,
  Subject,
  Subscription,
  takeUntil,
} from 'rxjs';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment } from 'moment';
import 'moment/locale/es';
import Swal from 'sweetalert2';
import { UntypedFormControl } from '@angular/forms';
import * as moment from 'moment';
import { MainService } from 'src/app/services/main.service';
import { GarantiasRes, Convert } from 'src/app/interfaces/garantias';
import { GarantiaDialogComponent } from './garantia-dialog/garantia-dialog.component';
import { CSVService } from 'src/app/services/csv.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Res } from 'src/app/interfaces/response';
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
import { AgGridAngular } from 'ag-grid-angular';
import { ToolService } from 'src/app/interfaces/toolservice';
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
  selector: 'app-garantias',
  templateUrl: './garantias.component.html',
  styleUrls: ['./garantias.component.scss'],
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
export class GarantiasComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<boolean>();

  private thead!: HTMLTableSectionElement;
  private tbody!: HTMLTableSectionElement;

  private theadChanged$ = new BehaviorSubject(true);
  private tbodyChanged$ = new Subject<boolean>();

  private theadObserver = new MutationObserver(() =>
    this.theadChanged$.next(true)
  );
  private tbodyObserver = new MutationObserver(() =>
    this.tbodyChanged$.next(true)
  );
  private route = '/warranty';

  dataSource = new MatTableDataSource<GarantiasRes>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  date = new UntypedFormControl(moment());
  private eventSubscription!: Subscription;
  public columnDefs: ColDef[] = [
    {
      headerName: 'No.',
      field: 'id',
      cellStyle: { textAlign: 'center' },
      width: 120,
    },
    {
      headerName: 'Numero de Traspaso',
      field: 'traspaso',
      hide: true
    },
    {
      headerName: 'Autorizado por',
      field: 'autorizo',
      hide: true
    },
    {
      headerName: 'F. de Registro',
      field: 'fecha_registro',
      cellStyle: { textAlign: 'center' },
      valueFormatter: this.dateFormatter,
      filter: 'agDateColumnFilter',
      width: 140,
    },
    {
      headerName: 'Folio',
      field: 'folio',
      cellStyle: { textAlign: 'center' },
      width: 270,
    },
    {
      headerName: 'Producto',
      field: 'producto',
      cellStyle: { textAlign: 'center' },
      width: 270,
    },
    {
      headerName: 'Marca',
      field: 'marca',
      cellStyle: { textAlign: 'center' },
      width: 270,
    },
    {
      headerName: 'Modelo',
      field: 'modelo',
      hide: true
    },
    {
      headerName: 'Costo Unitario',
      field: 'costo_unitario',
      hide: true
    },
    {
      headerName: 'Total',
      field: 'total',
      hide: true
    },
    {
      headerName: 'Motivo',
      field: 'motivo',
      hide: true
    },
    {
      headerName: 'Estado de Cliente',
      field: 'estado_cliente',
      cellStyle: { textAlign: 'center' },
      width: 230,
    },
    {
      headerName: 'Fecha de Resuelto para Cliente',
      field: 'fecha_resuelto_cliente',
      hide: true
    },
    {
      headerName: 'Fecha de Solicitud a Proveedor',
      field: 'fecha_proveedor',
      hide: true
    },
    {
      headerName: 'Estado de Proveedor',
      field: 'estado_proveedor',
      cellStyle: { textAlign: 'center' },
      width: 230,
    },
    {
      headerName: 'Fecha de Resuelto para Proveedor',
      field: 'fecha_resuelto_proveedor',
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

      width: 80,
      flex: 1,
      filter: false,
    },
    {
      headerName: '',
      field: 'receipt',
      cellRenderer: ButtonRendererComponent,
      cellRendererParams: {
        icon: 'receipt_log',
        color: '',
        tooltip: 'Generar Comprobante',
      },
      cellStyle: { textAlign: 'center' },

      filter: false,
      width: 80,
      flex: 1,
    },
  ];
  public rowClassRules: RowClassRules = {
    yellow: 'data.estado_proveedor == "EN TRÁMITE"',
    green: 'data.estado_proveedor != "PENDIENTE"',
    red: 'data.estado_proveedor == "MERMA"',
  };
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
    this.eventSubscription = this.mainService
      .getServerEvent(`${this.route}/sse`)
      .subscribe(() => {
        this.getGarantias();
      });
  }
  onGridReady(params: GridReadyEvent) {
    this.getGarantias();
  }
  onCellClicked(e: CellClickedEvent): void {
    const id = e.column.getColId();
    if (id == 'delete') {
      this.deleteGarantia(e.data);
    } else if(id=='receipt') {
      this.printReceipt(e.data);
    }
    else {
      this.updateGarantia(e.data);
    }
  }

  dateFormatter(params: any) {
    if (params.value) {
      return moment(params.value).format('DD/MM/YYYY');
    } else {
      return '';
    }
  }
  getGarantias() {
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
  setMonthAndYear(
    normalizedMonthAndYear: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    const ctrlValue = this.date.value;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    this.getGarantias();
    datepicker.close();
  }
  deleteGarantia(warranty:GarantiasRes) {
    Swal.fire({
      title: '¿Seguro que quiere eliminar el registro de la garantía?',
      text: 'Esta operación no se puede revertir.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this.mainService
          .deleteRequest({}, `${this.route}/${warranty.id}`)
          .subscribe((data) => {
            Swal.fire('Eliminado', 'La garantía se ha eliminado', 'success');
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
  createGarantia() {
    const dialogRef = this.dialog.open(GarantiaDialogComponent, {
      width: '70%',
      data: null,
    });
    dialogRef.afterClosed().subscribe((result: GarantiasRes) => {
      if (result) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se ha registrado la garantia correctamente.',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  }
  updateGarantia(garantia: GarantiasRes) {
    const dialogRef = this.dialog.open(GarantiaDialogComponent, {
      width: '70%',
      data: garantia,
    });
    dialogRef.afterClosed().subscribe((result: GarantiasRes) => {
      if (result) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se ha actualizado la garantia correctamente.',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  }
  getCSVGarantia() {
    this.agGrid.api.exportDataAsCsv({ allColumns: true, columnSeparator: ';' });
  }
  printReceipt(data: GarantiasRes) {
    const url =  this.router.createUrlTree(['/taller/comprobante', data.id]).toString();
    window.open(url, '_blank');

  }
  ngOnDestroy(): void {
    this.theadObserver.disconnect();
    this.tbodyObserver.disconnect();
    this.mainService.disconnectEventSource();
    this.eventSubscription.unsubscribe();

    this.onDestroy$.next(true);
  }
}
