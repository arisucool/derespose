import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { DetectedPose } from '../shared/detected-pose';
import { MatchedPose } from '../shared/matched-pose';
import { PoseSearchService } from '../shared/pose-search.service';
import { CameraSearchFormComponent } from './camera-search-form/camera-search-form.component';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['../shared/style.scss', './search-page.component.scss'],
})
export class SearchPageComponent implements OnInit {
  @ViewChild('cameraSearchForm')
  public cameraSearchFormComponent?: CameraSearchFormComponent;

  public searchTargetPose?: DetectedPose;

  public matchedPoses?: MatchedPose[] = [];

  constructor(private poseSearchService: PoseSearchService) {}

  async ngOnInit() {
    this.poseSearchService.loadPoseFiles();
  }

  public async onSearchTargetPoseDecided(searchTargetPoses: DetectedPose[]) {
    console.log(
      `[SearchPageComponent] onSearchTargetPoseDecided`,
      searchTargetPoses,
    );
    this.searchTargetPose = searchTargetPoses[searchTargetPoses.length - 1];

    this.matchedPoses = await this.poseSearchService.searchPoseByPose(
      searchTargetPoses,
    );

    if (this.matchedPoses.length === 0) {
      // ポーズが一件も見つからなければ
      this.searchTargetPose = undefined;
      if (this.cameraSearchFormComponent) {
        this.cameraSearchFormComponent.retryPhotoShootCountdown();
      }
    }
  }
}
