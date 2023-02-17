import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  NgxMpPoseExtractorModule,
  PoseExtractorService,
} from 'ngx-mp-pose-extractor';

import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { PosesRoutingModule } from './poses-routing.module';
import { MatchedPoseComponent } from './widgets/matched-pose/matched-pose.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { MyPoseListCreateDialogComponent } from './widgets/my-pose-list-create-dialog/my-pose-list-create-dialog.component';
import { MyPoseListSelectorDialogComponent } from './widgets/my-pose-list-selector-dialog/my-pose-list-selector-dialog.component';
import { PoseListsPageComponent } from './pages/pose-lists-page/pose-lists.component';
import { PoseSetsPageComponent } from './pages/pose-sets-page/pose-sets-page.component';
import { CameraSearchCtrlComponent } from './widgets/search-ctrls/camera-search-ctrl/camera-search-ctrl.component';
import { PoseListSearchCtrlComponent } from './widgets/search-ctrls/pose-list-search-ctrl/pose-list-search-ctrl.component';
import { PoseTagSearchCtrlComponent } from './widgets/search-ctrls/pose-tag-search-ctrl/pose-tag-search-ctrl.component';
import { PoseSetSearchCtrlComponent } from './widgets/search-ctrls/pose-set-search-ctrl/pose-set-search-ctrl.component';
import { NaviComponent } from './widgets/navi/navi.component';
import { PoseTagsPageComponent } from './pages/pose-tags-page/pose-tags-page.component';

@NgModule({
  declarations: [
    SearchPageComponent,
    MatchedPoseComponent,
    MyPoseListCreateDialogComponent,
    MyPoseListSelectorDialogComponent,
    PoseListsPageComponent,
    PoseSetsPageComponent,
    CameraSearchCtrlComponent,
    PoseListSearchCtrlComponent,
    PoseTagSearchCtrlComponent,
    PoseSetSearchCtrlComponent,
    NaviComponent,
    PoseTagsPageComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    PosesRoutingModule,
    AuthModule,
    NgxMpPoseExtractorModule,
  ],
  providers: [PoseExtractorService],
  exports: [],
})
export class PosesModule {}
