import { Component, OnInit } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { GarantiasRes } from 'src/app/interfaces/garantias';
import { MainService } from 'src/app/services/main.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Res } from 'src/app/interfaces/response';
@Component({
    selector: 'app-comprobante',
    templateUrl: './comprobante.component.html',
    styleUrls: ['./comprobante.component.scss'],
    standalone: false
})
export class ComprobanteComponent implements OnInit{
  private route = '/warranty';
  garantia!: GarantiasRes;
  isLoading : boolean = true;
  mode: ProgressSpinnerMode = 'indeterminate';
  constructor(private mainService: MainService, private router: ActivatedRoute, ) { }

  ngOnInit(): void {
    this.getGarantia();
  }

  getGarantia(){
    const routeParams = this.router.snapshot.paramMap;
    const id = routeParams.get('id') ?? '';
    this.mainService.getRequest({id:id}, `${this.route}/by_id`).subscribe((res: Res)=>{
      this.garantia = res.data;

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
      PDF.addImage(FILEURI, 'PNG', x, y, fileWidth, fileHeight-55);

      window.open(PDF.output('bloburl'));
    });
  }
}
