import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GrupoTabsPage } from './grupo-tabs.page';

describe('GrupoTabsPage', () => {
  let component: GrupoTabsPage;
  let fixture: ComponentFixture<GrupoTabsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GrupoTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
