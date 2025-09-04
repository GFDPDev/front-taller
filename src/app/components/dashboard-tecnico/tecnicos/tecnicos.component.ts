import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { interval, Subscription } from 'rxjs';

// tslint:disable-next-line:no-duplicate-imports
import 'moment/locale/es';
import Swal from 'sweetalert2';
import { TecnicoDialogComponent } from './tecnico-dialog/tecnico-dialog.component';
import { MainService } from 'src/app/services/main.service';
import { Convert, User } from 'src/app/interfaces/user';
import { Res } from 'src/app/interfaces/response';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToolService } from 'src/app/interfaces/toolservice';
import * as moment from 'moment';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-tecnicos',
  templateUrl: './tecnicos.component.html',
  styleUrls: ['./tecnicos.component.scss'],
})
export class TecnicosComponent implements OnDestroy, OnInit {
  private route = '/service';
  user!: User;

  displayedColumns: string[] = [
    'id',
    'fecha_ingreso',
    'nombre_cliente',
    'producto',
    'marca',
    'encargado',
    'cotizacion',
    'fecha_terminado',
    'importe',
    'estatus',
    'acciones',
  ];
  dataSource = new MatTableDataSource<ToolService>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private eventSubscription!: Subscription;
  constructor(
    private snackbar: MatSnackBar,
    private mainService: MainService,
    public router: Router,
    public dialog: MatDialog
  ) {
    this.user = Convert.toUser(sessionStorage.getItem('user_taller') ?? '');
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngOnInit(): void {
    this.getServicios();
    this.eventSubscription = this.mainService
      .getServerEvent(`${this.route}/sse`)
      .subscribe(() => {
        this.getServicios();
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  getServicios() {
    this.mainService
      .getRequest({ id: this.user.id }, `${this.route}/tech`)
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

  efectividadDias(start: Date, end: Date) {
    var eventStartTime = new Date(start);
    var eventEndTime = new Date(end);
    var duration = eventEndTime.getDate() - eventStartTime.getDate();
    return duration;
  }
  avisoTerminado(start: Date, end: Date): boolean {
    var eventStartTime = new Date(start);
    var eventEndTime;
    end === null ? (eventEndTime = new Date()) : (eventEndTime = new Date(end));

    var duration = eventEndTime.getDate() - eventStartTime.getDate();
    return duration > 10 && end === null;
  }
  createServicio() {
    const dialogRef = this.dialog.open(TecnicoDialogComponent, {
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
  updateServicio(servicio: ToolService) {
    const dialogRef = this.dialog.open(TecnicoDialogComponent, {
      width: '50%',
      data: servicio,
    });
    dialogRef.afterClosed().subscribe((result: ToolService) => {
      if (result) {
        this.getServicios();
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se ha actualizado el servicio correctamente.',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  }
  datetimeFormatter(params: any) {
    if (params.value) {
      return moment(params.value).format('DD/MM/YYYY HH:mm:ss');
    } else {
      return '';
    }
  }
  printReceipt(data: ToolService) {
    const doc = new jsPDF();
    const logoPath = 'assets/logo.png'; // La ruta del logo que me proporcionaste en el HTML.

    const xPos = 10;
    let yPos = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const lineHeight = 5; // Altura de línea para el texto
    const observaciones = data.observaciones.replace(/(\r\n|\n|\r)/gm, '').trim() ?? 'Ninguno';
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
    doc.text(
      falla,
      xPos,
      yPos
    );

    // Diagnóstico
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnóstico', xPos, yPos);
    doc.line(xPos, yPos + 2, pageWidth - 10, yPos + 2);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const diagnostico = doc.splitTextToSize(
      observaciones,
      pageWidth - 20
    );
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
    window.open(doc.output('bloburl'));
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    this.mainService.disconnectEventSource();
    this.eventSubscription.unsubscribe();
  }
}
