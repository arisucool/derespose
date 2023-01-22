import { NgModule } from '@angular/core';
import { RouterModule, Routes, TitleStrategy } from '@angular/router';
import { HomePageComponent } from './home/pages/home-page/home-page.component';
import { SearchPageComponent } from './poses/pages/search-page/search-page.component';
import { AppTitleStrategy } from './app.title-strategy';
import { PoseSetsPageComponent } from './pose-sets/pages/pose-sets-page/pose-sets-page.component';
import { UserPageComponent } from './users/pages/user-page/user-page.component';
import { PoseListsPageComponent } from './pose-lists/pages/pose-lists-page/pose-lists.component';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    title: undefined,
  },
  {
    path: 'search/camera',
    component: SearchPageComponent,
    title: '自分でポーズを取って探す',
  },
  {
    path: 'search/tag/:tagName',
    component: SearchPageComponent,
    title: 'タグでポーズを探す',
  },
  {
    path: 'pose-sets',
    component: PoseSetsPageComponent,
    title: 'ポーズの一覧',
  },
  {
    path: 'pose-sets/:poseFileName',
    component: SearchPageComponent,
    title: 'ポーズの一覧',
  },
  {
    path: 'pose-lists',
    component: PoseListsPageComponent,
  },
  {
    path: 'pose-lists/:poseListId',
    component: SearchPageComponent,
    title: 'ポーズリスト',
  },
  {
    path: 'users/me',
    component: UserPageComponent,
    title: 'ユーザ',
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
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
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
