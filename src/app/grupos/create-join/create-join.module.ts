import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateJoinPageRoutingModule } from './create-join-routing.module';

import { CreateJoinPage } from './create-join.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateJoinPageRoutingModule
  ],
  declarations: [CreateJoinPage]
})
export class CreateJoinPageModule {}
