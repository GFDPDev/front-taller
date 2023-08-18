import { Component, OnInit } from '@angular/core';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDatepicker} from '@angular/material/datepicker';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment} from 'moment';
import 'moment/locale/es';
import { FormBuilder, FormControl, FormGroup, UntypedFormControl } from '@angular/forms';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import * as moment from 'moment';
import { CSVService } from '../../../services/csv.service';
import { Convert, ServiciosRes } from 'src/app/interfaces/servicios';
import { MainService } from 'src/app/services/main.service';


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
export class ReportesComponent implements OnInit {
  dateReporteUsuarios = new UntypedFormControl(moment());
  dateReporteServicios = new UntypedFormControl(moment());
  yearReporteServicios = new FormControl();
  rango! : FormGroup;
  constructor(public router: Router, private csv: CSVService, private fb: FormBuilder, private mainService: MainService) {
    this.rango = this.fb.group({
      inicio : [moment()],
      fin : [moment()]

    })
  }

  ngOnInit(): void {
  }
  setMonthAndYearUsuarios(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.dateReporteUsuarios.value;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.dateReporteUsuarios.setValue(ctrlValue);
    datepicker.close();
  }
  setMonthAndYearServicios(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.dateReporteServicios.value;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.dateReporteServicios.setValue(ctrlValue);
    datepicker.close();
  }
  getCSVMes(){
    this.mainService.requestMany({ _function: "fnGetServiciosPorMes", mes: this.dateReporteServicios.value.month() + 1, ano: this.dateReporteServicios.value.year() }, "Servicios").subscribe((data: ServiciosRes[])=>{
      data.forEach(servicio => {
        servicio.observaciones = servicio.observaciones?.replace(/(\r\n|\n|\r)/gm, "");
        servicio.falla_detectada = servicio.falla_detectada?.replace(/(\r\n|\n|\r)/gm, "");
      });
      let jsonReporte = Convert.serviciosResToJson(data);
      setTimeout(()=>{
        this.csv.downloadFile(jsonReporte, 'Reporte', ['id','id_cliente', 'id_usuario', 'nombre_cliente', 'telefono_cliente', 'encargado', 'fecha_ingreso', 'producto', 'marca', 'modelo', 'tipo', 'serie', 'garantia', 'falla_detectada', 'cotizacion', 'fecha_terminado', 'fecha_entrega', 'importe', 'estatus', 'observaciones'])

        }, 1500);
    });
  }
  getCSVRango(){
    const obj = this.rango.value;
    obj.inicio = JSON.stringify(obj.inicio).slice(1, 11);
    obj.fin = JSON.stringify(obj.fin).slice(1, 11);
    this.mainService.requestMany({ _function: "fnGetServiciosPorRango", data: obj }, "Servicios").subscribe((data: ServiciosRes[])=>{
      data.forEach(servicio => {
        servicio.observaciones = servicio.observaciones?.replace(/(\r\n|\n|\r)/gm, "");
        servicio.falla_detectada = servicio.falla_detectada?.replace(/(\r\n|\n|\r)/gm, "");
      });
      let jsonReporte = Convert.serviciosResToJson(data);
      setTimeout(()=>{
        this.csv.downloadFile(jsonReporte, 'Reporte', ['id','id_cliente', 'id_usuario', 'nombre_cliente', 'telefono_cliente', 'encargado', 'fecha_ingreso', 'producto', 'marca', 'modelo', 'tipo', 'serie', 'garantia', 'falla_detectada', 'cotizacion', 'fecha_terminado', 'fecha_entrega', 'importe', 'estatus', 'observaciones'])

        }, 1500);
    });
  }

}
