import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternosDialogComponent } from './externos-dialog.component';

describe('ExternosDialogComponent', () => {
  let component: ExternosDialogComponent;
  let fixture: ComponentFixture<ExternosDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExternosDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExternosDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
