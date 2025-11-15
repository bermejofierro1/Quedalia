import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GrupoPage } from './grupo.page';

const routes: Routes = [
  {
    path: '',
    component: GrupoPage
  },
  {
    path: 'fechas',
    loadChildren: () => import('./fechas-grupo/fechas-grupo.module').then( m => m.FechasGrupoPageModule)
  },  {
    path: 'galeria-grupo',
    loadChildren: () => import('./galeria-grupo/galeria-grupo.module').then( m => m.GaleriaGrupoPageModule)
  },


 

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GrupoPageRoutingModule {}
