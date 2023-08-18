import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { MainService } from 'src/app/services/main.service';
// tslint:disable-next-line:no-duplicate-imports
import { Moment} from 'moment';
import 'moment/locale/es';
import Swal from 'sweetalert2';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDatepicker} from '@angular/material/datepicker';
import { interval, Subscription } from 'rxjs';
import { FormControl, UntypedFormControl } from '@angular/forms';
import { Convert, ExternosRes } from 'src/app/interfaces/externos';
import { ExternosDialogComponent } from './externos-dialog/externos-dialog.component';
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
  selector: 'app-externos',
  templateUrl: './externos.component.html',
  styleUrls: ['./externos.component.scss'],
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
export class ExternosComponent implements OnInit {
  model = "Externos";
  displayedColumns: string[] = ['id', 'nombre_cliente','encargado', 'folio', 'fecha_registro', 'marca', 'cotizacion', 'estado', 'cita', 'acciones'];
    dataSource= new MatTableDataSource<ExternosRes>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  date = new UntypedFormControl(moment());
  constructor(private csv: CSVService, private mainService: MainService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getServicios();
  }
  ngAfterViewInit(): void {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
   }
     applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
    setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    this.getServicios();
    datepicker.close();
  }
   getServicios(){
    this.mainService.requestMany({ _function: "fnGetExternos", mes: this.date.value.month() + 1, ano: this.date.value.year() }, this.model).subscribe((data: ExternosRes[])=>{

      this.dataSource.data = data;
    });
  }

  deleteServicio(id: String, nombre: String){
    Swal.fire({
      title: '¿Seguro que quiere eliminar el servicio del cliente ' + nombre + '?',
      text: 'Esta operación no se puede revertir.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.mainService.requestOne({ _function: "fnDeleteExterno", id: id }, this.model).subscribe((data)=>{console.log(data)});
        this.getServicios();

        Swal.fire(
          'Eliminado',
          'El servicio de ' +nombre + ' ha sido eliminado del registro.',
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
  createServicio(){
    const dialogRef =this.dialog.open(ExternosDialogComponent, {
      width: '50%',
      data: null
    });
    dialogRef.afterClosed().subscribe((result: ExternosRes) => {
      if (result) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se ha registrado el servicio correctamente.',
          showConfirmButton: false,
          timer: 1500
        }
        );
        this.getServicios();
      }
    });

  }
  updateServicio(servicio: ExternosRes){
    const dialogRef =this.dialog.open(ExternosDialogComponent, {
      width: '50%',
      data: servicio
    });
    dialogRef.afterClosed().subscribe((result: ExternosRes) => {
    if (result) {
      Swal.fire(
        {
          position: 'center',
          icon: 'success',
          title: 'Se ha actualizado el servicio correctamente.',
          showConfirmButton: false,
          timer: 1500
        }
      );
      this.getServicios();
    }
  });


}
getCSVMes(){
    let data = this.dataSource.filteredData;
    data.forEach(servicio => {
      servicio.observaciones = servicio.observaciones?.replace(/(\r\n|\n|\r)/gm, "");
    });
    let jsonReporte = Convert.externosResToJson(data);
    setTimeout(()=>{
      this.csv.downloadFile(jsonReporte, 'Externos', ['id','folio', 'garantia', 'fecha_registro', 'marca', 'id_cliente', 'nombre_cliente', 'cotizacion', 'importe', 'cita', 'estado', 'observaciones', 'avisado'])

      }, 1500);
  }
}

