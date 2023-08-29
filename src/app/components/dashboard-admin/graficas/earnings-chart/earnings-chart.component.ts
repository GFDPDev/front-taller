import { Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { MainService } from 'src/app/services/main.service';
import { Res } from 'src/app/interfaces/response';
import { isPlatformBrowser } from '@angular/common';
import { FormControl } from '@angular/forms';
import { Chart } from 'src/app/interfaces/chart';

@Component({
  selector: 'app-earnings-chart',
  templateUrl: './earnings-chart.component.html',
  styleUrls: ['./earnings-chart.component.scss'],
})
export class EarningsChartComponent implements OnInit {
  private route = '/chart/earnings';
  private earningsChart!: am4charts.XYChart;
  private data!: Chart[];
  public yearForm = new FormControl(new Date().getFullYear());

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private zone: NgZone,
    public mainService: MainService
  ) {
    am4core.options.autoDispose = true;

  }
  ngOnInit(): void {
    this.getChart();
  }
  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }
  getChart() {
    this.mainService
      .getRequest({ year: this.yearForm.value }, this.route)
      .subscribe((res: Res) => {
        this.data = res.data;
        this.generateChart();
      });
  }
  generateChart() {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      let chart = am4core.create('chartdiv', am4charts.XYChart);

      chart.paddingRight = 20;

      chart.data = this.data;

      let mainAxis = chart.xAxes.push(new am4charts.DateAxis());
      mainAxis.dataFields.date = 'main';

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

      let series = chart.series.push(new am4charts.LineSeries());
      series.strokeWidth = 4;
      series.bullets.push(new am4charts.CircleBullet());
      series.dataFields.valueY = 'total';
      series.dataFields.dateX = 'main';
      series.name = 'Ventas de Taller';
      series.showOnInit = false;
      series.tooltipText = '${valueY.value}';
      chart.cursor = new am4charts.XYCursor();

      let scrollbarX = new am4charts.XYChartScrollbar();
      scrollbarX.series.push(series);
      chart.scrollbarX = scrollbarX;

      this.earningsChart = chart;
    });
  }
}
