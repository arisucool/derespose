import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { PosesRoutingModule } from './poses-routing.module';
import { MatchedPoseComponent } from './widgets/matched-pose/matched-pose.component';
import { CameraSearchFormComponent } from './widgets/camera-search-form/camera-search-form.component';
import { FileSearchFormComponent } from './widgets/file-search-form/file-search-form.component';
import { TagSearchFormComponent } from './widgets/tag-search-form/tag-search-form.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { MyPoseListCreateDialogComponent } from './widgets/my-pose-list-create-dialog/my-pose-list-create-dialog.component';
import { MyPoseListSelectorDialogComponent } from './widgets/my-pose-list-selector-dialog/my-pose-list-selector-dialog.component';
import { PoseListsPageComponent } from './pages/pose-lists-page/pose-lists.component';
import { PoseSetsPageComponent } from './pages/pose-sets-page/pose-sets-page.component';

@NgModule({
  declarations: [
    SearchPageComponent,
    MatchedPoseComponent,
    CameraSearchFormComponent,
    FileSearchFormComponent,
    TagSearchFormComponent,
    MyPoseListCreateDialogComponent,
    MyPoseListSelectorDialogComponent,
    PoseListsPageComponent,
    PoseSetsPageComponent,
  ],
  imports: [CommonModule, SharedModule, PosesRoutingModule, AuthModule],
  exports: [],
})
export class PosesModule {}
