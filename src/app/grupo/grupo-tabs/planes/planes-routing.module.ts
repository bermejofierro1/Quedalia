import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlanesPage } from './planes.page';

const routes: Routes = [
  {
    path: '',
    component: PlanesPage,
    children: [
      {
        path: '',
        redirectTo: 'tabs',
        pathMatch: 'full',
      },
      {
        path: 'tabs',
        loadChildren: () =>
          import('./tabs/tabs.module').then((m) => m.TabsPageModule),
      },
    ],
  },
  

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanesPageRoutingModule {}
