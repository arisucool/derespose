import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatchedPose } from '../../interfaces/matched-pose';

@Component({
  selector: 'app-navi',
  templateUrl: './navi.component.html',
  styleUrls: ['./navi.component.scss'],
})
export class NaviComponent implements OnInit, OnDestroy, AfterViewInit {
  // 検索結果のポーズ
  @Input()
  poses?: MatchedPose[];

  // ナビで表示しているポーズ
  currentPoseIndex = 0;

  // ナビ映像を再生するためのビデオ要素
  @ViewChild('naviVideo')
  naviVideo?: ElementRef<HTMLVideoElement>;

  // ナビ映像の PipWindow
  naviPipWindow?: PictureInPictureWindow;

  // ナビ映像を再生しているか
  isNaviPlaying = false;

  // ナビ映像を生成するためのキャンバス要素
  naviCanvas?: HTMLCanvasElement;
  naviCanvasContext?: CanvasRenderingContext2D;

  // ナビ映像のストリーム
  naviStream?: MediaStream;

  // ナビ映像のサイズ
  naviWidth = 200;
  naviHeight = 300;

  // ポーズ画像
  poseImages: { [key: string]: HTMLImageElement } = {};

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {
    if (this.naviStream) {
      this.naviStream.getTracks().forEach((track) => track.stop());
    }
  }

  async ngAfterViewInit() {
    this.initNavi();
  }

  async startNavi() {
    if (!this.naviVideo) {
      return;
    }

    // 画像を読み込み
    this.loadPoseImages();

    if (this.naviVideo.nativeElement.paused) {
      console.log(`[NaviComponent] startNavi - resume video`);
      this.naviVideo.nativeElement.play();
    }

    console.log(`[NaviComponent] startNavi - starting draw loop...`);
    this.isNaviPlaying = true;
    this.draw(true);

    console.log(`[NaviComponent] startNavi - requestPictureInPicture...`);
    try {
      this.naviPipWindow =
        await this.naviVideo.nativeElement.requestPictureInPicture();

      this.naviPipWindow.addEventListener('leavepictureinpicture', () => {
        console.log(`[NaviComponent] leavepictureinpicture`);
        this.stopNavi();
      });
    } catch (e) {
      console.error(
        `[NaviComponent] startNavi - requestPictureInPicture failed`,
        e,
      );
      this.isNaviPlaying = false;
      return;
    }

    // イベントハンドラを設定
    // (これにより PiP 領域にボタンが表示される)
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      this.onRequestPreviousTrack();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      this.onRequestNextTrack();
    });
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      this.onRequestPreviousTrack();
    });
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      this.onRequestNextTrack();
    });
  }
  async stopNavi() {
    this.isNaviPlaying = false;
  }

  private async initNavi() {
    this.naviCanvas = document.createElement('canvas');
    this.naviCanvas.width = this.naviWidth;
    this.naviCanvas.height = this.naviHeight;

    this.naviCanvasContext = this.naviCanvas.getContext('2d') || undefined;
    if (!this.naviCanvasContext) {
      console.error(
        `[NaviComponent] initNavi - naviCanvasContext not ready...`,
      );
      return;
    }

    if (!this.naviVideo) {
      console.error(`[NaviComponent] initNavi - naviVideo not ready...`);
      return;
    }

    await this.draw();

    this.naviVideo.nativeElement.onplay = () => {
      console.log(`[NaviComponent] initNavi - onplay`);
    };

    this.naviStream = this.naviCanvas.captureStream(10);

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });

    await new Promise<void>((resolve, reject) => {
      if (!this.naviVideo) {
        console.log(`[NaviComponent] initNavi - naviVideo not ready...`);
        return reject();
      }

      this.naviVideo.nativeElement.ontimeupdate = () => {
        resolve();
      };

      console.log(`[NaviComponent] initNavi - playing...`);
      this.naviVideo.nativeElement.play();
    });
  }

  private async loadPoseImages() {
    if (!this.poses) {
      return;
    }

    for (const pose of this.poses) {
      if (!pose.imageUrl) continue;

      console.log(`[NaviComponent] loadPoseImages - Loading...`, pose.imageUrl);

      const key = `${pose.poseSetName}:${pose.id}`;
      if (this.poseImages[key]) continue;

      const image = new Image();
      const imageUrl = pose.imageUrl;
      try {
        await new Promise<HTMLImageElement>((resolve, reject) => {
          image.onload = () => {
            resolve(image);
          };
          image.onerror = () => {
            reject();
          };

          image.crossOrigin = 'Anonymous';
          image.src = imageUrl;
        });
        console.log(
          `[NaviComponent] loadPoseImages - Loaded...`,
          pose.imageUrl,
        );
        this.poseImages[`${pose.poseSetName}:${pose.id}`] = image;
      } catch (e: any) {
        console.error(
          `[NaviComponent] loadPoseImages - Failed to load image... ${imageUrl}`,
          e,
        );
      }
    }
  }

  private async draw(isLoop = false) {
    if (!this.naviCanvas || !this.naviCanvasContext) {
      return;
    }
    console.log(`[NaviComponent] draw`);

    // 領域をクリア
    this.naviCanvasContext.fillStyle = '#DDEDFF';
    this.naviCanvasContext?.fillRect(
      0,
      0,
      this.naviCanvas.width,
      this.naviCanvas.height,
    );

    if (!this.poses || this.poses.length === 0) {
      return;
    }

    // 領域サイズを取得
    const width = this.naviCanvas.width;
    const height = this.naviCanvas.height;

    const headerHeight = 50;
    const footerHeight = 50;

    // ポーズを取得
    const pose = this.poses[this.currentPoseIndex];

    // ポーズ画像を描画
    if (this.poseImages[`${pose.poseSetName}:${pose.id}`]) {
      const image = this.poseImages[`${pose.poseSetName}:${pose.id}`];
      const imageWidth = image.naturalWidth;
      const imageHeight = image.naturalHeight;
      const imageRatio = imageWidth / imageHeight;
      const canvasRatio = width / height;
      let drawWidth = width;
      let drawHeight = height;
      if (imageRatio > canvasRatio) {
        drawHeight = width / imageRatio;
      }
      if (imageRatio < canvasRatio) {
        drawWidth = height * imageRatio;
      }
      const DRAW_ZOOM = 0.8;
      drawWidth *= DRAW_ZOOM;
      drawHeight *= DRAW_ZOOM;
      this.naviCanvasContext.drawImage(
        image,
        0,
        0,
        imageWidth,
        imageHeight,
        (width - drawWidth) / 2,
        (height - drawHeight) / 2 + headerHeight * 0.3,
        drawWidth,
        drawHeight,
      );
    }

    // ポーズセット名を描画
    this.naviCanvasContext.fillStyle = '#777777aa';
    this.naviCanvasContext.fillRect(0, 0, width, headerHeight);
    this.naviCanvasContext.fillStyle = 'white';
    this.naviCanvasContext.font = '16px sans-serif';
    this.naviCanvasContext.textAlign = 'center';
    this.naviCanvasContext.textBaseline = 'middle';
    this.naviCanvasContext.fillText(pose.title, width / 2, headerHeight / 2);

    // タイミングを描画
    this.naviCanvasContext.fillStyle = '#777777aa';
    this.naviCanvasContext.fillRect(
      0,
      height - footerHeight,
      width,
      footerHeight,
    );
    this.naviCanvasContext.fillStyle = '#ffffff';
    this.naviCanvasContext.font = '18px sans-serif';
    this.naviCanvasContext.fillText(
      pose.timeSeconds + '秒頃から',
      width / 2,
      height - footerHeight / 2,
    );

    if (isLoop && this.isNaviPlaying) {
      requestAnimationFrame(() => {
        this.draw(true);
      });
    }
  }

  private onRequestNextTrack() {
    if (!this.poses) return;

    if (this.poses.length - 1 <= this.currentPoseIndex) {
      return;
    }

    this.currentPoseIndex++;
    console.log(`[NaviComponent] onRequestNextTrack - `, this.currentPoseIndex);

    this.draw();
  }

  private onRequestPreviousTrack() {
    if (!this.poses) return;
    if (this.currentPoseIndex <= 0) {
      return;
    }

    this.currentPoseIndex--;
    console.log(
      `[NaviComponent] onRequestPreviousTrack - `,
      this.currentPoseIndex,
    );

    this.draw();
  }
}
