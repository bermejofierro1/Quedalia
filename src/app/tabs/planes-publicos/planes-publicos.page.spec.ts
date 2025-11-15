import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanesPublicosPage } from './planes-publicos.page';

describe('PlanesPublicosPage', () => {
  let component: PlanesPublicosPage;
  let fixture: ComponentFixture<PlanesPublicosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanesPublicosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
