import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddTricoinsPage } from './add-tricoins.page';

const routes: Routes = [
  {
    path: '',
    component: AddTricoinsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddTricoinsPageRoutingModule {}
