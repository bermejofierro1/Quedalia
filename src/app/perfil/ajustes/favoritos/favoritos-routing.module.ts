import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FavoritosPage } from './favoritos.page';

const routes: Routes = [
  {
    path: '',
    component: FavoritosPage
  },  {
    path: 'detalles',
    loadChildren: () => import('./detalles/detalles.module').then( m => m.DetallesPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FavoritosPageRoutingModule {}
