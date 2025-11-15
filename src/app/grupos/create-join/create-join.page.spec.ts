import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateJoinPage } from './create-join.page';

describe('CreateJoinPage', () => {
  let component: CreateJoinPage;
  let fixture: ComponentFixture<CreateJoinPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateJoinPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
