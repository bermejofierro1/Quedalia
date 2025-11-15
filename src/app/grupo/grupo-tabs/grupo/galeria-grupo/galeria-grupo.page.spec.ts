import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GaleriaGrupoPage } from './galeria-grupo.page';

describe('GaleriaGrupoPage', () => {
  let component: GaleriaGrupoPage;
  let fixture: ComponentFixture<GaleriaGrupoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GaleriaGrupoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
