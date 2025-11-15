import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallePlanColaborativoPage } from './detalle-plan-colaborativo.page';

const routes: Routes = [
  {
    path: '',
    component: DetallePlanColaborativoPage
  },
  {
    path: 'votaciones',
    loadChildren: () => import('./votaciones/votaciones.module').then( m => m.VotacionesPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallePlanColaborativoPageRoutingModule {}
