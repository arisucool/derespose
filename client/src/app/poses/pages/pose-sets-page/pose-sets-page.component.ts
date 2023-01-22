import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PoseFile } from '../../interfaces/pose-file';
import { PoseSearchService } from '../../services/pose-search.service';

@Component({
  selector: 'app-pose-sets-page',
  templateUrl: './pose-sets-page.component.html',
  styleUrls: ['../../../shared/style.scss', './pose-sets-page.component.scss'],
})
export class PoseSetsPageComponent implements OnInit {
  // ポーズセットの種別
  public poseSetsType?: 'song' | 'commonPose' | 'chanpokuPose' = undefined;

  // ポーズセットのリスト
  public poseSets?: { [key: string]: PoseFile } = undefined;

  // テンプレートで使用する関数
  public objectKeys = Object.keys;

  constructor(
    private activatedRoute: ActivatedRoute,
    private poseSearchService: PoseSearchService,
  ) {}

  async ngOnInit() {
    if (this.activatedRoute.snapshot.queryParams['type']) {
      this.poseSetsType = this.activatedRoute.snapshot.queryParams['type'] as
        | 'song'
        | 'commonPose'
        | 'chanpokuPose';
    }

    this.load();
  }

  async load() {
    const allPoseSets = await this.poseSearchService.getPoseFiles();
    if (!allPoseSets) return;

    if (this.poseSetsType === undefined) {
      this.poseSets = allPoseSets;
      return;
    }

    const poseSets: { [key: string]: PoseFile } = {};
    for (const poseSetName of Object.keys(allPoseSets)) {
      if (allPoseSets[poseSetName].type === this.poseSetsType) {
        poseSets[poseSetName] = allPoseSets[poseSetName];
      }
    }

    this.poseSets = poseSets;
  }
}
