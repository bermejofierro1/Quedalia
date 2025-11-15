import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerificarCorreoPage } from './verificar-correo.page';

describe('VerificarCorreoPage', () => {
  let component: VerificarCorreoPage;
  let fixture: ComponentFixture<VerificarCorreoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerificarCorreoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
