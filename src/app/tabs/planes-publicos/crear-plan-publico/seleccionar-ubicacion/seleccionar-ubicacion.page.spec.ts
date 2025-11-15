import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeleccionarUbicacionPage } from './seleccionar-ubicacion.page';

describe('SeleccionarUbicacionPage', () => {
  let component: SeleccionarUbicacionPage;
  let fixture: ComponentFixture<SeleccionarUbicacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SeleccionarUbicacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
