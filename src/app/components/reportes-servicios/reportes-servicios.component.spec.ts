import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesServiciosComponent } from './reportes-servicios.component';

describe('ReportesServiciosComponent', () => {
  let component: ReportesServiciosComponent;
  let fixture: ComponentFixture<ReportesServiciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportesServiciosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesServiciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
