import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GaleriaGrupoPageRoutingModule } from './galeria-grupo-routing.module';

import { GaleriaGrupoPage } from './galeria-grupo.page';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GaleriaGrupoPageRoutingModule,
    SharedModule
   
    
  ],
  declarations: [GaleriaGrupoPage]
})
export class GaleriaGrupoPageModule {}
