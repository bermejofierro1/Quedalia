import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TricoinsPageRoutingModule } from './tricoins-routing.module';

import { TricoinsPage } from './tricoins.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TricoinsPageRoutingModule,
    SharedModule
  ],
  declarations: [TricoinsPage]
})
export class TricoinsPageModule {}
