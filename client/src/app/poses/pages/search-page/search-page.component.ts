import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NgxSpinnerService } from 'ngx-spinner';
import { lastValueFrom, timer } from 'rxjs';
import { MatchedPose } from '../../interfaces/matched-pose';
import { OnPoseSearchCompleted } from '../../interfaces/pose-search-event';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['../../../shared/style.scss', './search-page.component.scss'],
})
export class SearchPageComponent implements OnInit {
  // 検索モード
  public searchMode?: 'camera' | 'tag' | 'poseSet' | 'poseList';

  // 検索対象 (ポーズ・タグ・ファイル・ポーズリスト)
  public searchTarget?: {
    tag?: string;
    poseSetName?: string;
    poseListId?: string;
  };

  // 状態
  public state: 'initializing' | 'initialized' | 'searching' | 'completed' =
    'initializing';

  // 検索結果
  public matchedPoses?: MatchedPose[] = [];

  // デレスポナビを実行しているかどうか
  public isRunningNavi = false;

  // 端末のOS
  public deviceOS?: string;

  constructor(
    public deviceDetectorService: DeviceDetectorService,
    private changeDetectionRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
  ) {}

  async ngOnInit() {
    this.state = 'initializing';

    const routeParams = this.activatedRoute.snapshot.params;
    if (routeParams['tagName']) {
      this.searchMode = 'tag';
      this.searchTarget = {
        tag: routeParams['tagName'],
      };
    } else if (routeParams['poseSetName']) {
      this.searchMode = 'poseSet';
      this.searchTarget = {
        poseSetName: routeParams['poseSetName'],
      };
    } else if (routeParams['poseListId']) {
      this.searchMode = 'poseList';
      this.searchTarget = {
        poseListId: routeParams['poseListId'],
      };
    } else {
      this.searchMode = 'camera';
      this.searchTarget = {};
    }

    this.deviceOS = this.deviceDetectorService.getDeviceInfo().os;

    this.changeDetectionRef.detectChanges();
  }

  /**
   * ポーズ検索が初期化されたとき
   * (CameraSearchCtrl などの一部のコンポーネントから呼び出される)
   */
  public async onPoseSearchInitialized() {
    this.matchedPoses = [];
    this.state = 'initialized';
    this.spinner.hide();
  }

  /**
   * ポーズ検索が開始されたとき
   * (CameraSearchCtrl、PoseListSearchCtrl、PoseTagSearchCtrl、PoseSetSearchCtrl などのコンポーネントから呼び出される)
   */
  public async onPoseSearchStarted() {
    this.matchedPoses = [];
    this.state = 'searching';
    this.spinner.show();
  }

  /**
   * ポーズ検索が完了したとき
   * (CameraSearchCtrl、PoseListSearchCtrl、PoseTagSearchCtrl、PoseSetSearchCtrl などのコンポーネントから呼び出される)
   * @param event イベント
   */
  public async onPoseSearchCompleted(event: OnPoseSearchCompleted) {
    this.matchedPoses = event.poses;
    this.state = 'completed';
    this.spinner.hide();
  }
}
