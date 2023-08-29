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
    {provide: MAT_DATE_LOCALE, useValue: 'es-ES'},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class ReportesComponent {
  reportRange!: FormGroup;
  serviceRange! : FormGroup;
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
  }

  getCSVRango(){
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

}
