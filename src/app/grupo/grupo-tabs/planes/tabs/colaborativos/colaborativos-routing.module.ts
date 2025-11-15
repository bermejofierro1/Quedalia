import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ColaborativosPage } from './colaborativos.page';

const routes: Routes = [
  {
    path: '',
    component: ColaborativosPage
  },
  {
    path: 'detalle-plan-colaborativo',
    loadChildren: () => import('./detalle-plan-colaborativo/detalle-plan-colaborativo.module').then( m => m.DetallePlanColaborativoPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ColaborativosPageRoutingModule {}
