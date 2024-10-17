import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-currency-format',
  template: `{{ value | currency:'USD':'symbol':'1.2-2' }}`,
})
export class CurrencyFormatComponent implements ICellRendererAngularComp {
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
