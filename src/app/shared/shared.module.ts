import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SwipeBackWrapperComponent } from './swipe-back-wrapper/swipe-back-wrapper.component';
import { ModalImagenAmpliadaComponent } from './modal-imagen-ampliada/modal-imagen-ampliada.component';
import { AppRefresherComponent } from './app-refresher/app-refresher.component';
@NgModule({
  declarations: [SwipeBackWrapperComponent,ModalImagenAmpliadaComponent,AppRefresherComponent],
  imports: [CommonModule, IonicModule],
  exports: [SwipeBackWrapperComponent,ModalImagenAmpliadaComponent,AppRefresherComponent],
   schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule {}
