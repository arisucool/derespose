import {
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PoseExtractorService } from 'ngx-mp-pose-extractor';
import { interval, lastValueFrom, Subscription, timer } from 'rxjs';
import { ConfigService } from 'src/app/shared/config.service';
import { DetectedPose } from 'src/app/poses/interfaces/detected-pose';
import { OnPoseSearchCompleted } from 'src/app/poses/interfaces/pose-search-event';
import { PoseSearchService } from 'src/app/poses/services/pose-search.service';
import { PoseTagsService } from 'src/app/poses/services/pose-tags.service';
import { environment } from '../../../../../environments/environment';
import { MatchedPose } from 'src/app/poses/interfaces/matched-pose';
import { ViewportScroller } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-camera-search-ctrl',
  templateUrl: './camera-search-ctrl.component.html',
  styleUrls: [
    '../../../../shared/style.scss',
    './camera-search-ctrl.component.scss',
  ],
})
export class CameraSearchCtrlComponent implements OnInit, OnDestroy {
  // カメラ映像を再生するための Video 要素
  @ViewChild('cameraVideo')
  cameraVideoElement!: ElementRef<HTMLVideoElement>;

  @Output()
  public onPoseSearchInitialized: EventEmitter<void> = new EventEmitter();

  @Output()
  public onPoseSearchStarted: EventEmitter<void> = new EventEmitter();

  @Output()
  public onPoseSearchCompleted: EventEmitter<OnPoseSearchCompleted> =
    new EventEmitter();

  // ボタン
  @ViewChild('shutterButton') shutterButtonRef?: MatButton;

  // カメラ映像のストリーム
  public cameraVideoStream?: MediaStream;

  // 最新のポーズ検出結果
  public cameraPosePreviewStream?: MediaStream;
  public currentPosePreviewImageDataUrl?: string;
  public currentPose?: DetectedPose;

  // 最近のポーズ検出結果
  public readonly KEEPED_RECENTLY_POSES_MAX_COUNT = 5;
  public recentlyPoses: DetectedPose[] = [];

  // 最新のポーズ検出結果を受け取るための Subscription
  public onResultsEventEmitterSubscription?: Subscription;

  // 検索対象とするポーズ
  public searchTargetPose?: DetectedPose;
  public searchTargetPoseImageDataUrl?: string;

  // 状態
  public state:
    | 'initializing'
    | 'error'
    | 'standby'
    | 'countdown'
    | 'processing'
    | 'completed'
    | 'retrying' = 'initializing';

  // 検索対象とする範囲
  public searchPoseRange: 'all' | 'bodyPose' | 'handPose' = 'all';

  // 撮影までのカウントダウン
  public countdownSecondsForDecidePose: 3 | 10 = 3;
  public countdownRemainSeconds = this.countdownSecondsForDecidePose;
  private countdownTimerSubscription?: Subscription;

  // 撮影アニメーション
  public isEnableShutterAnimation = false;

  constructor(
    private snackBar: MatSnackBar,
    private poseExtractorService: PoseExtractorService,
    private configService: ConfigService,
    private poseSearchService: PoseSearchService,
    private poseTagsService: PoseTagsService,
    private ngZone: NgZone,
    private deviceDetectorService: DeviceDetectorService,
    private viewportScroller: ViewportScroller,
  ) {}

  async ngOnInit() {
    // カメラの初期化
    await this.initCamera();

    // 設定の読み込み
    this.countdownSecondsForDecidePose = this.configService.getConfig(
      'countdownSecondsForDecidePose',
      3,
    );

    // ポーズを検出したときのイベントリスナを設定
    this.onResultsEventEmitterSubscription =
      this.poseExtractorService.onResultsEventEmitter.subscribe(
        (results: {
          mpResults: DetectedPose;
          posePreviewImageDataUrl: string;
        }) => {
          this.onPoseDetected(
            results.mpResults,
            results.posePreviewImageDataUrl,
          );
        },
      );

    // シャッターボタンにフォーカスを当てる
    this.setFocusToShutterButton();

    // セッションの復元
    // this.restoreSession();
  }

  ngOnDestroy() {
    if (this.countdownTimerSubscription) {
      this.countdownTimerSubscription.unsubscribe();
    }
    if (this.onResultsEventEmitterSubscription) {
      this.onResultsEventEmitterSubscription.unsubscribe();
    }

    if (this.cameraVideoStream) {
      this.cameraVideoStream.getTracks().forEach((track) => track.stop());
    }

    if (this.cameraPosePreviewStream) {
      this.cameraPosePreviewStream.getTracks().forEach((track) => track.stop());
    }
  }

  async searchPoses() {
    console.log(`[CameraSearchCtrl] searchPoses`, this.recentlyPoses);

    // 読み込み中表示を開始
    this.onPoseSearchStarted.emit();
    await lastValueFrom(timer(100));

    // ポーズを検索
    let matchedPoses: MatchedPose[] = [];
    try {
      matchedPoses = await this.poseSearchService.searchPoseByPose(
        this.recentlyPoses,
        this.searchPoseRange,
      );
    } catch (e) {
      console.error(e);
      this.snackBar.open('エラー: ポーズの検索に失敗しました', 'OK');
      return;
    }

    if (!matchedPoses) {
      matchedPoses = [];
    }
    if (matchedPoses.length === 0) {
      // ポーズが一件も見つからなければ、もう一度撮影
      this.onPoseSearchInitialized.emit();
      this.retryPhotoShootCountdown();
      return;
    }

    // 各ポーズのタグを取得
    try {
      matchedPoses = await this.poseTagsService.setTagsToPoses(matchedPoses);
    } catch (e) {
      console.error(e);
      const message = this.snackBar.open(
        'エラー: タグの取得に失敗しました',
        '再試行',
      );
      message.onAction().subscribe(() => {
        this.searchPoses();
      });
    }

    console.log(`[CameraSearchCtrl] searchPoses - Found`, matchedPoses);

    // 完了
    this.ngZone.run(() => {
      this.onPoseSearchCompleted.emit({
        poses: matchedPoses,
      });
    });
  }

  public async startPhotoShootCountdown() {
    if (!this.cameraVideoStream) return;

    console.log(`[CameraSearchFormComponent] startPhotoShootCountdown`);

    // モバイル環境ならば、カメラ映像領域へスクロール
    if (this.deviceDetectorService.isMobile()) {
      timer(1000).subscribe(() => {
        this.viewportScroller.setOffset([0, 20]);
        this.viewportScroller.scrollToAnchor('videoContainer');
      });
    }

    // カメラが停止していたら、もう一度初期化
    if (this.cameraVideoElement.nativeElement.paused) {
      console.log(
        `[CameraSearchFormComponent] startPhotoShootCountdown - Restarting camera...`,
      );
      await this.initCamera();
    }

    this.onPoseSearchInitialized.emit();

    this.searchTargetPoseImageDataUrl = undefined;
    this.countdownRemainSeconds = this.countdownSecondsForDecidePose;

    this.state = 'countdown';
    this.isEnableShutterAnimation = false;

    this.countdownTimerSubscription = interval(1000).subscribe(() => {
      if (1 <= this.countdownRemainSeconds) {
        this.countdownRemainSeconds--;
        return;
      }

      this.countdownTimerSubscription?.unsubscribe();
      this.state = 'processing';
      this.isEnableShutterAnimation = true;
      this.onCountdownFinished();
    });
  }

  public async retryPhotoShootCountdown() {
    this.state = 'retrying';

    // 3秒待ってもう一度カウントダウンを開始
    this.countdownTimerSubscription = timer(3000).subscribe(async () => {
      this.countdownTimerSubscription?.unsubscribe();
      await this.initCamera();
      await this.startPhotoShootCountdown();
    });
  }

  public cancelPhotoShootCountdown() {
    if (this.countdownTimerSubscription) {
      this.countdownTimerSubscription.unsubscribe();
    }
    this.searchTargetPoseImageDataUrl = undefined;
    this.state = 'standby';
  }

  public setCountdownSecondsForDecidePose(seconds: 3 | 10) {
    this.countdownSecondsForDecidePose = seconds;
    window.localStorage.setItem(
      'deresposeConfig',
      JSON.stringify({ countdownSecondsForDecidePose: seconds }),
    );
  }

  public setSearchPoseRange(poseRange: 'all' | 'bodyPose' | 'handPose') {
    this.searchPoseRange = poseRange;

    if (this.searchTargetPose) {
      // すでに検索済みならば、再検索
      this.searchPoses();
      // シャッターボタンにフォーカスを当てる
      this.setFocusToShutterButton();
    }
  }

  private async initCamera() {
    this.state = 'initializing';

    let stream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 800,
          facingMode: 'user',
        },
        audio: false,
      });
    } catch (e: any) {
      if (e.message === 'Permission denied') {
        const message = this.snackBar.open(
          `エラー: 「カメラへのアクセス」を許可してから、ページを再読み込みしてください`,
          '再読み込み',
        );
        message.onAction().subscribe(() => {
          window.location.reload();
        });
        return;
      }
      this.snackBar.open(`カメラが使用できません... ${e.message}`, 'OK');
      this.state = 'error';
      return;
    }

    if (!stream) {
      this.snackBar.open(`カメラが使用できません`, 'OK');
      this.state = 'error';
      return;
    }

    this.cameraVideoStream = stream;
    await this.waitForCameraVideoFrame();
    await this.onCameraVideoFrame();

    this.cameraPosePreviewStream =
      this.poseExtractorService.getPosePreviewMediaStream();
  }

  private stopCamera() {
    if (this.cameraVideoStream) {
      this.cameraVideoStream.getTracks().forEach((track) => track.stop());
    }

    if (this.cameraPosePreviewStream) {
      this.cameraPosePreviewStream.getTracks().forEach((track) => track.stop());
    }

    if (this.cameraVideoElement) {
      this.cameraVideoElement.nativeElement.pause();
    }
  }

  private async onCameraVideoFrame() {
    const videoElement = this.cameraVideoElement?.nativeElement;
    if (!videoElement) return;

    if (
      videoElement.paused ||
      videoElement.ended ||
      this.state === 'completed'
    ) {
      return;
    }

    await this.poseExtractorService.onVideoFrame(videoElement);

    if (this.state === 'initializing') {
      // 初期化中から準備完了になったときは
      this.state = 'standby';
      // モバイル環境ならば、カメラ映像領域へスクロール
      if (this.deviceDetectorService.isMobile()) {
        timer(1000).subscribe(() => {
          this.viewportScroller.setOffset([0, 20]);
          this.viewportScroller.scrollToAnchor('videoContainer');
        });
      }
    }
    await new Promise(requestAnimationFrame);
    this.onCameraVideoFrame();
  }

  private onPoseDetected(
    mpResults: DetectedPose,
    posePreviewImageDataUrl: string,
  ) {
    if (this.cameraVideoElement.nativeElement.paused) {
      return;
    }

    this.currentPosePreviewImageDataUrl = posePreviewImageDataUrl;
    this.currentPose = mpResults;

    this.recentlyPoses.push(mpResults);
    if (this.KEEPED_RECENTLY_POSES_MAX_COUNT < this.recentlyPoses.length) {
      this.recentlyPoses.shift();
    }
  }

  private onCountdownFinished() {
    this.searchTargetPose = this.currentPose;
    this.searchTargetPoseImageDataUrl =
      this.currentPosePreviewImageDataUrl + '';
    this.state = 'completed';

    this.stopCamera();

    // セッションを保存
    this.saveSession();

    // 検索
    this.searchPoses();

    // シャッターボタンにフォーカスを当てる
    this.setFocusToShutterButton();
  }

  private waitForCameraVideoFrame(
    i: number = 0,
    resolver?: any,
  ): Promise<void> {
    console.log(
      `[CameraSearchFormComponent] waitForCameraVideoFrame`,
      i,
      resolver,
    );
    return new Promise((resolve) => {
      const waitTimer = setInterval(() => {
        const videoElement = this.cameraVideoElement?.nativeElement;
        if (!videoElement) return;

        if (!videoElement.paused && !videoElement.ended) {
          clearInterval(waitTimer);
          resolve();
        }
      }, 500);
    });
  }

  private setFocusToShutterButton() {
    setTimeout(() => {
      if (this.shutterButtonRef === undefined) return;
      this.shutterButtonRef.focus();
    }, 100);
  }

  private restoreSession(): boolean {
    if (environment.production) return false;

    const previousPosesJson = window.sessionStorage.getItem(
      'deresposePreviousPoses',
    );
    const previousPosePreviewImageDataUrl = window.sessionStorage.getItem(
      'deresposePreviousPosePreviewImageDataUrl',
    );
    if (!previousPosesJson || !previousPosePreviewImageDataUrl) {
      return false;
    }

    this.stopCamera();

    this.recentlyPoses = JSON.parse(previousPosesJson);

    this.currentPose = this.recentlyPoses[this.recentlyPoses.length - 1];
    this.currentPosePreviewImageDataUrl = previousPosePreviewImageDataUrl;

    this.searchTargetPose = this.currentPose;
    this.searchTargetPoseImageDataUrl =
      this.currentPosePreviewImageDataUrl + '';

    // 検索
    this.searchPoses();

    return true;
  }

  private saveSession() {
    if (environment.production) return;

    let poses: any[] = [];
    if (this.recentlyPoses.length > 0) {
      poses = this.recentlyPoses.map((pose) => {
        let p = JSON.parse(JSON.stringify(pose));
        p.image = null;
        return p;
      });
    }

    window.sessionStorage.setItem(
      'deresposePreviousPoses',
      JSON.stringify(poses),
    );
    window.sessionStorage.setItem(
      'deresposePreviousPosePreviewImageDataUrl',
      this.currentPosePreviewImageDataUrl!,
    );
  }
}
