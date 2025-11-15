import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FechasGrupoPage } from './fechas-grupo.page';

const routes: Routes = [
  {
    path: '',
    component: FechasGrupoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FechasGrupoPageRoutingModule {}
