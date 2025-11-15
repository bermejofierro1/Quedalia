import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TricoinsPage } from './tricoins.page';

const routes: Routes = [
  {
    path: '',
    component: TricoinsPage
  },  {
    path: 'add-pago',
    loadChildren: () => import('./add-pago/add-pago.module').then( m => m.AddPagoPageModule)
  },
  {
    path: 'add-tricoins',
    loadChildren: () => import('./add-tricoins/add-tricoins.module').then( m => m.AddTricoinsPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TricoinsPageRoutingModule {}
