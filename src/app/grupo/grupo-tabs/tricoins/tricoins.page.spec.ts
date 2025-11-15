import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TricoinsPage } from './tricoins.page';

describe('TricoinsPage', () => {
  let component: TricoinsPage;
  let fixture: ComponentFixture<TricoinsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TricoinsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
