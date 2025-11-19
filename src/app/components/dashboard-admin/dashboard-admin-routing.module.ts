import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardAdminComponent } from './dashboard-admin.component';
import { ReportesComponent } from './reportes/reportes.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ServiciosComponent } from './servicios/servicios.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ExpressComponent } from './express/express.component';
import { GarantiasComponent } from './garantias/garantias.component';
import { ExternosComponent } from './externos/externos.component';
import { adminGuard } from 'src/app/auth/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: DashboardAdminComponent,
    canActivate: [adminGuard],
    canLoad: [adminGuard],
    children: [
      { path: '', component: ReportesComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'servicios', component: ServiciosComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'express', component: ExpressComponent },
      { path: 'externos', component: ExternosComponent },
      { path: 'garantias', component: GarantiasComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardAdminRoutingModule {}
