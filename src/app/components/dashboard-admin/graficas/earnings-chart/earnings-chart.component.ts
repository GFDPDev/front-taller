import { Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_material from "@amcharts/amcharts4/themes/material";

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
  private chartData!: any;

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
      .getRequest({},this.route)
      .subscribe((res: any) => {
        console.log(res);
        this.chartData = res.data;
        this.generateChart();
      });
  }

  generateChart() {
    this.browserOnly(() => {
      function am4themes_myTheme(target:any) {
        if (target instanceof am4core.ColorSet) {
          target.list = [
            am4core.color("#b53fa1"),
            am4core.color("#003c69"),
            am4core.color("#4f94bc"),
            am4core.color("#ad0071"),
            am4core.color("#a700ad"),

          ];
        }
      }
      am4core.useTheme(am4themes_myTheme);
      am4core.useTheme(am4themes_animated);

      let chart = am4core.create('chartdiv', am4charts.XYChart);

      chart.paddingRight = 20;

      chart.data = this.chartData.totals;

      let mainAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      mainAxis.dataFields.category = 'main';
      this.chartData.years.forEach((year: number) => {
        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
          
        let series = chart.series.push(new am4charts.LineSeries());
        series.strokeWidth = 4;
        series.bullets.push(new am4charts.CircleBullet());
        series.dataFields.valueY = `${year}`;
        series.dataFields.categoryX = 'main';
        series.name = `${year}`;
        series.showOnInit = false;
        series.tooltipText = '{categoryX} ' + `${year}: ` + '${valueY.value}';
        chart.cursor = new am4charts.XYCursor();

      });
      chart.legend = new am4charts.Legend();
    

      this.earningsChart = chart;
    });
  }
}
