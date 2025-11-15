import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GrupoTabsPage } from './grupo-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: GrupoTabsPage,
    children:[
       {
        path: '',
        redirectTo: 'grupo',
        pathMatch: 'full'
      },
       {
    path: 'grupo',
    loadChildren: () => import('./grupo/grupo.module').then( m => m.GrupoPageModule)
  },
  {
    path: 'planes',
    loadChildren: () => import('./planes/tabs/tabs.module').then( m => m.TabsPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'tricoins',
    loadChildren: () => import('./tricoins/tricoins.module').then( m => m.TricoinsPageModule)
  }
    ]
  }

 

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GrupoTabsPageRoutingModule {}
