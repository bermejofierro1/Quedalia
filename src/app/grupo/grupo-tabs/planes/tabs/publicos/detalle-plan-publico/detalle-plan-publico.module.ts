import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallePlanPublicoPageRoutingModule } from './detalle-plan-publico-routing.module';

import { DetallePlanPublicoPage } from './detalle-plan-publico.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallePlanPublicoPageRoutingModule
  ],
  declarations: [DetallePlanPublicoPage]
})
export class DetallePlanPublicoPageModule {}
