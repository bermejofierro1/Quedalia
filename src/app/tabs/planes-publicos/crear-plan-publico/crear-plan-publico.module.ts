import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearPlanPublicoPageRoutingModule } from './crear-plan-publico-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CrearPlanPublicoPage } from './crear-plan-publico.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearPlanPublicoPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [CrearPlanPublicoPage]
})
export class CrearPlanPublicoPageModule {}
