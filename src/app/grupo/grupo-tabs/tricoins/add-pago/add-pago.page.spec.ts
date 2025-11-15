import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddPagoPage } from './add-pago.page';

describe('AddPagoPage', () => {
  let component: AddPagoPage;
  let fixture: ComponentFixture<AddPagoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPagoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
