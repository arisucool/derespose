import { Component } from '@angular/core';
import { PoseSetDefinition } from 'src/app/poses/interfaces/pose-set-definition';
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
  public poseSetDefinitions?: {
    songs: PoseSetDefinition[];
    commonPoses: PoseSetDefinition[];
    chanpokuPoses: PoseSetDefinition[];
  };

  constructor(private poseSearchService: PoseSearchService) {
    this.poseSearchService.getPoseSetDefinitions();
  }

  async ngOnInit() {
    const poseSets = await this.poseSearchService.getPoseSetDefinitions();
    if (poseSets === undefined) {
      return;
    }

    if (this.poseSetDefinitions === undefined) {
      this.poseSetDefinitions = {
        songs: [],
        commonPoses: [],
        chanpokuPoses: [],
      };
    }

    for (const poseSetName of Object.keys(poseSets)) {
      const poseSetDefinition = poseSets[poseSetName];
      switch (poseSetDefinition.type) {
        case 'song':
          this.poseSetDefinitions.songs.push(poseSetDefinition);
          break;
        case 'commonPose':
          this.poseSetDefinitions.commonPoses.push(poseSetDefinition);
          break;
        case 'chanpokuPose':
          this.poseSetDefinitions.chanpokuPoses.push(poseSetDefinition);
          break;
      }
    }
  }
}
