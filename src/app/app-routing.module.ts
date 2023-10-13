import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacturaComponent } from './components/factura/factura.component';
import { LogInComponent } from './components/log-in/log-in.component';

import { NotFoundsComponent } from './components/not-founds/not-founds.component';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';
import { ReporteTablaComponent } from './components/dashboard-admin/reportes/reporte-tabla/reporte-tabla.component';
import { ComprobanteComponent } from './components/comprobante/comprobante.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'taller/login' },
  { path: 'taller/login', component: LogInComponent },
  { path: 'taller/reporte/:start/:end', component: ReporteTablaComponent },
  { path: 'taller/factura/:id', component: FacturaComponent },
  { path: 'taller/comprobante/:id', component: ComprobanteComponent },
  { path: 'taller/notFound', component: NotFoundsComponent },
  { path: 'taller/dashboard-admin', canLoad: [adminGuard], loadChildren: () => import('./components/dashboard-admin/dashboard-admin.module').then(x => x.DashboardAdminModule) },
  { path: 'taller/dashboard-tecnico', canLoad: [authGuard], loadChildren: () => import('./components/dashboard-tecnico/dashboard-tecnico.module').then(x => x.DashboardTecnicoModule) },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
