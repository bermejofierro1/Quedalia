import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearPlanPublicoPage } from './crear-plan-publico.page';

describe('CrearPlanPublicoPage', () => {
  let component: CrearPlanPublicoPage;
  let fixture: ComponentFixture<CrearPlanPublicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearPlanPublicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
