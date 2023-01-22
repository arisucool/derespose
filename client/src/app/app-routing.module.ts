import { NgModule } from '@angular/core';
import { RouterModule, Routes, TitleStrategy } from '@angular/router';
import { HomePageComponent } from './home/pages/home-page/home-page.component';
import { AboutPageComponent } from './about/pages/about-page/about-page.component';
import { SearchPageComponent } from './poses/pages/search-page/search-page.component';
import { SupportedPosesPageComponent } from './about/pages/supported-poses-page/supported-poses-page.component';
import { FaqPageComponent } from './about/pages/faq-page/faq-page.component';
import { AppTitleStrategy } from './app.title-strategy';
import { PoseSetsPageComponent } from './pose-sets/pages/pose-sets-page/pose-sets-page.component';
import { AuthPageComponent } from './auth/pages/auth-page/auth-page.component';
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
    path: 'about',
    component: AboutPageComponent,
    title: 'Derespose について',
  },
  {
    path: 'about/supported-poses',
    component: SupportedPosesPageComponent,
    title: 'ポーズの対応状況',
  },
  {
    path: 'about/faq',
    component: FaqPageComponent,
    title: 'FAQ',
  },
  {
    path: 'auth/login',
    component: AuthPageComponent,
    title: 'ログイン',
  },
  {
    path: 'auth/callback',
    component: AuthPageComponent,
    title: 'ログイン',
  },
  {
    path: 'users/me',
    component: UserPageComponent,
    title: 'ユーザ',
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
