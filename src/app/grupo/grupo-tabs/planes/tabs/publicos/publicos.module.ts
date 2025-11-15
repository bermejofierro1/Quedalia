import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PublicosPageRoutingModule } from './publicos-routing.module';

import { PublicosPage } from './publicos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PublicosPageRoutingModule
  ],
  declarations: [PublicosPage]
})
export class PublicosPageModule {}
