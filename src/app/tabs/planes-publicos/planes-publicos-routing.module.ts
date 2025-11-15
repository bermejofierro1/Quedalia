import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlanesPublicosPage } from './planes-publicos.page';

const routes: Routes = [
  {
    path: '',
    component: PlanesPublicosPage
  },  {
    path: 'detalles',
    loadChildren: () => import('./detalles/detalles.module').then( m => m.DetallesPageModule)
  },
  {
    path: 'crear-plan-publico',
    loadChildren: () => import('./crear-plan-publico/crear-plan-publico.module').then( m => m.CrearPlanPublicoPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanesPublicosPageRoutingModule {}
