import { Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { EarningsChart } from 'src/app/interfaces/earnings-chart';
import { MainService } from 'src/app/services/main.service';
import { Res } from 'src/app/interfaces/response';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-earnings-chart',
  templateUrl: './earnings-chart.component.html',
  styleUrls: ['./earnings-chart.component.scss'],
})
export class EarningsChartComponent implements OnInit {
  route = '/chart/earnings';
  private earningsChart!: am4charts.XYChart;
  private data!: EarningsChart[];

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private zone: NgZone,
    public mainService: MainService
  ) {}
  ngOnInit(): void {
    this.mainService
      .getRequest({ year: 2023 }, this.route)
      .subscribe((res: Res) => {
        this.data = res.data;
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
  generarGraficas() {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      let chart = am4core.create('chartdiv', am4charts.XYChart);

      chart.paddingRight = 20;

      chart.data = this.data;

      let mainAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      mainAxis.dataFields.category = 'main';
      mainAxis.title.text = 'Meses';

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
   
      let series = chart.series.push(new am4charts.LineSeries());
      series.strokeWidth = 4;
      series.bullets.push(new am4charts.CircleBullet());
      series.dataFields.valueY = 'total';
      series.dataFields.categoryX = 'main';
      series.name = 'Ventas de Taller';

      series.tooltipText = '${valueY.value}';
      chart.cursor = new am4charts.XYCursor();

      let scrollbarX = new am4charts.XYChartScrollbar();
      scrollbarX.series.push(series);
      chart.scrollbarX = scrollbarX;

      this.earningsChart = chart;
    });
  }
  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.earningsChart) {
        this.earningsChart.dispose();
      }
    });
  }
}
