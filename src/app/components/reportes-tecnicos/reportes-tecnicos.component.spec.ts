import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesTecnicosComponent } from './reportes-tecnicos.component';

describe('ReportesTecnicosComponent', () => {
  let component: ReportesTecnicosComponent;
  let fixture: ComponentFixture<ReportesTecnicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportesTecnicosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesTecnicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
