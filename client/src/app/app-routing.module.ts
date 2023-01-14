import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { SearchPageComponent } from './search-page/search-page.component';
import { SupportedPosesComponent } from './about-page/supported-poses/supported-poses.component';
import { FaqComponent } from './about-page/faq/faq.component';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'search/camera',
    component: SearchPageComponent,
  },
  {
    path: 'search/tag/:tagName',
    component: SearchPageComponent,
  },
  {
    path: 'about',
    component: AboutPageComponent,
  },
  {
    path: 'about/supported-poses',
    component: SupportedPosesComponent,
  },
  {
    path: 'about/faq',
    component: FaqComponent,
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
})
export class AppRoutingModule {}
