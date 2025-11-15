import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AjustesPage } from './ajustes.page';

const routes: Routes = [
  {
    path: '',
    component: AjustesPage
  },  {
    path: 'favoritos',
    loadChildren: () => import('./favoritos/favoritos.module').then( m => m.FavoritosPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AjustesPageRoutingModule {}
