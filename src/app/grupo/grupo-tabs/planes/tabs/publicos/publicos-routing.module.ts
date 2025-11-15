import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PublicosPage } from './publicos.page';

const routes: Routes = [
  {
    path: '',
    component: PublicosPage
  },  {
    path: 'detalle-plan-publico',
    loadChildren: () => import('./detalle-plan-publico/detalle-plan-publico.module').then( m => m.DetallePlanPublicoPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicosPageRoutingModule {}
