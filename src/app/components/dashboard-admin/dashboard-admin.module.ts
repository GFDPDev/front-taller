import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardAdminRoutingModule } from './dashboard-admin-routing.module';
import { DashboardAdminComponent } from './dashboard-admin.component';
import { AngularMaterialModule } from '../../angular-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportesComponent } from './reportes/reportes.component';
import { NavbarComponent } from '../dashboard-admin/navbar/navbar.component';
import { ServiciosComponent } from './servicios/servicios.component';
import { ClientesComponent } from './clientes/clientes.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ServicioDialogComponent } from './servicios/servicio-dialog/servicio-dialog.component';
import { ClienteDialogComponent } from './clientes/cliente-dialog/cliente-dialog.component';
import { UsuarioDialogComponent } from './usuarios/usuario-dialog/usuario-dialog.component';
import { ReportesServiciosComponent } from '../reportes-servicios/reportes-servicios.component';
import { ReportesTecnicosComponent } from '../reportes-tecnicos/reportes-tecnicos.component';
import { CSVService } from '../../services/csv.service';
import { ExpressComponent } from './express/express.component';
import { ExpressAdminComponent } from './express/express-admin/express-admin.component';
import { GraficasComponent } from './graficas/graficas.component';
import { GarantiasComponent } from './garantias/garantias.component';
import { GarantiaDialogComponent } from './garantias/garantia-dialog/garantia-dialog.component';
import { ExternosComponent } from './externos/externos.component';
import { ExternosDialogComponent } from './externos/externos-dialog/externos-dialog.component';


@NgModule({
  declarations: [
    DashboardAdminComponent,
    ReportesComponent,
    NavbarComponent,
    ServiciosComponent,
    ServicioDialogComponent,
    ClientesComponent,
    ClienteDialogComponent,
    UsuariosComponent,
    UsuarioDialogComponent,
    ReportesTecnicosComponent,
    ReportesServiciosComponent,
    ExpressComponent,
    ExpressAdminComponent,
    ExternosComponent,
    GraficasComponent,
    GarantiasComponent,
    GarantiaDialogComponent,
    ExternosComponent,
    ExternosDialogComponent
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
