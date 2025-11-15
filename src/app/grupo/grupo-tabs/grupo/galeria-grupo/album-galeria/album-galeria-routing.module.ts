import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AlbumGaleriaPage } from './album-galeria.page';

const routes: Routes = [
  {
    path: '',
    component: AlbumGaleriaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlbumGaleriaPageRoutingModule {}
