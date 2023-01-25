import { Component } from '@angular/core';
import { PoseSet } from 'src/app/poses/interfaces/pose-set';
import { PoseSearchService } from 'src/app/poses/services/pose-search.service';

@Component({
  selector: 'app-supported-poses-page',
  templateUrl: './supported-poses-page.component.html',
  styleUrls: [
    '../../../shared/style.scss',
    '../../about.scss',
    './supported-poses-page.component.scss',
  ],
})
export class SupportedPosesPageComponent {
  public poseSets?: {
    songs: PoseSet[];
    commonPoses: PoseSet[];
    chanpokuPoses: PoseSet[];
  };

  constructor(private poseSearchService: PoseSearchService) {
    this.poseSearchService.getPoseSets();
  }

  async ngOnInit() {
    const poseSets = await this.poseSearchService.getPoseSets();
    if (poseSets === undefined) {
      return;
    }

    if (this.poseSets === undefined) {
      this.poseSets = {
        songs: [],
        commonPoses: [],
        chanpokuPoses: [],
      };
    }

    for (const poseSetName of Object.keys(poseSets)) {
      const poseSet = poseSets[poseSetName];
      switch (poseSet.type) {
        case 'song':
          this.poseSets.songs.push(poseSet);
          break;
        case 'commonPose':
          this.poseSets.commonPoses.push(poseSet);
          break;
        case 'chanpokuPose':
          this.poseSets.chanpokuPoses.push(poseSet);
          break;
      }
    }
  }
}
