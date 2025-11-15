import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddPagoPageRoutingModule } from './add-pago-routing.module';

import { AddPagoPage } from './add-pago.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddPagoPageRoutingModule
  ],
  declarations: [AddPagoPage]
})
export class AddPagoPageModule {}
