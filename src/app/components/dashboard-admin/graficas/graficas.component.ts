import { MainService } from './../../../services/main.service';
import { GraficasRes } from './../../../interfaces/graficas';
import { Component, Inject, NgZone, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-graficas',
  templateUrl: './graficas.component.html',
  styleUrls: ['./graficas.component.scss']
})
export class GraficasComponent implements OnInit{

  private chartMarcas!: am4charts.PieChart;
  private chartTecnicos!: am4charts.PieChart;
  private chartEstados!: am4charts.PieChart;
  private data!: GraficasRes;
  constructor(@Inject(PLATFORM_ID) private platformId: any, private zone: NgZone, public mainService: MainService) {}

  ngOnInit(): void {
    this.mainService.requestOne({ _function: "fnGetGraficas" }, "Graficas").subscribe((data: GraficasRes)=>{
      this.data = data;
      this.generarGraficas();

    });
  }
  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  generarGraficas(){
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);

      let chartMarcas = am4core.create("chartMarcas", am4charts.PieChart);
      let chartTecnicos = am4core.create("chartTecnicos", am4charts.PieChart);
      let chartEstados = am4core.create("chartEstados", am4charts.PieChart);

      chartMarcas.data =  this.data.marcas;
      chartTecnicos.data =  this.data.tecnicos;
      chartEstados.data =  this.data.estados;


      let seriesMarcas = chartMarcas.series.push(new am4charts.PieSeries());
      let seriesTecnicos = chartTecnicos.series.push(new am4charts.PieSeries());
      let seriesEstados = chartEstados.series.push(new am4charts.PieSeries());

      seriesMarcas.dataFields.value = "cantidad";
      seriesMarcas.dataFields.category = "valor";
      seriesTecnicos.dataFields.value = "cantidad";
      seriesTecnicos.dataFields.category = "valor";
      seriesEstados.dataFields.value = "cantidad";
      seriesEstados.dataFields.category = "valor";

      this.chartMarcas = chartMarcas;
      this.chartTecnicos = chartTecnicos;
      this.chartEstados = chartEstados;

    });
  }
  ngOnDestroy() {
    // Clean up chart when the component is removed
    this.browserOnly(() => {
      if (this.chartMarcas) {
        this.chartMarcas.dispose();
        this.chartEstados.dispose();
        this.chartTecnicos.dispose();

      }
    });
  }
}
