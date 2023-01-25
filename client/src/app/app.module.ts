import { forwardRef, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './home/pages/home-page/home-page.component';

import { UserPageComponent } from './users/pages/user-page/user-page.component';
import { SharedModule } from './shared/shared.module';

import { ApiModule } from '../.api-client/api.module';
import { ApiIntercepter } from './shared/api.intercepter';

@NgModule({
  declarations: [AppComponent, HomePageComponent, UserPageComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    ApiModule.forRoot({
      rootUrl: '',
    }),
    SharedModule,
  ],
  providers: [
    ApiIntercepter,
    {
      provide: HTTP_INTERCEPTORS,
      useExisting: forwardRef(() => ApiIntercepter),
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
