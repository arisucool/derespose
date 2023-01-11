import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PoseExtractorService } from 'ngx-mp-pose-extractor';
import { interval, Subscription, timer } from 'rxjs';
import { ConfigService } from 'src/app/shared/config.service';
import { DetectedPose } from 'src/app/shared/detected-pose';

@Component({
  selector: 'app-camera-search-form',
  templateUrl: './camera-search-form.component.html',
  styleUrls: ['../../shared/style.scss', './camera-search-form.component.scss'],
  providers: [PoseExtractorService],
})
export class CameraSearchFormComponent implements OnInit, OnDestroy {
  // カメラ映像を再生するための Video 要素
  @ViewChild('cameraVideo')
  cameraVideoElement!: ElementRef<HTMLVideoElement>;

  // 撮影結果を親コンポーネントに知らせるための EventEmitter
  @Output()
  public onSearchTargetPoseDecided: EventEmitter<DetectedPose[]> =
    new EventEmitter();

  // 再撮影が開始されたときに親コンポーネントに知らせるための EventEmitter
  @Output()
  public onRetryPhotoShootStarted: EventEmitter<number> = new EventEmitter();

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
  public searchTargetPose: any;
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

  public async startPhotoShootCountdown() {
    if (!this.cameraVideoStream) return;

    console.log(`[CameraSearchFormComponent] startPhotoShootCountdown`);

    if (this.cameraVideoElement.nativeElement.paused) {
      console.log(
        `[CameraSearchFormComponent] startPhotoShootCountdown - Restarting camera...`,
      );
      await this.initCamera();
    }

    this.onRetryPhotoShootStarted.emit(1);

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
      this.searchPose();
    });
  }

  public async retryPhotoShootCountdown() {
    this.state = 'retrying';

    // 3秒待ってもう一度カウントダウンを開始
    this.countdownTimerSubscription = timer(
      this.countdownSecondsForDecidePose,
    ).subscribe(async () => {
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
      this.state = 'standby';
    }
    await new Promise(requestAnimationFrame);
    this.onCameraVideoFrame();
  }

  private onPoseDetected(
    mpResults: DetectedPose,
    posePreviewImageDataUrl: string,
  ) {
    this.currentPosePreviewImageDataUrl = posePreviewImageDataUrl;
    this.currentPose = mpResults;

    this.recentlyPoses.push(mpResults);
    if (this.KEEPED_RECENTLY_POSES_MAX_COUNT < this.recentlyPoses.length) {
      this.recentlyPoses.shift();
    }
  }

  private searchPose() {
    this.searchTargetPose = this.currentPose;
    this.searchTargetPoseImageDataUrl =
      this.currentPosePreviewImageDataUrl + '';
    this.state = 'completed';
    this.onSearchTargetPoseDecided.emit(this.recentlyPoses);

    this.stopCamera();

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
}
