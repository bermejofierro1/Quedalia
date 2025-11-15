import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalImagenAmpliadaComponent } from './modal-imagen-ampliada.component';

describe('ModalImagenAmpliadaComponent', () => {
  let component: ModalImagenAmpliadaComponent;
  let fixture: ComponentFixture<ModalImagenAmpliadaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalImagenAmpliadaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalImagenAmpliadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
