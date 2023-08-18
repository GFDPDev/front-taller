import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpressAdminComponent } from './express-admin.component';

describe('ExpressAdminComponent', () => {
  let component: ExpressAdminComponent;
  let fixture: ComponentFixture<ExpressAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpressAdminComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpressAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
