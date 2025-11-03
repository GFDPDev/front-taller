import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'app-datetime-format',
    template: '{{ value | date : "dd/MM/yyyy, h:mm a" }}',
    standalone: false
})
export class DatetimeFormatComponent implements ICellRendererAngularComp {
  params: any;
  value!: number;
  constructor(){}
  agInit(params: any): void {
    this.params = params;
    this.value = this.params.value;
  }
  refresh(params: any): boolean {
    return true;
  }
}
