import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './angular-material.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { FacturaComponent } from './components/factura/factura.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NotFoundsComponent } from './components/not-founds/not-founds.component';
import { ReporteTablaComponent } from './components/dashboard-admin/reportes/reporte-tabla/reporte-tabla.component';
import { ComprobanteComponent } from './components/comprobante/comprobante.component';

@NgModule({ declarations: [
        AppComponent,
        LogInComponent,
        FacturaComponent,
        NotFoundsComponent,
        ReporteTablaComponent,
        ComprobanteComponent
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA], imports: [BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        AngularMaterialModule,
        FormsModule,
        ReactiveFormsModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
