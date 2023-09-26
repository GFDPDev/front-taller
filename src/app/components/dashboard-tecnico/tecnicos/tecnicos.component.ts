import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { interval, Subscription } from 'rxjs';

// tslint:disable-next-line:no-duplicate-imports
import 'moment/locale/es';
import Swal from 'sweetalert2';
import { TecnicoDialogComponent } from './tecnico-dialog/tecnico-dialog.component';
import { MainService } from 'src/app/services/main.service';
import { Convert, User } from 'src/app/interfaces/user';
import { Res } from 'src/app/interfaces/response';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToolService } from 'src/app/interfaces/toolservice';

@Component({
  selector: 'app-tecnicos',
  templateUrl: './tecnicos.component.html',
  styleUrls: ['./tecnicos.component.scss'],
})
export class TecnicosComponent implements OnInit {
  private route = '/service';
  subscription!: Subscription;
  user!: User;

  displayedColumns: string[] = [
    'id',
    'fecha_ingreso',
    'nombre_cliente',
    'producto',
    'marca',
    'encargado',
    'cotizacion',
    'fecha_terminado',
    'importe',
    'estatus',
    'acciones',
  ];
  dataSource = new MatTableDataSource<ToolService>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private snackbar: MatSnackBar,
    private mainService: MainService,
    public router: Router,
    public dialog: MatDialog
  ) {
    this.user = Convert.toUser(sessionStorage.getItem('user_taller') ?? '');
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    const source = interval(60000);
    this.subscription = source.subscribe((val) => this.getServicios());
  }
  ngOnInit(): void {
    this.getServicios();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  getServicios() {
    this.mainService
      .getRequest({ id: this.user.id }, `${this.route}/tech`)
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

  efectividadDias(start: Date, end: Date) {
    var eventStartTime = new Date(start);
    var eventEndTime = new Date(end);
    var duration = eventEndTime.getDate() - eventStartTime.getDate();
    return duration;
  }
  avisoTerminado(start: Date, end: Date): boolean {
    var eventStartTime = new Date(start);
    var eventEndTime;
    end === null ? (eventEndTime = new Date()) : (eventEndTime = new Date(end));

    var duration = eventEndTime.getDate() - eventStartTime.getDate();
    return duration > 10 && end === null;
  }
  createServicio() {
    const dialogRef = this.dialog.open(TecnicoDialogComponent, {
      width: '50%',
      data: null,
    });
    dialogRef.afterClosed().subscribe((result: ToolService) => {
      if (result) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se ha registrado el servicio correctamente.',
          showConfirmButton: false,
          timer: 1500,
        });
        this.getServicios();
      }
    });
  }
  updateServicio(servicio: ToolService) {
    const dialogRef = this.dialog.open(TecnicoDialogComponent, {
      width: '50%',
      data: servicio,
    });
    dialogRef.afterClosed().subscribe((result: ToolService) => {
      if (result) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se ha actualizado el servicio correctamente.',
          showConfirmButton: false,
          timer: 1500,
        });
        this.getServicios();
      }
    });
  }
}
