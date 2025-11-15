import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GrupoTabsPageRoutingModule } from './grupo-tabs-routing.module';

import { GrupoTabsPage } from './grupo-tabs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GrupoTabsPageRoutingModule
  ],
  declarations: [GrupoTabsPage]
})
export class GrupoTabsPageModule {}
