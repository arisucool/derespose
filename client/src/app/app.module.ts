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
import { CameraSearchFormComponent } from './search-page/camera-search-form/camera-search-form.component';

import { NgxMpPoseExtractorModule } from 'ngx-mp-pose-extractor';
import { MatchedPoseComponent } from './shared/matched-pose/matched-pose.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    SearchPageComponent,
    HomePageComponent,
    CameraSearchFormComponent,
    MatchedPoseComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    ApiModule.forRoot({
      rootUrl: '',
    }),
    AppRoutingModule,
    NgxMpPoseExtractorModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
