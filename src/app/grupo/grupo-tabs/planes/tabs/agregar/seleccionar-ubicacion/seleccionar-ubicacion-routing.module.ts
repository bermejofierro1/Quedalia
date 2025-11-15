import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SeleccionarUbicacionPage } from './seleccionar-ubicacion.page';

const routes: Routes = [
  {
    path: '',
    component: SeleccionarUbicacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SeleccionarUbicacionPageRoutingModule {}
