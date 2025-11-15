import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddPagoPage } from './add-pago.page';

const routes: Routes = [
  {
    path: '',
    component: AddPagoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddPagoPageRoutingModule {}
