import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlbumGaleriaPage } from './album-galeria.page';

describe('AlbumGaleriaPage', () => {
  let component: AlbumGaleriaPage;
  let fixture: ComponentFixture<AlbumGaleriaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlbumGaleriaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
