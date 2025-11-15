import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateJoinPage } from './create-join.page';

const routes: Routes = [
  {
    path: '',
    component: CreateJoinPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateJoinPageRoutingModule {}
