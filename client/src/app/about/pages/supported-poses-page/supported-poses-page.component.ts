import { Component } from '@angular/core';
import { PoseFile } from 'src/app/poses/interfaces/pose-file';
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
  public poseFiles?: {
    songs: PoseFile[];
    commonPoses: PoseFile[];
    chanpokuPoses: PoseFile[];
  };

  constructor(private poseSearchService: PoseSearchService) {
    this.poseSearchService.getPoseFiles();
  }

  async ngOnInit() {
    const poseFiles = await this.poseSearchService.getPoseFiles();
    if (poseFiles === undefined) {
      return;
    }

    if (this.poseFiles === undefined) {
      this.poseFiles = {
        songs: [],
        commonPoses: [],
        chanpokuPoses: [],
      };
    }

    for (const poseFileName of Object.keys(poseFiles)) {
      const poseFile = poseFiles[poseFileName];
      switch (poseFile.type) {
        case 'song':
          this.poseFiles.songs.push(poseFile);
          break;
        case 'commonPose':
          this.poseFiles.commonPoses.push(poseFile);
          break;
        case 'chanpokuPose':
          this.poseFiles.chanpokuPoses.push(poseFile);
          break;
      }
    }
  }
}
