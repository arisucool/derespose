import { NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';
import { AboutRoutingModule } from './about-routing.module';
import { AboutPageComponent } from './pages/about-page/about-page.component';
import { FaqPageComponent } from './pages/faq-page/faq-page.component';
import { SupportedPosesPageComponent } from './pages/supported-poses-page/supported-poses-page.component';

@NgModule({
  declarations: [
    AboutPageComponent,
    FaqPageComponent,
    SupportedPosesPageComponent,
  ],
  imports: [SharedModule, AboutRoutingModule],
})
export class AboutModule {}
