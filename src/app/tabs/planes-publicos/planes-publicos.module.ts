import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlanesPublicosPageRoutingModule } from './planes-publicos-routing.module';

import { PlanesPublicosPage } from './planes-publicos.page';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlanesPublicosPageRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [PlanesPublicosPage]
})
export class PlanesPublicosPageModule {}
