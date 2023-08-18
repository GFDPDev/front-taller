import { GraficasComponent } from './graficas/graficas.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardAdminComponent } from './dashboard-admin.component';
import { ReportesComponent } from './reportes/reportes.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ServiciosComponent } from './servicios/servicios.component';
import { ClientesComponent } from './clientes/clientes.component';
import { AdminGuard } from 'src/app/admin.guard';
import { ExpressComponent } from './express/express.component';
import { GarantiasComponent } from './garantias/garantias.component';
import { ExternosComponent } from './externos/externos.component';

const routes: Routes = [
  { path: '', component: DashboardAdminComponent, canActivate: [AdminGuard], canLoad: [AdminGuard], children: [
    { path: '', component: ReportesComponent },
    { path: 'graficas', component: GraficasComponent },
    { path: 'usuarios', component: UsuariosComponent },
    { path: 'servicios', component: ServiciosComponent },
    { path: 'clientes', component: ClientesComponent },
    { path: 'express', component: ExpressComponent },
    { path: 'externos', component: ExternosComponent },
    { path: 'garantias', component: GarantiasComponent },



  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AdminGuard]

})
export class DashboardAdminRoutingModule { }
