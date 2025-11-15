import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicosPage } from './publicos.page';

describe('PublicosPage', () => {
  let component: PublicosPage;
  let fixture: ComponentFixture<PublicosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
