import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FechasGrupoPage } from './fechas-grupo.page';

describe('FechasGrupoPage', () => {
  let component: FechasGrupoPage;
  let fixture: ComponentFixture<FechasGrupoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FechasGrupoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
