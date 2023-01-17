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
import { TagSearchFormComponent } from './search-page/tag-search-form/tag-search-form.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AboutPageComponent } from './about-page/about-page.component';
import { SupportedPosesComponent } from './about-page/supported-poses/supported-poses.component';
import { FaqComponent } from './about-page/faq/faq.component';
import { FileSearchFormComponent } from './search-page/file-search-form/file-search-form.component';
import { PoseSetsPageComponent } from './pose-sets-page/pose-sets-page.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchPageComponent,
    HomePageComponent,
    CameraSearchFormComponent,
    MatchedPoseComponent,
    TagSearchFormComponent,
    AboutPageComponent,
    SupportedPosesComponent,
    FaqComponent,
    FileSearchFormComponent,
    PoseSetsPageComponent,
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
    NgxSpinnerModule.forRoot({
      type: 'ball-fussion',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
