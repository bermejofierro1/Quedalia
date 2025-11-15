import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VotacionesPage } from './votaciones.page';

describe('VotacionesPage', () => {
  let component: VotacionesPage;
  let fixture: ComponentFixture<VotacionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VotacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
