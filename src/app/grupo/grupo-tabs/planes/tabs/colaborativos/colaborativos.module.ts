import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ColaborativosPageRoutingModule } from './colaborativos-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ColaborativosPage } from './colaborativos.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ColaborativosPageRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [ColaborativosPage]
})
export class ColaborativosPageModule {}
