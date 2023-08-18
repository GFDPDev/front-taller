import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardTecnicoComponent } from './dashboard-tecnico.component';
import { TecnicosComponent } from './tecnicos/tecnicos.component';
import { ClientesComponent } from './clientes/clientes.component';
import { AuthGuard } from 'src/app/auth.guard';
import { ExpressComponent } from './express/express.component';

const routes: Routes = [
  { path: '', component: DashboardTecnicoComponent, children: [
    { path: '', component: TecnicosComponent },
    { path: 'clientes', component: ClientesComponent },
    { path: 'express', component: ExpressComponent },


  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]

})
export class DashboardTecnicoRoutingModule { }
