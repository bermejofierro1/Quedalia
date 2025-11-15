import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AlbumGaleriaPageRoutingModule } from './album-galeria-routing.module';

import { AlbumGaleriaPage } from './album-galeria.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AlbumGaleriaPageRoutingModule,
    SharedModule
  ],
  declarations: [AlbumGaleriaPage]
})
export class AlbumGaleriaPageModule {}
