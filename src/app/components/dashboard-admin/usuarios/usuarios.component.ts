import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MainService } from 'src/app/services/main.service';
import Swal from 'sweetalert2';
import { UsuariosRes } from '../../../interfaces/usuarios';
import { UsuarioDialogComponent } from './usuario-dialog/usuario-dialog.component';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  model = "Usuarios";
  usuarios!: UsuariosRes[];
  displayedColumns: string[] = ['id', 'nombre', 'apellido', 'tipo', 'curp', 'acciones'];
  dataSource =new MatTableDataSource<UsuariosRes>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private mainService: MainService, public dialog: MatDialog) {

   }

   ngAfterViewInit(): void {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

   }
  ngOnInit(): void {
    this.getUsuarios();
  }



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getUsuarios(){
    this.mainService.requestMany({ _function: "fnGetUsuarios" }, this.model).subscribe((data: UsuariosRes[])=>{
      this.dataSource.data = data;
    });
  }
  deleteUsuario(id: String, nombre: String){
    Swal.fire({
      title: '¿Seguro que quiere eliminar a ' + nombre + ' del registro de usuarios?',
      text: 'Esta operación no se puede revertir.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.mainService.requestOne({ _function: "fnDeleteUsuario", id: id }, this.model).subscribe((data)=>{console.log(data)});
        this.getUsuarios();

        Swal.fire(
          'Eliminado',
          nombre + ' ha sido eliminado del registro de usuarios.',
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

  createUsuario(){
    const dialogRef =this.dialog.open(UsuarioDialogComponent, {
      width: '40%',
      data: null
    });
    dialogRef.afterClosed().subscribe((result: UsuariosRes) => {
      if (result) {
        Swal.fire(
          'Usuario Registrado',
          'Se ha registrado el usuario ' + result.nombre + ' ' + result.apellido,
          'success'
        );
        this.getUsuarios();
      }
    });

  }
  updateUsuario(usuario: UsuariosRes){
    const dialogRef =this.dialog.open(UsuarioDialogComponent, {
      width: '40%',
      data: usuario
    });
    dialogRef.afterClosed().subscribe((result: UsuariosRes) => {
    if (result) {
      Swal.fire(
        'Usuario Actualizado',
        'Se ha actualizado el usuario ' + result.nombre + ' ' + result.apellido,
        'success'
      );
      this.getUsuarios();
    }
  });

  }
}
