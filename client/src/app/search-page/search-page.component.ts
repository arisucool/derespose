import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { lastValueFrom, timer } from 'rxjs';
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
  // 検索モード
  public searchMode?: 'camera' | 'tag';

  // カメラでポーズ検索するときの子コンポーネント
  @ViewChild('cameraSearchForm')
  public cameraSearchFormComponent?: CameraSearchFormComponent;

  // 検索対象 (ポーズまたはタグ)
  public searchTargetPose?: DetectedPose;
  public searchTargetTag?: string;

  // 状態
  public state: 'initializing' | 'standby' | 'searching' | 'completed' =
    'initializing';

  // 検索結果
  public matchedPoses?: MatchedPose[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private poseSearchService: PoseSearchService,
    private poseTagsService: PoseTagsService,
    private spinner: NgxSpinnerService,
    private snackBar: MatSnackBar,
  ) {}

  async ngOnInit() {
    this.poseSearchService.loadPoseFiles();

    const routeParams = this.activatedRoute.snapshot.params;
    if (routeParams['tagName']) {
      this.searchMode = 'tag';
      this.searchTargetTag = routeParams['tagName'];
      this.onSearchTargetTagDecided(routeParams['tagName']);
    } else {
      this.searchMode = 'camera';
      this.state = 'initializing';
    }
  }

  public async onRetryPhotoShootStarted(event: any) {
    console.log(`[SearchPageComponent] onRetryPhotoShootStarted`);
    this.searchTargetPose = undefined;
    this.matchedPoses = [];
    this.state = 'standby';
    this.spinner.hide();
  }

  public async onSearchTargetPoseDecided(searchTargetPoses: DetectedPose[]) {
    console.log(
      `[SearchPageComponent] onSearchTargetPoseDecided`,
      searchTargetPoses,
    );
    this.searchTargetPose = searchTargetPoses[searchTargetPoses.length - 1];

    this.state = 'searching';
    this.spinner.show();

    // 少し待つ
    await lastValueFrom(timer(300));

    // ポーズを検索
    let matchedPoses = await this.poseSearchService.searchPoseByPose(
      searchTargetPoses,
    );

    // タグを取得
    if (0 < matchedPoses.length) {
      try {
        const posesWithPoseTags =
          await this.poseTagsService.getPosesWithPoseTags(matchedPoses);
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
      } catch (e) {
        this.snackBar.open('エラー: タグの取得に失敗しました', 'OK');
        console.error(e);
      }
    }

    if (matchedPoses.length === 0) {
      // ポーズが一件も見つからなければ
      this.searchTargetPose = undefined;
      if (this.cameraSearchFormComponent) {
        // もう一度撮影
        this.cameraSearchFormComponent.retryPhotoShootCountdown();
        this.spinner.hide();
        return;
      }
    }

    this.matchedPoses = matchedPoses;

    // 完了
    this.state = 'completed';
    this.spinner.hide();
  }

  public async onSearchTargetTagDecided(tagName: string) {
    this.state = 'searching';
    this.spinner.show();

    // 少し待つ
    await lastValueFrom(timer(200));

    // ポーズを検索
    let matchedPoses = await this.poseSearchService.searchPosesByTag(tagName);
    if (!matchedPoses) {
      matchedPoses = [];
    }

    this.state = 'completed';
    this.spinner.hide();

    // ポーズのリストを反映
    this.matchedPoses = matchedPoses;
  }
}
