import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallePlanPublicoPage } from './detalle-plan-publico.page';

const routes: Routes = [
  {
    path: '',
    component: DetallePlanPublicoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallePlanPublicoPageRoutingModule {}
