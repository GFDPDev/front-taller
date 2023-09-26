import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MainService } from 'src/app/services/main.service';
import { Res } from 'src/app/interfaces/response';
import { ToolService } from 'src/app/interfaces/toolservice';
@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.scss']
})
export class FacturaComponent implements OnInit {
  private route = '/service';
  servicio!: ToolService;
  isLoading : boolean = true;
  mode: ProgressSpinnerMode = 'indeterminate';
  constructor(private mainService: MainService, private router: ActivatedRoute, ) { }

  ngOnInit(): void {
    this.getServicio();
  }

  getServicio() {
    const routeParams = this.router.snapshot.paramMap;
    const id = routeParams.get('id') ?? '';
    this.mainService.putRequest({}, `${this.route}/print/${id}`).subscribe((data: any)=>{

    });
    this.mainService.getRequest({id:id}, `${this.route}/by_id`).subscribe((res: Res)=>{
      this.servicio = res.data;

      setTimeout(()=>{
        this.isLoading = false;
      }, 1000);
      setTimeout(()=>{
      this.openPDF();

      }, 1500);

    });
  }
  public openPDF(): void {
    let DATA: any = document.getElementById('htmlData');
    html2canvas(DATA).then((canvas) => {

      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let fileWidth = PDF.internal.pageSize.getWidth();
      let fileHeight =PDF.internal.pageSize.getHeight()-10;
      let y = 10;
      let x = 1;
      PDF.addImage(FILEURI, 'PNG', x, y, fileWidth, fileHeight-20);

      window.open(PDF.output('bloburl'));
    });
  }

/*
  public openPDF(): void {
    let DATA: any = document.getElementById('htmlData');
    let DATA2: any = document.getElementById('htmlData2');
    let PDF = new jsPDF('p', 'mm', 'a4');
    let fileWidth = PDF.internal.pageSize.getWidth();
    let fileHeight =PDF.internal.pageSize.getHeight()-10;
    html2canvas(DATA).then((canvas) => {

      const FILEURI = canvas.toDataURL('image/png');
      let y = 9;
      let x = -3;
      PDF.addImage(FILEURI, 'PNG', x, y, fileWidth, fileHeight-40);
      html2canvas(DATA2).then((canvas) => {
        PDF.addPage();
        const FILEURI = canvas.toDataURL('image/png');
        let y = 25;
        let x = -65;
        PDF.addImage(FILEURI, 'PNG', x, y, fileWidth, fileHeight-500);

        window.open(PDF.output('bloburl'));
      });

    });

  }
*/
}
