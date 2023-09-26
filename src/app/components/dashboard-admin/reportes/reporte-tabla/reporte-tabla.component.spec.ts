import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteTablaComponent } from './reporte-tabla.component';

describe('ReporteTablaComponent', () => {
  let component: ReporteTablaComponent;
  let fixture: ComponentFixture<ReporteTablaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteTablaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteTablaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
