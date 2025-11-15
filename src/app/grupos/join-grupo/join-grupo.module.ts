import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JoinGrupoPageRoutingModule } from './join-grupo-routing.module';

import { JoinGrupoPage } from './join-grupo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JoinGrupoPageRoutingModule
  ],
  declarations: [JoinGrupoPage]
})
export class JoinGrupoPageModule {}
