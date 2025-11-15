import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [authGuard],

  },


  {
    path: 'login',
    loadChildren: () => import('./auth/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./auth/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'forgot-password',
    canActivate: [authGuard],
    loadChildren: () => import('./auth/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'list',
    canActivate: [authGuard],
    loadChildren: () => import('./grupos/list/list.module').then( m => m.ListPageModule)
  },
  {
    path: 'create-join',
    canActivate: [authGuard],
    loadChildren: () => import('./grupos/create-join/create-join.module').then( m => m.CreateJoinPageModule)
  },
   
  {
    path: 'ajustes',
    canActivate: [authGuard],
    loadChildren: () => import('./perfil/ajustes/ajustes.module').then( m => m.AjustesPageModule)
  },
 
  {
    path: 'join-grupo',
     canActivate: [authGuard],
    loadChildren: () => import('./grupos/join-grupo/join-grupo.module').then( m => m.JoinGrupoPageModule)
  },
 
 

  {
    path: 'grupo/tabs',
     canActivate: [authGuard],
    loadChildren: () => import('./grupo/grupo-tabs/grupo-tabs.module').then( m => m.GrupoTabsPageModule)
  },
  {
    path: 'verificar-correo',
    loadChildren: () => import('./auth/verificar-correo/verificar-correo.module').then( m => m.VerificarCorreoPageModule)
  },



 


  
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
