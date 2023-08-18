import { Component, OnInit } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ServiciosMesRes } from 'src/app/interfaces/reportes-servicios';
import { UsuariosMesRes } from 'src/app/interfaces/reporte-usuarios';
import { ExpressMesRess } from '../../interfaces/reporte-express';
import { MainService } from 'src/app/services/main.service';
import { ExternalMonth, ReportesMes, SMonth, ServicesMonth, UserMonth } from 'src/app/interfaces/reporte-mes';
@Component({
  selector: 'app-reportes-servicios',
  templateUrl: './reportes-servicios.component.html',
  styleUrls: ['./reportes-servicios.component.scss']
})
export class ReportesServiciosComponent implements OnInit {
  model = "Reportes";
  mes!: number;
  ano!: number;
  serviciosMes!: ServicesMonth;
  usuariosMes!: UserMonth[];
  gananciasMes!: SMonth[];
  expressMess!: SMonth[];
  externosMes!: ExternalMonth[];
  isLoading : boolean = true;
  mode: ProgressSpinnerMode = 'indeterminate';
  now = new Date();
  constructor(
    private route: ActivatedRoute,
    private  mainService: MainService,
  ) {}

  ngOnInit(): void {
      const routeParams = this.route.snapshot.paramMap;
      this.mes = Number.parseInt(routeParams.get('mes') ?? '0');
      this.ano = Number(routeParams.get('ano') ?? '0');

    this.getReporte();
  }

  getReporte(){
    this.mainService.requestOne({ _function: "fnGetReportePorMes", mes: this.mes, ano: this.ano}, this.model).subscribe((data: ReportesMes)=> {
      console.log(data);
      this.serviciosMes = data.services_month;
      this.usuariosMes = data.user_month;
      this.gananciasMes = data.earnings_month;
      this.expressMess = data.express_month;
      this.externosMes = data.external_month
      setTimeout(()=>{
        this.isLoading = false
    }, 300);
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
      PDF.save('SERVICIOS:' + this.mes.toString() + '-' + this.ano.toString());
    });
  }

}
