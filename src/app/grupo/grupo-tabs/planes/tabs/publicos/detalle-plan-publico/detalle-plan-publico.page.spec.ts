import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallePlanPublicoPage } from './detalle-plan-publico.page';

describe('DetallePlanPublicoPage', () => {
  let component: DetallePlanPublicoPage;
  let fixture: ComponentFixture<DetallePlanPublicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallePlanPublicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
