import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardAdminRoutingModule } from './dashboard-admin-routing.module';
import { DashboardAdminComponent } from './dashboard-admin.component';
import { AngularMaterialModule } from '../../angular-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportesComponent } from './reportes/reportes.component';
import { ServiciosComponent } from './servicios/servicios.component';
import { ClientesComponent } from './clientes/clientes.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ServicioDialogComponent } from './servicios/servicio-dialog/servicio-dialog.component';
import { ClienteDialogComponent } from './clientes/cliente-dialog/cliente-dialog.component';
import { UsuarioDialogComponent } from './usuarios/usuario-dialog/usuario-dialog.component';
import { CSVService } from '../../services/csv.service';
import { ExpressComponent } from './express/express.component';
import { ExpressAdminComponent } from './express/express-admin/express-admin.component';
import { GarantiasComponent } from './garantias/garantias.component';
import { GarantiaDialogComponent } from './garantias/garantia-dialog/garantia-dialog.component';
import { ExternosComponent } from './externos/externos.component';
import { ExternosDialogComponent } from './externos/externos-dialog/externos-dialog.component';
import { ReporteTablaComponent } from './reportes/reporte-tabla/reporte-tabla.component';
import { EarningsChartComponent } from './graficas/earnings-chart/earnings-chart.component';
import { StatusChartComponent } from './graficas/status-chart/status-chart.component';
import { TechChartComponent } from './graficas/tech-chart/tech-chart.component';


@NgModule({
  declarations: [
    DashboardAdminComponent,
    ReportesComponent,
    ServiciosComponent,
    ServicioDialogComponent,
    ClientesComponent,
    ClienteDialogComponent,
    UsuariosComponent,
    UsuarioDialogComponent,
    ExpressComponent,
    ExpressAdminComponent,
    ExternosComponent,
    GarantiasComponent,
    GarantiaDialogComponent,
    ExternosComponent,
    ExternosDialogComponent,
    EarningsChartComponent,
    StatusChartComponent,
    TechChartComponent
  ],
  imports: [
    CommonModule,
    DashboardAdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule

  ],
  providers: [CSVService]
})
export class DashboardAdminModule { }
