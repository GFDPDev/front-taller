import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MainService } from 'src/app/services/main.service';
import Swal from 'sweetalert2';
import { ClientesRes } from '../../../interfaces/clientes';
import { ClienteDialogComponent } from './cliente-dialog/cliente-dialog.component';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent implements OnInit {
  model = "Clientes";
  clientes!: ClientesRes[];
  displayedColumns: string[] = ['id', 'nombre', 'apellido', 'telefono', 'acciones'];
  dataSource= new MatTableDataSource<ClientesRes>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private mainService: MainService, public dialog: MatDialog) {

  }
  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }


  ngOnInit(): void {
    this.getClientes();

  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getClientes(){
    this.mainService.requestMany({ _function: "fnGetClientes" }, this.model).subscribe((data: ClientesRes[])=>{
      this.dataSource.data = data;
    });
  }
  deleteCliente(id: String, nombre: String){
    Swal.fire({
      title: '¿Seguro que quiere eliminar a ' + nombre + ' del registro de clientes?',
      text: 'Esta operación no se puede revertir.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.mainService.requestOne({ _function: "fnDeleteCliente", id: id }, this.model).subscribe((data)=>{console.log(data)});
        this.getClientes();

        Swal.fire(
          'Eliminado',
          nombre + ' ha sido eliminado del registro de clientes.',
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
  createCliente(){
    const dialogRef =this.dialog.open(ClienteDialogComponent, {
      width: '40%',
      data: null
    });
    dialogRef.afterClosed().subscribe((result: ClientesRes) => {
      if (result) {
        Swal.fire(
          'Cliente Registrado',
          'Se ha registrado el cliente ' + result.nombre + ' ' + result.apellido,
          'success'
        );
        this.getClientes();
      }

    });

  }

  updateCliente(cliente: ClientesRes){
    const dialogRef =this.dialog.open(ClienteDialogComponent, {
      width: '40%',
      data: cliente
    });
    dialogRef.afterClosed().subscribe((result: ClientesRes) => {
      if (result) {
        Swal.fire(
          'Cliente Actualizado',
          'Se ha actualizado el cliente ' + result.nombre + ' ' + result.apellido,
          'success'
        );
        this.getClientes();
      }

    });
  }

}
