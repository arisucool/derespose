import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { lastValueFrom, timer } from 'rxjs';
import { DetectedPose } from '../../interfaces/detected-pose';
import { MatchedPose } from '../../interfaces/matched-pose';
import { PoseFile } from '../../interfaces/pose-file';
import { PoseSearchService } from '../../services/pose-search.service';
import { PoseTagsService } from '../../services/pose-tags.service';
import { CameraSearchCtrlComponent } from '../../widgets/search-ctrls/camera-search-ctrl/camera-search-ctrl.component';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['../../../shared/style.scss', './search-page.component.scss'],
})
export class SearchPageComponent implements OnInit {
  // 検索モード
  public searchMode?: 'camera' | 'tag' | 'poseSet' | 'poseList';

  // カメラでポーズ検索するときの子コンポーネント
  @ViewChild('cameraSearchCtrl')
  public cameraSearchCtrlComponent?: CameraSearchCtrlComponent;

  // 検索対象 (ポーズ・タグ・ファイル・ポーズリスト)
  public searchTarget?: {
    pose?: DetectedPose;
    tag?: string;
    poseSet?: PoseFile;
    poseListId?: string;
  };

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
    const routeParams = this.activatedRoute.snapshot.params;
    console.log(routeParams);
    if (routeParams['tagName']) {
      this.searchMode = 'tag';
      this.searchTarget = {
        tag: routeParams['tagName'],
      };
      this.onSearchTargetTagDecided(routeParams['tagName']);
    } else if (routeParams['poseSetName']) {
      this.searchMode = 'poseSet';
      this.searchTarget = {
        poseSet: await this.poseSearchService.getPoseFile(
          routeParams['poseSetName'],
        ),
      };
      this.onSearchTargetFileDecided(routeParams['poseSetName']);
    } else if (routeParams['poseListId']) {
      this.searchMode = 'poseList';
      this.searchTarget = {
        poseListId: routeParams['poseListId'],
      };
    } else {
      this.searchMode = 'camera';
      this.state = 'initializing';
      this.poseSearchService.loadPoseFiles();
    }
  }

  public async onRetryPhotoShootStarted(event: any) {
    console.log(`[SearchPageComponent] onRetryPhotoShootStarted`);
    this.searchTarget = undefined;
    this.matchedPoses = [];
    this.state = 'standby';
    this.spinner.hide();
  }

  public async onSearchTargetPoseDecided(searchTargetPoses: DetectedPose[]) {
    console.log(
      `[SearchPageComponent] onSearchTargetPoseDecided`,
      searchTargetPoses,
    );
    this.searchTarget = {
      pose: searchTargetPoses[0],
    };

    this.state = 'searching';
    this.spinner.show();

    // 少し待つ
    await lastValueFrom(timer(300));

    // ポーズを検索
    let matchedPoses = await this.poseSearchService.searchPoseByPose(
      searchTargetPoses,
    );

    // 各ポーズのタグを取得
    matchedPoses = await this.setTagsToPoses(matchedPoses);

    if (matchedPoses.length === 0) {
      // ポーズが一件も見つからなければ
      this.searchTarget = undefined;
      if (this.cameraSearchCtrlComponent) {
        // もう一度撮影
        this.cameraSearchCtrlComponent.retryPhotoShootCountdown();
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

  public async onSearchTargetFileDecided(poseFileName: string) {
    this.state = 'searching';
    this.spinner.show();

    // 少し待つ
    await lastValueFrom(timer(200));

    // ポーズを検索
    let matchedPoses: MatchedPose[] = [];
    try {
      matchedPoses = await this.poseSearchService.getPosesByFileName(
        poseFileName,
      );
    } catch (e: any) {
      this.snackBar.open('エラー: ポーズの取得に失敗しました', 'OK');
      console.error(e);
    }

    // 各ポーズのタグを取得
    matchedPoses = await this.setTagsToPoses(matchedPoses);

    this.state = 'completed';
    this.spinner.hide();

    // ポーズのリストを反映
    this.matchedPoses = matchedPoses;
  }

  public async setTagsToPoses(
    matchedPoses: MatchedPose[],
  ): Promise<MatchedPose[]> {
    if (0 == matchedPoses.length) {
      return [];
    }

    try {
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

        if (poseWithPoseTags.tags === undefined) {
          continue;
        }

        const tagNames = [];
        for (const poseTag of poseWithPoseTags.tags) {
          tagNames.push(poseTag.name);
        }
        matchedPose.tags = tagNames;
      }
    } catch (e) {
      this.snackBar.open('エラー: タグの取得に失敗しました', 'OK');
      console.error(e);
    }
    return matchedPoses;
  }
}
