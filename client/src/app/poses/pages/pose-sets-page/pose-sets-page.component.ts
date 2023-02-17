import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PoseSetDefinition } from '../../interfaces/pose-set-definition';
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
  public poseSetKeys?: string[] = undefined;
  public poseSetDefinitions?: { [key: string]: PoseSetDefinition } = undefined;

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
    const allPoseSets = await this.poseSearchService.getPoseSetDefinitions();
    if (!allPoseSets) return;

    if (this.poseSetsType === undefined) {
      this.poseSetDefinitions = allPoseSets;
      return;
    }

    const poseSets: { [key: string]: PoseSetDefinition } = {};
    for (const poseSetName of Object.keys(allPoseSets)) {
      if (allPoseSets[poseSetName].type === this.poseSetsType) {
        poseSets[poseSetName] = allPoseSets[poseSetName];
      }
    }

    this.poseSetKeys = Object.keys(poseSets).sort((a, b) => {
      if (
        poseSets[a].orderInType === undefined ||
        poseSets[b].orderInType === undefined
      ) {
        return 0;
      }
      return poseSets[a].orderInType! - poseSets[b].orderInType!;
    });

    this.poseSetDefinitions = poseSets;
  }
}
