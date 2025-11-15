import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'grupos',
        loadChildren: () => import('../grupos/list/list.module').then(m => m.ListPageModule)
      },
     
      {
        path: 'perfil',
        
        loadChildren: () => import('../perfil/ajustes/ajustes.module').then(m => m.AjustesPageModule)
      },
       {
    path: 'planes-publicos',
    loadChildren: () => import('./planes-publicos/planes-publicos.module').then( m => m.PlanesPublicosPageModule)
  },
  {
    path: 'notificaciones',
    loadChildren: () => import('./notificaciones/notificaciones.module').then( m => m.NotificacionesPageModule)
  },
      {
        path: '',
        redirectTo: 'grupos',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/grupos',
    pathMatch: 'full'
  },
  
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
