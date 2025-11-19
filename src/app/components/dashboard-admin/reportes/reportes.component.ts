import { Component } from '@angular/core';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import 'moment/locale/es';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { CSVService } from '../../../services/csv.service';
import { MainService } from 'src/app/services/main.service';
import { Convert, ToolService } from 'src/app/interfaces/toolservice';
import { Res } from 'src/app/interfaces/response';
import { GarantiasRes, Convert as ConvertG } from 'src/app/interfaces/garantias';
import { Report } from 'src/app/interfaces/report';
import jsPDF from 'jspdf';


export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
    selector: 'app-reportes',
    templateUrl: './reportes.component.html',
    styleUrls: ['./reportes.component.scss'],
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
export class ReportesComponent {
  reportRange!: FormGroup;
  serviceRange! : FormGroup;
  warrantyRange! : FormGroup;
  report!: Report;
  route = "/service/by_range"
  start_date!: Date;
  end_date!: Date;
  
  constructor(public router: Router, private csv: CSVService, private fb: FormBuilder, private mainService: MainService) {
    this.serviceRange = this.fb.group({
      start_date : [moment()],
      end_date : [moment()]

    })
     this.reportRange = this.fb.group({
      start_date : [moment()],
      end_date : [moment()]

    })
    this.warrantyRange = this.fb.group({
      start_date : [moment()],
      end_date : [moment()]

    })
  }

   getReport(){
    this.mainService.getRequest({ start_date: this.reportRange.value.start_date.format('YYYY-MM-DD'), end_date: this.reportRange.value.end_date.format('YYYY-MM-DD') }, `/report/by_range`).subscribe((res: Res)=> {
      this.report = res.data;
      this.start_date = this.reportRange.value.start_date.toDate();
      this.end_date = this.reportRange.value.end_date.toDate();
      this.openPDF();
    });
  }
  
  getCSVServicio(){
    const obj = this.serviceRange.value;
    obj.start_date = obj.start_date.format('YYYY-MM-DD')
    obj.end_date = obj.end_date.format('YYYY-MM-DD')
    this.mainService.getRequest(obj, this.route).subscribe((res: Res)=>{
      const data: ToolService[] = res.data;
      data.forEach(servicio => {
        servicio.observaciones = servicio.observaciones.replace(/(\r\n|\n|\r)/gm, "");
        servicio.falla_detectada = servicio.falla_detectada.replace(/(\r\n|\n|\r)/gm, "");
      });
      let jsonReporte = Convert.toolServiceToJson(data);
      setTimeout(()=>{
        this.csv.downloadFile(jsonReporte, 'Reporte', ['id','id_cliente', 'id_usuario', 'nombre_cliente', 'telefono_cliente', 'encargado', 'fecha_ingreso', 'producto', 'marca', 'modelo', 'tipo', 'serie', 'garantia', 'falla_detectada', 'cotizacion', 'fecha_terminado', 'fecha_entrega', 'importe', 'estatus', 'observaciones'])

        }, 1500);
    });
  }
  getCSVGarantia(){
    const obj = this.warrantyRange.value;
    obj.start_date = obj.start_date.format('YYYY-MM-DD')
    obj.end_date = obj.end_date.format('YYYY-MM-DD')
    this.mainService.getRequest(obj, '/warranty/by_range').subscribe((res: Res)=>{
      const data: GarantiasRes[] = res.data;
      data.forEach(garantia => {
        garantia.motivo = garantia.motivo.replace(/(\r\n|\n|\r)/gm, "");
      });
      let jsonReporte = ConvertG.garantiasResToJson(data);
      setTimeout(()=>{
        this.csv.downloadFile(jsonReporte, 'Reporte', [
          'id',
          'traspaso',
          'autorizo',
          'folio',
          'fecha_registro',
          'producto',
          'marca',
          'modelo',
          'cantidad',
          'costo_unitario',
          'total',
          'motivo',
          'fecha_proveedor',
          'fecha_resuelto_proveedor',
          'fecha_resuelto_cliente',
          'estado_cliente',
          'estado_proveedor',
          'id_modificado',
          'modificador',
          'doc'
        ])

        }, 1500);
    });
  }

  openPDF() {
    if (!this.report) {
      return;
    }

    const doc = new jsPDF();
    const logoPath = 'assets/logo.png';
    const xPos = 10;
    let yPos = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const cellHeight = 7;

    // Encabezado
    doc.setFontSize(8);
    doc.addImage(logoPath, 'PNG', xPos + 10, yPos, 15, 15);

    // Título del reporte
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('REPORTE MENSUAL DE SERVICIOS', pageWidth / 2, yPos, { align: 'center' });

    yPos += 5;
    doc.setFontSize(11);
    doc.text('TALLER DE HERRAMIENTAS', pageWidth / 2, yPos, { align: 'center' });

    yPos += 25;
    doc.setFontSize(10);
    const startDateStr = moment(this.start_date).format('DD/MM/YYYY');
    const endDateStr = moment(this.end_date).format('DD/MM/YYYY');
    doc.text(`Inicio: ${startDateStr}`, pageWidth / 4, yPos);
    doc.text(`Fin: ${endDateStr}`, pageWidth / 1.5, yPos);

    yPos += 15;

    // Tabla 1: Resumen de Servicios
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN DE SERVICIOS', xPos, yPos);
    yPos += 5;

    const headers1 = ['ESTATUS', 'CANTIDAD', 'PORCENTAJE'];
    const data1 = [
      ['POR AUTORIZAR', this.report.service_report['por_autorizar'].toString(), (this.report.service_report['porc_pa']).toFixed(1) + '%'],
      ['NO AUTORIZADO', this.report.service_report['no_autorizado'].toString(), (this.report.service_report['porc_na']).toFixed(1) + '%'],
      ['PENDIENTE', this.report.service_report['pendiente'].toString(), (this.report.service_report['porc_p']).toFixed(1) + '%'],
      ['TERMINADO', this.report.service_report['terminado'].toString(), (this.report.service_report['porc_t']).toFixed(1) + '%'],
      ['ENTREGADO', this.report.service_report['entregado'].toString(), (this.report.service_report['porc_e']).toFixed(1) + '%'],
      ['TOTAL', this.report.service_report['total'].toString(), '100.0%'],
    ];

    yPos = this.drawTable(doc, xPos, yPos, headers1, data1, pageHeight);

    yPos += 5;

    // Tabla 2: Reporte de Usuarios
    if (this.report.user_report && this.report.user_report.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE POR ENCARGADO', xPos, yPos);
      yPos += 5;

      const headers2 = ['ENCARGADO', 'ASIGNADOS', 'POR AUT', 'NO AUT', 'PEND', 'TERM', 'ENTREG', '%'];
      const data2 = this.report.user_report.map(user => [
        this.truncateText(user.encargado, 12),
        user.servicios.toString(),
        user.por_autorizar.toString(),
        user.no_autorizado.toString(),
        user.pendientes.toString(),
        user.terminados.toString(),
        user.entregados.toString(),
        user.porcentaje.toFixed(1) + '%'
      ]);

      yPos = this.drawTable(doc, xPos, yPos, headers2, data2, pageHeight);
      yPos += 5;
    }

    // Tabla 3: Ingresos
    if (this.report.earnings_report && this.report.earnings_report.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE INGRESOS', xPos, yPos);
      yPos += 5;

      const headers3 = ['ENCARGADO', 'IMPORTE', 'PORCENTAJE'];
      const data3 = this.report.earnings_report.map(user => [
        user.encargado,
        '$' + user.importe.toFixed(2),
        (user.porcentaje ?? 0).toFixed(1) + '%'
      ]);

      yPos = this.drawTable(doc, xPos, yPos, headers3, data3, pageHeight);
      yPos += 5;
    }

    // Tabla 4: Express
    if (this.report.express_report && this.report.express_report.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE SERVICIOS EXPRESS', xPos, yPos);
      yPos += 5;

      const headers4 = ['ENCARGADO', 'IMPORTE', 'SERVICIOS'];
      const data4 = this.report.express_report.map(user => [
        user.encargado,
        '$' + user.importe.toFixed(2),
        user.servicios.toString()
      ]);

      yPos = this.drawTable(doc, xPos, yPos, headers4, data4, pageHeight);
      yPos += 5;
    }

    // Tabla 5: Externos
    if (this.report.external_report && this.report.external_report.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE SERVICIOS EXTERNOS', xPos, yPos);
      yPos += 5;

      const headers5 = ['ENCARGADO', 'EXTERNOS', 'PEND', 'AGEND', 'TERM', '%'];
      const data5 = this.report.external_report.map(user => [
        this.truncateText(user.encargado, 12),
        user.servicios.toString(),
        user.pendientes.toString(),
        user.agendado.toString(),
        user.terminados.toString(),
        user.porcentaje.toFixed(1) + '%'
      ]);

      yPos = this.drawTable(doc, xPos, yPos, headers5, data5, pageHeight);
    }

    // Importe Total
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`IMPORTE TOTAL: $${this.report.service_report['importe_total'].toFixed(2)}`, pageWidth / 2, yPos, { align: 'center' });

    window.open(doc.output('bloburl'));
  }

  private drawTable(
    doc: jsPDF,
    xPos: number,
    yPos: number,
    headers: string[],
    data: string[][],
    pageHeight: number
  ): number {
    const cellHeight = 6;
    const colWidth = (doc.internal.pageSize.getWidth() - xPos * 2) / headers.length;
    const margin = 10;

    // Headers
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setDrawColor(0);
    
    headers.forEach((header, i) => {
      doc.setFillColor(200, 200, 200);
      doc.rect(xPos + i * colWidth, yPos, colWidth, cellHeight, 'FD');
      doc.setTextColor(0, 0, 0);
      doc.text(header, xPos + i * colWidth + 1, yPos + 4, { maxWidth: colWidth - 2 });
    });

    yPos += cellHeight;

    // Data rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0);

    data.forEach(row => {
      if (yPos + cellHeight > pageHeight - margin) {
        // Nueva página
        doc.addPage();
        yPos = margin;
        
        // Headers en nueva página
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setDrawColor(0);
        
        headers.forEach((header, i) => {
          doc.setFillColor(200, 200, 200);
          doc.rect(xPos + i * colWidth, yPos, colWidth, cellHeight, 'FD');
          doc.setTextColor(0, 0, 0);
          doc.text(header, xPos + i * colWidth + 1, yPos + 4, { maxWidth: colWidth - 2 });
        });
        yPos += cellHeight;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 0);
        doc.setDrawColor(0);
      }

      row.forEach((cell, i) => {
        doc.setFillColor(255, 255, 255);
        doc.rect(xPos + i * colWidth, yPos, colWidth, cellHeight, 'FD');
        doc.setTextColor(0, 0, 0);
        doc.text(cell, xPos + i * colWidth + 1, yPos + 4, { maxWidth: colWidth - 2 });
      });
      yPos += cellHeight;
    });

    return yPos;
  }

  private truncateText(text: string, maxLength: number = 15): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength - 3) + '...';
    }
    return text;
  }

}