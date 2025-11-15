import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JoinGrupoPage } from './join-grupo.page';

const routes: Routes = [
  {
    path: '',
    component: JoinGrupoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JoinGrupoPageRoutingModule {}
