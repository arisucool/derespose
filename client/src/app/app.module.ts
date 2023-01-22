import { forwardRef, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { MaterialModule } from 'src/material.module';
import { ApiModule } from '../.api-client/api.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchPageComponent } from './poses/pages/search-page/search-page.component';
import { HomePageComponent } from './home/pages/home-page/home-page.component';
import { CameraSearchFormComponent } from './poses/widgets/camera-search-form/camera-search-form.component';

import { NgxMpPoseExtractorModule } from 'ngx-mp-pose-extractor';
import { MatchedPoseComponent } from './poses/widgets/matched-pose/matched-pose.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagSearchFormComponent } from './poses/widgets/tag-search-form/tag-search-form.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AboutPageComponent } from './about/pages/about-page/about-page.component';
import { SupportedPosesPageComponent } from './about/pages/supported-poses-page/supported-poses-page.component';
import { FaqPageComponent } from './about/pages/faq-page/faq-page.component';
import { FileSearchFormComponent } from './poses/widgets/file-search-form/file-search-form.component';
import { PoseSetsPageComponent } from './pose-sets/pages/pose-sets-page/pose-sets-page.component';
import { LoginFormComponent } from './auth/widgets/login-form/login-form.component';
import { AuthPageComponent } from './auth/pages/auth-page/auth-page.component';
import { ApiIntercepter } from './common/api.intercepter';
import { UserPageComponent } from './users/pages/user-page/user-page.component';
import { PoseListsPageComponent } from './pose-lists/pages/pose-lists-page/pose-lists.component';
import { MyPoseListSelectorDialogComponent } from './pose-lists/widgets/my-pose-list-selector-dialog/my-pose-list-selector-dialog.component';
import { MyPoseListCreateDialogComponent } from './pose-lists/widgets/my-pose-list-create-dialog/my-pose-list-create-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchPageComponent,
    HomePageComponent,
    CameraSearchFormComponent,
    MatchedPoseComponent,
    TagSearchFormComponent,
    AboutPageComponent,
    SupportedPosesPageComponent,
    FaqPageComponent,
    FileSearchFormComponent,
    PoseSetsPageComponent,
    LoginFormComponent,
    AuthPageComponent,
    UserPageComponent,
    PoseListsPageComponent,
    MyPoseListSelectorDialogComponent,
    MyPoseListCreateDialogComponent,
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
