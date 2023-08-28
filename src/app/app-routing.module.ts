import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacturaComponent } from './components/factura/factura.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { ReportesServiciosComponent } from './components/reportes-servicios/reportes-servicios.component';
import { ReportesTecnicosComponent } from './components/reportes-tecnicos/reportes-tecnicos.component';
import { NotFoundsComponent } from './components/not-founds/not-founds.component';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';
import { ReporteTablaComponent } from './components/dashboard-admin/reportes/reporte-tabla/reporte-tabla.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LogInComponent },
  { path: 'reporte/:start/:end', component: ReporteTablaComponent },
  { path: 'reporteTecnicos/:ano', component:  ReportesTecnicosComponent},
  { path: 'reporteServicios/:mes/:ano', component: ReportesServiciosComponent },
  { path: 'factura/:id', component: FacturaComponent },
  { path: 'notFound', component: NotFoundsComponent },
  { path: 'dashboard-admin', canLoad: [adminGuard], loadChildren: () => import('./components/dashboard-admin/dashboard-admin.module').then(x => x.DashboardAdminModule) },
  { path: 'dashboard-tecnico', canLoad: [authGuard], loadChildren: () => import('./components/dashboard-tecnico/dashboard-tecnico.module').then(x => x.DashboardTecnicoModule) },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
