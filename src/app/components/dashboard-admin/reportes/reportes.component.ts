import { Component } from '@angular/core';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _moment from 'moment';
import 'moment/locale/es';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import * as moment from 'moment';
import { CSVService } from '../../../services/csv.service';
import { MainService } from 'src/app/services/main.service';
import { Convert, ToolService } from 'src/app/interfaces/toolservice';
import { Res } from 'src/app/interfaces/response';
import { formatDate } from '@angular/common';
import { GarantiasRes, Convert as ConvertG } from 'src/app/interfaces/garantias';


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

  route = "/service/by_range"
  
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
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`/taller/reporte/${this.reportRange.value.start_date.format('YYYY-MM-DD')}/${this.reportRange.value.end_date.format('YYYY-MM-DD')}`])
    );
    window.open(url, '_blank');
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

}
