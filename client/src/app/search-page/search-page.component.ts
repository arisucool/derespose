import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { PoseTag } from 'src/.api-client/models/pose-tag';
import { DetectedPose } from '../shared/detected-pose';
import { MatchedPose } from '../shared/matched-pose';
import { PoseSearchService } from '../shared/pose-search.service';
import { PoseTagsService } from '../shared/pose-tags.service';
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

  constructor(
    private poseSearchService: PoseSearchService,
    private poseTagsService: PoseTagsService,
  ) {}

  async ngOnInit() {
    this.poseSearchService.loadPoseFiles();
  }

  public async onSearchTargetPoseDecided(searchTargetPoses: DetectedPose[]) {
    console.log(
      `[SearchPageComponent] onSearchTargetPoseDecided`,
      searchTargetPoses,
    );
    this.searchTargetPose = searchTargetPoses[searchTargetPoses.length - 1];

    // ポーズを検索
    const matchedPoses = await this.poseSearchService.searchPoseByPose(
      searchTargetPoses,
    );

    // タグを取得
    const posesWithPoseTags = await this.poseTagsService.getPosesWithPoseTags(
      matchedPoses,
    );
    for (const poseWithPoseTags of posesWithPoseTags) {
      const matchedPose = matchedPoses.find((matchedPose: MatchedPose) => {
        return (
          matchedPose.poseFileName === poseWithPoseTags.poseFileName &&
          matchedPose.time === poseWithPoseTags.time
        );
      });
      if (!matchedPose) {
        continue;
      }

      matchedPose.tags = poseWithPoseTags.tags.map((t: PoseTag) => t.name);
    }

    // ポーズのリストを反映
    this.matchedPoses = matchedPoses;
    if (this.matchedPoses.length === 0) {
      // ポーズが一件も見つからなければ
      this.searchTargetPose = undefined;
      if (this.cameraSearchFormComponent) {
        this.cameraSearchFormComponent.retryPhotoShootCountdown();
      }
    }
  }
}
