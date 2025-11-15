import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColaborativosPage } from './colaborativos.page';

describe('ColaborativosPage', () => {
  let component: ColaborativosPage;
  let fixture: ComponentFixture<ColaborativosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ColaborativosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
