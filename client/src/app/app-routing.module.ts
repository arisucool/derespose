import { NgModule } from '@angular/core';
import { RouterModule, Routes, TitleStrategy } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { SearchPageComponent } from './search-page/search-page.component';
import { SupportedPosesComponent } from './about-page/supported-poses/supported-poses.component';
import { FaqComponent } from './about-page/faq/faq.component';
import { AppTitleStrategy } from './app.title-strategy';
import { PoseSetsPageComponent } from './pose-sets-page/pose-sets-page.component';

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
    component: SupportedPosesComponent,
    title: 'ポーズの対応状況',
  },
  {
    path: 'about/faq',
    component: FaqComponent,
    title: 'FAQ',
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
