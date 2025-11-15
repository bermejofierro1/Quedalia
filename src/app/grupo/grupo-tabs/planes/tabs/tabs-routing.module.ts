import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: '',
        redirectTo: 'publicos',
        pathMatch: 'full',
      },
      {
        path: 'publicos',
        loadChildren: () =>
          import('./publicos/publicos.module').then(
            (m) => m.PublicosPageModule
          ),
      },
      {
        path: 'colaborativos',
        loadChildren: () =>
          import('./colaborativos/colaborativos.module').then(
            (m) => m.ColaborativosPageModule
          ),
      },
      {
        path: 'agregar',
        loadChildren: () => import('./agregar/agregar.module').then(m => m.AgregarPageModule)
      },



    ],
  },




];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule { }
