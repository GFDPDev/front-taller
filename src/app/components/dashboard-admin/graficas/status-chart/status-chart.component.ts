import { Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { UntypedFormControl } from '@angular/forms';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  MAT_DATE_LOCALE,
  DateAdapter,
  MAT_DATE_FORMATS,
} from '@angular/material/core';
import * as moment from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { Res } from 'src/app/interfaces/response';
import { MainService } from 'src/app/services/main.service';
import { isPlatformBrowser } from '@angular/common';
import { Chart } from 'src/app/interfaces/chart';

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-status-chart',
  templateUrl: './status-chart.component.html',
  styleUrls: ['./status-chart.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class StatusChartComponent implements OnInit {
  private route = '/chart/status';
  private statusChart!: am4charts.PieChart;
  private data!: Chart[];
  public monthForm = new UntypedFormControl(moment());

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

  setMonthAndYear(
    normalizedMonthAndYear: moment.Moment,
    datepicker: MatDatepicker<moment.Moment>
  ) {
    const ctrlValue = this.monthForm.value;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.monthForm.setValue(ctrlValue);
    this.getChart();
    datepicker.close();
  }

  getChart() {
    this.mainService
      .getRequest(
        {
          month: this.monthForm.value.month() + 1,
          year: this.monthForm.value.year(),
        },
        this.route
      )
      .subscribe((res: Res) => {
        this.data = res.data;
        this.generateChart();
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
  generateChart() {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      let chart = am4core.create('chartdiv2', am4charts.PieChart);

      chart.data = this.data;

      let series = chart.series.push(new am4charts.PieSeries());

      series.dataFields.value = "total";
      series.dataFields.category = "main";

      this.statusChart = chart;
    });
  }

}
