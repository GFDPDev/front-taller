import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternosComponent } from './externos.component';

describe('ExternosComponent', () => {
  let component: ExternosComponent;
  let fixture: ComponentFixture<ExternosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExternosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExternosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
