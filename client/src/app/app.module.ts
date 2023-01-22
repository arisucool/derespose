import { forwardRef, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchPageComponent } from './poses/pages/search-page/search-page.component';
import { HomePageComponent } from './home/pages/home-page/home-page.component';
import { CameraSearchFormComponent } from './poses/widgets/camera-search-form/camera-search-form.component';

import { MatchedPoseComponent } from './poses/widgets/matched-pose/matched-pose.component';
import { TagSearchFormComponent } from './poses/widgets/tag-search-form/tag-search-form.component';
import { FileSearchFormComponent } from './poses/widgets/file-search-form/file-search-form.component';
import { PoseSetsPageComponent } from './poses/pages/pose-sets-page/pose-sets-page.component';
import { UserPageComponent } from './users/pages/user-page/user-page.component';
import { PoseListsPageComponent } from './poses/pages/pose-lists-page/pose-lists.component';
import { MyPoseListSelectorDialogComponent } from './poses/widgets/my-pose-list-selector-dialog/my-pose-list-selector-dialog.component';
import { MyPoseListCreateDialogComponent } from './poses/widgets/my-pose-list-create-dialog/my-pose-list-create-dialog.component';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';

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
