import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardTecnicoRoutingModule } from './dashboard-tecnico-routing.module';
import { AngularMaterialModule } from '../../angular-material.module';
import { DashboardTecnicoComponent } from './dashboard-tecnico.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TecnicosComponent } from './tecnicos/tecnicos.component';
import { TecnicoDialogComponent } from './tecnicos/tecnico-dialog/tecnico-dialog.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ClienteDialogComponent } from './clientes/cliente-dialog/cliente-dialog.component';
import { ExpressComponent } from './express/express.component';
import { ExpressDialogComponent } from './express/express-dialog/express-dialog.component';

@NgModule({
  declarations: [
    DashboardTecnicoComponent,
    TecnicosComponent,
    TecnicoDialogComponent,
    ClientesComponent,
    ClienteDialogComponent,
    ExpressComponent,
    ExpressDialogComponent

  ],
  imports: [
    CommonModule,
    FormsModule,
    DashboardTecnicoRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule
  ]
})
export class DashboardTecnicoModule { }
