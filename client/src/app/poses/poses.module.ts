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
import { PoseListSearchCtrlComponent } from './widgets/search-ctrls/pose-list-search-ctrl/pose-list-search-ctrl.component';
import { TagSearchCtrlComponent } from './widgets/search-ctrls/tag-search-ctrl/tag-search-ctrl.component';
import { CameraSearchCtrlComponent } from './widgets/search-ctrls/camera-search-ctrl/camera-search-ctrl.component';
import { PoseSetSearchCtrlComponent } from './widgets/search-ctrls/pose-set-search-ctrl/pose-set-search-ctrl.component';

@NgModule({
  declarations: [
    SearchPageComponent,
    MatchedPoseComponent,
    MyPoseListCreateDialogComponent,
    MyPoseListSelectorDialogComponent,
    PoseListsPageComponent,
    PoseSetsPageComponent,
    PoseListSearchCtrlComponent,
    TagSearchCtrlComponent,
    CameraSearchCtrlComponent,
    PoseSetSearchCtrlComponent,
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
