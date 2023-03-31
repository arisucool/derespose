import { NgModule } from '@angular/core';
import { RouterModule, Routes, TitleStrategy } from '@angular/router';
import { HomePageComponent } from './home/pages/home-page/home-page.component';
import { AppTitleStrategy } from './app.title-strategy';
import { UserPageComponent } from './users/pages/user-page/user-page.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    title: undefined,
  },
  {
    path: 'users/me',
    component: UserPageComponent,
    title: 'ユーザ',
    canActivate: [AuthGuard],
  },
  {
    path: 'about',
    loadChildren: () =>
      import('./about/about.module').then((m) => m.AboutModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'poses',
    loadChildren: () =>
      import('./poses/poses.module').then((m) => m.PosesModule),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
    }),
  ],
  exports: [RouterModule],
  providers: [
    {
      provide: TitleStrategy,
      useClass: AppTitleStrategy,
    },
  ],
})
export class AppRoutingModule {}
