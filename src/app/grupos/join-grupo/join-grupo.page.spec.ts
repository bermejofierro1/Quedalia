import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JoinGrupoPage } from './join-grupo.page';

describe('JoinGrupoPage', () => {
  let component: JoinGrupoPage;
  let fixture: ComponentFixture<JoinGrupoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinGrupoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
