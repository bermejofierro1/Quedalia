import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearPlanPublicoPage } from './crear-plan-publico.page';

const routes: Routes = [
  {
    path: '',
    component: CrearPlanPublicoPage
  },  {
    path: 'seleccionar-ubicacion',
    loadChildren: () => import('./seleccionar-ubicacion/seleccionar-ubicacion.module').then( m => m.SeleccionarUbicacionPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearPlanPublicoPageRoutingModule {}
