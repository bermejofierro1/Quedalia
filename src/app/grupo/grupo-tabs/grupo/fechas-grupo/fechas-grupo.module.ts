import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FechasGrupoPageRoutingModule } from './fechas-grupo-routing.module';

import { FechasGrupoPage } from './fechas-grupo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FechasGrupoPageRoutingModule
  ],
  declarations: [FechasGrupoPage]
})
export class FechasGrupoPageModule {}
