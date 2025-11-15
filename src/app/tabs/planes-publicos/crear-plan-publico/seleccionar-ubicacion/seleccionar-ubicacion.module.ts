import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SeleccionarUbicacionPageRoutingModule } from './seleccionar-ubicacion-routing.module';

import { SeleccionarUbicacionPage } from './seleccionar-ubicacion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SeleccionarUbicacionPageRoutingModule
  ],
  declarations: [SeleccionarUbicacionPage]
})
export class SeleccionarUbicacionPageModule {}
