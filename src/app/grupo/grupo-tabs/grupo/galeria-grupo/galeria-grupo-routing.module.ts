import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GaleriaGrupoPage } from './galeria-grupo.page';

const routes: Routes = [
  {
    path: '',
    component: GaleriaGrupoPage
  },  {
    path: 'album-galeria',
    loadChildren: () => import('./album-galeria/album-galeria.module').then( m => m.AlbumGaleriaPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GaleriaGrupoPageRoutingModule {}
