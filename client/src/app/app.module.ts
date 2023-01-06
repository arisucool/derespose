import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { MaterialModule } from 'src/material.module';
import { ApiModule } from '../.api-client/api.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchPageComponent } from './search-page/search-page.component';
import { HomePageComponent } from './home-page/home-page.component';

@NgModule({
  declarations: [AppComponent, SearchPageComponent, HomePageComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    ApiModule.forRoot({
      rootUrl: '',
    }),
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
