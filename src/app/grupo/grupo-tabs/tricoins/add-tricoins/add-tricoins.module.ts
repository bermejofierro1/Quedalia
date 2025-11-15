import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddTricoinsPageRoutingModule } from './add-tricoins-routing.module';

import { AddTricoinsPage } from './add-tricoins.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddTricoinsPageRoutingModule
  ],
  declarations: [AddTricoinsPage]
})
export class AddTricoinsPageModule {}
