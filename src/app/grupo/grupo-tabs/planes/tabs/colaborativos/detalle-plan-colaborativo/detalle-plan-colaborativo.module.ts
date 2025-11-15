import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallePlanColaborativoPageRoutingModule } from './detalle-plan-colaborativo-routing.module';

import { DetallePlanColaborativoPage } from './detalle-plan-colaborativo.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallePlanColaborativoPageRoutingModule,
    SharedModule
  ],
  declarations: [DetallePlanColaborativoPage]
})
export class DetallePlanColaborativoPageModule {}
