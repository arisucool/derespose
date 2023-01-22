import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutPageComponent } from './pages/about-page/about-page.component';
import { FaqPageComponent } from './pages/faq-page/faq-page.component';
import { SupportedPosesPageComponent } from './pages/supported-poses-page/supported-poses-page.component';

const routes: Routes = [
  {
    path: '',
    component: AboutPageComponent,
    title: 'Derespose について',
  },
  {
    path: 'supported-poses',
    component: SupportedPosesPageComponent,
    title: 'ポーズの対応状況',
  },
  {
    path: 'faq',
    component: FaqPageComponent,
    title: 'FAQ',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AboutRoutingModule {}
