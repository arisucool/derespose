import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PoseExtractorService } from 'ngx-mp-pose-extractor';
import { interval, Subscription } from 'rxjs';
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

  // 撮影結果を親コンポーネントに渡すための EventEmitter
  @Output()
  public onSearchTargetPoseDecided: EventEmitter<DetectedPose> = new EventEmitter();

  // カメラ映像のストリーム
  public cameraVideoStream?: MediaStream;

  // 最新のポーズ検出結果
  public cameraPosePreviewStream?: MediaStream;
  public currentPosePreviewImageDataUrl?: string;
  public currentPose?: DetectedPose;

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
    | 'completed' = 'initializing';

  // 撮影までのカウントダウン
  public readonly COUNT_DOWN_SECONDS = 3;
  public countdownRemainSeconds = this.COUNT_DOWN_SECONDS;
  private countdownTimerSubscription?: Subscription;

  constructor(
    private snackBar: MatSnackBar,
    private poseExtractorService: PoseExtractorService,
  ) {}

  async ngOnInit() {
    await this.initCamera();
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
    await this.onCameraVideoFrame();

    this.cameraPosePreviewStream =
      this.poseExtractorService.getPosePreviewMediaStream();
  }

  public startPhotoShootCountdown() {
    if (!this.cameraVideoStream) return;
    console.log(`[CameraSearchFormComponent] startPhotoShootCountdown`);

    this.searchTargetPoseImageDataUrl = undefined;
    this.countdownRemainSeconds = this.COUNT_DOWN_SECONDS;

    this.state = 'countdown';

    this.countdownTimerSubscription = interval(1000).subscribe(() => {
      if (1 <= this.countdownRemainSeconds) {
        this.countdownRemainSeconds--;
        return;
      }

      this.countdownTimerSubscription?.unsubscribe();
      this.state = 'processing';
      this.searchPose();
    });
  }

  public cancelPhotoShootCountdown() {
    if (this.countdownTimerSubscription) {
      this.countdownTimerSubscription.unsubscribe();
    }
    this.searchTargetPoseImageDataUrl = undefined;
    this.state = 'standby';
  }

  private async onCameraVideoFrame() {
    const videoElement = this.cameraVideoElement?.nativeElement;
    if (!videoElement) return;

    if (
      videoElement.paused ||
      videoElement.ended ||
      this.state === 'completed'
    ) {
      setTimeout(() => {
        this.onCameraVideoFrame();
      }, 500);
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
  }

  private searchPose() {
    this.searchTargetPose = this.currentPose;
    this.searchTargetPoseImageDataUrl =
      this.currentPosePreviewImageDataUrl + '';
    this.state = 'completed';
    this.onSearchTargetPoseDecided.emit(this.searchTargetPose);
  }
}
