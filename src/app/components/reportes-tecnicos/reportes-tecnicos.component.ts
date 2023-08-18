import { Component, OnInit } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ServiciosMesRes } from 'src/app/interfaces/reportes-servicios';
import { UsuariosMesRes } from 'src/app/interfaces/reporte-usuarios';
import { MainService } from 'src/app/services/main.service';
@Component({
  selector: 'app-reportes-tecnicos',
  templateUrl: './reportes-tecnicos.component.html',
  styleUrls: ['./reportes-tecnicos.component.scss']
})
export class ReportesTecnicosComponent implements OnInit {
  model = "Servicios";
  ano!: string;
  reporteS!: ServiciosMesRes;
  reporteU!: UsuariosMesRes[];
  total!: number;
  isLoading : boolean = true;
  mode: ProgressSpinnerMode = 'indeterminate';
  now = new Date();
  constructor(
    private route: ActivatedRoute,
    private  mainService: MainService,
  ) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    this.ano = routeParams.get('ano') ?? '';
    this.getReporte();

  }
  getReporte(){
    this.mainService.requestOne({ _function: "fnGetReporteServiciosPorAno", ano: this.ano}, this.model).subscribe((data: ServiciosMesRes)=> {
      this.reporteS = data;
      this.total = Number.parseFloat(data.importeTotal ?? '0') + Number.parseFloat(data.importeExpress ?? '0');

      setTimeout(()=>{
        this.isLoading = false;
      }, 1000);

    });
    this.mainService.requestMany({ _function: "fnGetReporteUsuariosPorAno", ano: this.ano}, this.model).subscribe((data: UsuariosMesRes[])=> {
      this.reporteU = data;
      setTimeout(()=>{
        this.isLoading = false;
      }, 1000);
    });
  }
  public openPDF(): void {
    let DATA: any = document.getElementById('htmlData');
    html2canvas(DATA).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 5;
      PDF.addImage(FILEURI, 'PNG', 1, position, fileWidth, fileHeight);
      PDF.save('SERVICIOS:' + this.ano.toString());
    });
  }
}
