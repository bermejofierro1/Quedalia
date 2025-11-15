import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddTricoinsPage } from './add-tricoins.page';

describe('AddTricoinsPage', () => {
  let component: AddTricoinsPage;
  let fixture: ComponentFixture<AddTricoinsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTricoinsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
