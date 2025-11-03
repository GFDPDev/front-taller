import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MainService } from 'src/app/services/main.service';
import Swal from 'sweetalert2';
import { User } from '../../../interfaces/user';
import { UsuarioDialogComponent } from './usuario-dialog/usuario-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Res } from 'src/app/interfaces/response';

@Component({
    selector: 'app-usuarios',
    templateUrl: './usuarios.component.html',
    styleUrls: ['./usuarios.component.scss'],
    standalone: false
})
export class UsuariosComponent implements OnInit {
  private route = '/user';
  usuarios!: User[];
  displayedColumns: string[] = [
    'id',
    'nombre',
    'apellido',
    'tipo',
    'curp',
    'acciones',
  ];
  dataSource = new MatTableDataSource<User>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private snackbar: MatSnackBar,
    private mainService: MainService,
    public dialog: MatDialog
  ) {}

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

  getUsuarios() {
    this.mainService
      .getRequest({}, `${this.route}/get_active_users`)
      .subscribe((res: Res) => {
        if (res.error) {
          this.snackbar.open(`${res.data} (${res.code})`, 'Aceptar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        } else {
          this.dataSource.data = res.data;
        }
      });
  }
  deleteUsuario(id: String, nombre: String) {
    Swal.fire({
      title:
        '¿Seguro que quiere eliminar a ' +
        nombre +
        ' del registro de usuarios?',
      text: 'Esta operación no se puede revertir.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this.mainService
          .deleteRequest({}, `${this.route}/${id}`)
          .subscribe((data) => {
            this.getUsuarios();
            Swal.fire(
              'Eliminado',
              nombre + ' ha sido eliminado del registro de usuarios.',
              'success'
            );
          });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Haz cancelado la operación.',
          'Ningún registro eliminado',
          'error'
        );
      }
    });
  }

  createUsuario() {
    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '40%',
      data: null,
    });
    dialogRef.afterClosed().subscribe((result: User) => {
      if (result) {
        Swal.fire(
          'Usuario Registrado',
          'Se ha registrado el usuario ' +
            result.nombre +
            ' ' +
            result.apellido,
          'success'
        );
        this.getUsuarios();
      }
    });
  }
  updateUsuario(usuario: User) {
    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '40%',
      data: usuario,
    });
    dialogRef.afterClosed().subscribe((result: User) => {
      if (result) {
        Swal.fire(
          'Usuario Actualizado',
          'Se ha actualizado el usuario ' +
            result.nombre +
            ' ' +
            result.apellido,
          'success'
        );
        this.getUsuarios();
      }
    });
  }
}
