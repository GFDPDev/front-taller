import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDatepicker} from '@angular/material/datepicker';
import { interval, Subscription } from 'rxjs';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment} from 'moment';
import 'moment/locale/es';
import Swal from 'sweetalert2';
import { UntypedFormControl } from '@angular/forms';
import * as moment from 'moment';
import { MainService } from 'src/app/services/main.service';
import { GarantiaRes, Convert } from 'src/app/interfaces/garantias';
import { GarantiaDialogComponent } from './garantia-dialog/garantia-dialog.component';
import { CSVService } from 'src/app/services/csv.service';
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-garantias',
  templateUrl: './garantias.component.html',
  styleUrls: ['./garantias.component.scss'],
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

export class GarantiasComponent implements OnInit {
  model = "Garantia";
  displayedColumns: string[] = ['id', 'comprobante', 'autorizo', 'folio', 'fecha_registro', 'producto', 'marca', 'estado_cliente', 'estado_proveedor', 'acciones'];
  dataSource= new MatTableDataSource<GarantiaRes>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  date = new UntypedFormControl(moment());
  constructor(private mainService: MainService, public dialog: MatDialog,  private csv: CSVService) { }

  ngOnInit(): void {
        this.getGarantias();
  }
  ngAfterViewInit(): void {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;


   }
   applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  getGarantias(){
    this.mainService.requestMany({ _function: "fnGetGarantia", mes: this.date.value.month() + 1, ano: this.date.value.year() }, this.model).subscribe((data: GarantiaRes[])=>{

      this.dataSource.data = data;
    });
  }
  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    this.getGarantias();
    datepicker.close();
  }
  deleteGarantia(id: String){
    Swal.fire({
      title: '¿Seguro que quiere eliminar el registro de la garantía?',
      text: 'Esta operación no se puede revertir.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.mainService.requestOne({ _function: "fnDeleteGarantia", id: id }, this.model).subscribe((data)=>{console.log(data)});
        this.getGarantias();

        Swal.fire(
          'Eliminado',
          'La garantía se ha eliminado',
          'success'
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Haz cancelado la operación.',
          'Ningún registro eliminado',
          'error'
        )
      }
    });
  }
  createGarantia(){
    const dialogRef =this.dialog.open(GarantiaDialogComponent, {
      width: '50%',
      data: null
    });
    dialogRef.afterClosed().subscribe((result: GarantiaRes) => {
      if (result) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se ha registrado la garantia correctamente.',
          showConfirmButton: false,
          timer: 1500
        }
        );
        this.getGarantias();
      }
    });

  }
  updateGarantia(garantia: GarantiaRes){
    const dialogRef =this.dialog.open(GarantiaDialogComponent, {
      width: '50%',
      data: garantia
    });
    dialogRef.afterClosed().subscribe((result: GarantiaRes) => {
    if (result) {
      Swal.fire(
        {
          position: 'center',
          icon: 'success',
          title: 'Se ha actualizado la garantia correctamente.',
          showConfirmButton: false,
          timer: 1500
        }
      );
      this.getGarantias();
    }
  });


  }
  getCSVGarantia(){
    let data = this.dataSource.filteredData;
    data.forEach(garantia => {
      garantia.motivo = garantia.motivo.replace(/(\r\n|\n|\r)/gm, "");
    });
    let jsonReporte = Convert.garantiaResToJson(data);
    setTimeout(()=>{
      this.csv.downloadFile(jsonReporte, 'Reporte', ['id', 'autorizo', 'comprobante', 'folio', 'fecha_registro', 'producto', 'marca', 'modelo', 'cantidad', 'costo_unitario', 'total', 'fecha_proveedor', 'fecha_resuelto_proveedor', 'fecha_resuelto_cliente', 'estado_cliente', 'estado_proveedor', 'estado', 'modificador'])

      }, 1500);
  }
}