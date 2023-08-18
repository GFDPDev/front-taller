import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TecnicoDialogComponent } from './tecnico-dialog.component';

describe('TecnicoDialogComponent', () => {
  let component: TecnicoDialogComponent;
  let fixture: ComponentFixture<TecnicoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TecnicoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TecnicoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
