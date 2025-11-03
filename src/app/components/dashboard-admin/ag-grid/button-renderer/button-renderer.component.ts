import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'app-button-renderer',
    templateUrl: './button-renderer.component.html',
    styleUrls: ['./button-renderer.component.scss'],
    standalone: false
})
export class ButtonRendererComponent implements ICellRendererAngularComp {
  params: any;
  icon!: string;
  color!: string;
  tooltip!: string;
  agInit(params: any): void {
    this.params = params;
    this.icon = this.params.icon || null;
    this.color = this.params.color || null;
    this.tooltip = this.params.tooltip || null;

  }

  refresh(params: any): boolean {
    return true;
  }

}
