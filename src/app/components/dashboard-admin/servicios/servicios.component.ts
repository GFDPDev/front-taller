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
// tslint:disable-next-line:no-duplicate-imports
import { Moment } from 'moment';
import 'moment/locale/es';
import Swal from 'sweetalert2';
import { UntypedFormControl } from '@angular/forms';
import { ServicioDialogComponent } from './servicio-dialog/servicio-dialog.component';
import moment from 'moment';
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
import jsPDF from 'jspdf';
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
    standalone: false
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
      valueFormatter: this.datetimeFormatter,
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

  datetimeFormatter(params: any) {
    if (params.value) {
      return moment(params.value).format('DD/MM/YYYY HH:mm:ss');
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
    } else if (id == 'receipt') {
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
      width: "1000px",
      maxWidth: "95vw",
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
      width: "1000px",
      maxWidth: "95vw",
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
    this.agGrid.api.exportDataAsCsv({ allColumns: true });
  }
  printReceipt(data: ToolService) {
    const doc = new jsPDF();
    const logoPath = 'assets/logo.png'; // La ruta del logo que me proporcionaste en el HTML.

    const xPos = 10;
    let yPos = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const lineHeight = 5; // Altura de línea para el texto
    const observaciones = data.observaciones ? data.observaciones.replace(/(\r\n|\n|\r)/gm, '').trim() : 'Ninguno';
    const falla = data.falla_detectada.replace(/(\r\n|\n|\r)/gm, '').trim();
    console.log(doc.getFontList());
    // Título y logo
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.addImage(logoPath, 'PNG', xPos + 10, yPos, 15, 15); // El logo. Ajusta las coordenadas y el tamaño según sea necesario.
    doc.setTextColor(181, 63, 161); // Color gris oscuro
    doc.text('Centro de Servicio Profesional', xPos + 18, yPos + 20, {
      align: 'center',
    });

    // Nombre Empresa y Direccion
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Color gris oscuro
    doc.text('GRUPO FERRETERO DON PEDRO', pageWidth / 2, yPos + 5, {
      align: 'center',
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(
      'CARRETERA SAN MIGUEL A CELAYA KM 2.4 POBLADO DE DON DIEGO CP. 37887',
      pageWidth / 2,
      yPos + 10,
      { align: 'center' }
    );
    doc.text('SAN MIGUEL DE ALLENDE, GUANAJUATO', pageWidth / 2, yPos + 15, {
      align: 'center',
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(`${data.id}`, pageWidth * 0.85, yPos + 10, { align: 'center' });

    yPos += 30;
    doc.setFontSize(16);
    doc.text('ORDEN DE SERVICIO', pageWidth / 2, yPos, { align: 'center' });

    // Sección de datos del cliente
    yPos += 10;
    doc.setFontSize(12);
    doc.text('Datos del Cliente', xPos, yPos);
    doc.setDrawColor(0);
    doc.line(xPos, yPos + 2, pageWidth - 10, yPos + 2);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    // Lógica mejorada para dos columnas para evitar solapamiento
    const initialYCliente = yPos;
    const nombreClienteLines = doc.splitTextToSize(
      `Nombre o Razón Social: ${data.nombre_cliente}`,
      pageWidth / 2 - xPos - 5
    );
    doc.text(nombreClienteLines, xPos, yPos);

    const telefonoClienteLines = doc.splitTextToSize(
      `Número de Teléfono: ${data.telefono_cliente}`,
      pageWidth / 2 - xPos - 5
    );
    doc.text(telefonoClienteLines, pageWidth / 2, initialYCliente);

    // Avanzamos 'yPos' según el texto más alto de las dos columnas
    const maxHeightCliente = Math.max(
      nombreClienteLines.length,
      telefonoClienteLines.length
    );
    yPos = initialYCliente + maxHeightCliente * lineHeight + 5;

    // Sección de datos del producto
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Datos del Producto', xPos, yPos);
    doc.line(xPos, yPos + 2, pageWidth - 10, yPos + 2);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Producto: ${data.producto}`, xPos, yPos);
    doc.text(`Marca: ${data.marca}`, pageWidth / 2, yPos);
    yPos += 10;
    doc.text(`Modelo: ${data.modelo}`, xPos, yPos);
    doc.text(`Número de Serie: ${data.serie}`, pageWidth / 2, yPos);
    yPos += 10;
    doc.text(
      `Fecha de Ingreso: ${this.datetimeFormatter({
        value: data.fecha_ingreso,
      })}`,
      xPos,
      yPos
    );
    doc.text(
      `Garantía: ${data.garantia == 0 ? 'NO' : 'SI'}`,
      pageWidth / 2,
      yPos
    );
    yPos += 10;
    doc.text(`Fecha de Entrega:`, xPos, yPos);
    doc.line(pageWidth - 76, yPos, pageWidth - 10, yPos);
    doc.text(`Número de Motor:`, pageWidth / 2, yPos);
    doc.line(xPos + 30, yPos, xPos + 90, yPos);

    // Falla descrita
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Falla Descrita por el Cliente', xPos, yPos);
    doc.line(xPos, yPos + 2, pageWidth - 10, yPos + 2);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(falla, xPos, yPos);

    // Diagnóstico
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnóstico', xPos, yPos);
    doc.line(xPos, yPos + 2, pageWidth - 10, yPos + 2);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const diagnostico = doc.splitTextToSize(observaciones, pageWidth - 20);
    diagnostico.forEach((line: string | string[]) => {
      doc.text(line, xPos, yPos);
      yPos += 5; // Ajusta el espaciado de línea
    });
    // Firmas
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Sello Grupo Ferretero Don Pedro', pageWidth / 3.5, yPos, {
      align: 'center',
    });
    doc.text('Nombre y Firma de Cliente', pageWidth / 1.38, yPos, {
      align: 'center',
    });
    yPos += 20;
    doc.line(xPos + 10, yPos, pageWidth / 2 - 5, yPos);
    doc.line(pageWidth / 2 + 10, yPos, pageWidth - 20, yPos);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(
      `Únicamente se entregará el producto o equipo al portador del presente talón de orden de servicio.`,
      xPos,
      yPos
    );

    // Talón de entrega
    yPos += 10;
    doc.line(0, yPos, pageWidth, yPos);
    doc.line(pageWidth / 1.5 + 10, yPos, pageWidth / 1.5 + 10, pageHeight);
    doc.addImage(logoPath, 'PNG', xPos + 5, yPos + 5, 10, 10); // El logo. Ajusta las coordenadas y el tamaño según sea necesario.
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('TALÓN DE ENTREGA DE EQUIPO', pageWidth / 2 - 45, yPos + 1, {
      align: 'center',
    });
    yPos += 1;
    doc.text(`Folio: ${data.id}`, pageWidth / 2 - 10, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`Folio: ${data.id}`, pageWidth / 1.5 + 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    yPos += 5;
    doc.text('Email: servicio@grupodonpedro.com', pageWidth / 2 - 45, yPos, {
      align: 'center',
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const talonCliente = doc.splitTextToSize(
      `Cliente: ${data.nombre_cliente}`,
      50
    );
    let yPosCopy = yPos + 3;
    talonCliente.forEach((line: string | string[]) => {
      doc.text(line, pageWidth / 1.5 + 15, yPosCopy);
      yPosCopy += 5; // Ajusta el espaciado de línea
    });
    yPosCopy += 5;
    doc.text(
      `Teléfono: ${data.telefono_cliente}`,
      pageWidth / 1.5 + 15,
      yPosCopy
    );
    yPosCopy += 10;
    const producto = doc.splitTextToSize(`Producto: ${data.producto}`, 50);
    producto.forEach((line: string | string[]) => {
      doc.text(line, pageWidth / 1.5 + 15, yPosCopy);
      yPosCopy += 5; // Ajusta el espaciado de línea
    });

    yPosCopy += 5;
    const lines = doc.splitTextToSize(`Falla: ${falla}`, 50);
    lines.forEach((line: string | string[]) => {
      doc.text(line, pageWidth / 1.5 + 15, yPosCopy);
      yPosCopy += 5; // Ajusta el espaciado de línea
    });
    yPos += 4;
    doc.setFontSize(8);
    doc.text('Teléfono: 415 140 0105', pageWidth / 2 - 45, yPos, {
      align: 'center',
    });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);

    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Teléfono: ${data.telefono_cliente}`, pageWidth / 2 - 10, yPos);
    const entregaCliente = doc.splitTextToSize(
      `Cliente: ${data.nombre_cliente}`,
      70
    );
    entregaCliente.forEach((line: string | string[]) => {
      doc.text(line, xPos, yPos);
      yPos += 5; // Ajusta el espaciado de línea
    });

    yPos += 5;
    doc.text(`Producto: ${data.producto}`, xPos, yPos);
    doc.text(`Marca: ${data.marca}`, pageWidth / 2 - 10, yPos);
    yPos += 10;

    doc.text(`Modelo: ${data.modelo}`, xPos, yPos);
    doc.text(
      `Fecha: ${this.datetimeFormatter({ value: data.fecha_ingreso })}`,
      pageWidth / 2 - 10,
      yPos
    );

    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(
      `Únicamente se entregará el producto o equipo al portador del presente talón de orden de servicio.`,
      xPos,
      yPos
    );
    

    // doc.text(`Falla: ${data.falla_detectada}`, pageWidth / 1.5 + 20, yPos);
    // doc.save(`orden_servicio_${data.id}.pdf`);
    window.open(doc.output('bloburl'),'_blank');
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
