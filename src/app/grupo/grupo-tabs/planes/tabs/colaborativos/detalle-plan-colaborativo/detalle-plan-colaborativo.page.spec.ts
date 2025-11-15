import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallePlanColaborativoPage } from './detalle-plan-colaborativo.page';

describe('DetallePlanColaborativoPage', () => {
  let component: DetallePlanColaborativoPage;
  let fixture: ComponentFixture<DetallePlanColaborativoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallePlanColaborativoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
