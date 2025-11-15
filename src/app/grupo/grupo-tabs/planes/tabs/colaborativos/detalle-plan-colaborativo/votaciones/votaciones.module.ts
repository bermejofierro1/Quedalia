import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VotacionesPageRoutingModule } from './votaciones-routing.module';

import { VotacionesPage } from './votaciones.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VotacionesPageRoutingModule,
    SharedModule
  ],
  declarations: [VotacionesPage]
})
export class VotacionesPageModule {}
