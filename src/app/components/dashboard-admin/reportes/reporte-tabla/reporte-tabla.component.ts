import { Component, OnInit } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { Report } from 'src/app/interfaces/report';
import { Res } from 'src/app/interfaces/response';
import { MainService } from 'src/app/services/main.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
@Component({
    selector: 'app-reporte-tabla',
    templateUrl: './reporte-tabla.component.html',
    styleUrls: ['./reporte-tabla.component.scss'],
    standalone: false
})
export class ReporteTablaComponent implements OnInit {
  route = "/report"
  start_date!: string | null;
  end_date!: string | null;
  report!: Report;
  isLoading = true;
  mode: ProgressSpinnerMode = 'indeterminate';

  constructor(
    private router: ActivatedRoute,
    private  mainService: MainService,
  ) {}

  ngOnInit(): void {
    const routeParams = this.router.snapshot.paramMap;
    this.start_date = routeParams.get('start');
    this.end_date = routeParams.get('end');

    this.getReporte();
  }
  getReporte(){
    this.mainService.getRequest({ start_date: this.start_date, end_date: this.end_date }, `${this.route}/by_range`).subscribe((res: Res)=> {
      this.report = res.data;
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
      PDF.save('SERVICIOS:' + this.start_date + ' ' + this.end_date);
    });
  }
}


