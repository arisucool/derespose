import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
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
  naviVideoContainer?: HTMLElement;
  naviVideo?: HTMLVideoElement;

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
  static readonly NAVI_ASPECT_RATIO = 16 / 9;
  static readonly NAVI_WIDTH = 200;
  static readonly NAVI_HEIGHT =
    NaviComponent.NAVI_WIDTH * NaviComponent.NAVI_ASPECT_RATIO;

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
    try {
      await this.initNavi();
    } catch (e) {
      console.error(`[NaviComponent] ngAfterViewInit - failed`, e);
    }
  }

  async startNavi() {
    if (!this.naviVideo) {
      console.error(`[NaviComponent] startNavi - naviVideo not ready...`);
      return;
    }

    // 画像を読み込み
    this.loadPoseImages();

    // 描画ループを開始
    console.log(`[NaviComponent] startNavi - starting draw loop...`);
    this.isNaviPlaying = true;
    this.draw(true);

    // ビデオ要素で再生を開始
    console.log(`[NaviComponent] startNavi - play...`);
    document.body.appendChild(this.naviVideo);
    this.naviVideo.play();
    this.updateMediaSession();

    // PiP を開始
    console.log(`[NaviComponent] startNavi - requestPictureInPicture...`);
    try {
      this.naviPipWindow = await this.naviVideo.requestPictureInPicture();
      this.updateMediaSession();
    } catch (e) {
      console.error(
        `[NaviComponent] startNavi - requestPictureInPicture failed`,
        e,
      );
      this.isNaviPlaying = false;
      return;
    }
  }

  async stopNavi() {
    this.isNaviPlaying = false;
  }

  private async updateMediaSession() {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'Dummy',
      artist: 'Dummy',
      album: 'Dummy',
      artwork: [
        {
          src: '/assets/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    });
    navigator.mediaSession.setActionHandler('play', async () => {
      this.onRequestNextTrack();
    });
    navigator.mediaSession.setActionHandler('pause', async () => {
      this.onRequestNextTrack();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      this.onRequestPreviousTrack();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      this.onRequestNextTrack();
    });
  }

  private async initNavi() {
    // キャンバスを生成
    this.naviCanvas = document.createElement('canvas');
    this.naviCanvas.width = NaviComponent.NAVI_WIDTH;
    this.naviCanvas.height = NaviComponent.NAVI_HEIGHT;
    this.naviCanvasContext = this.naviCanvas.getContext('2d') || undefined;
    if (!this.naviCanvasContext) {
      console.error(
        `[NaviComponent] initNavi - naviCanvasContext not ready...`,
      );
      return;
    }

    // 初回の描画
    await this.draw();

    // ストリームを生成
    this.naviStream = this.naviCanvas.captureStream(10);

    // ビデオ要素を生成
    this.naviVideo = document.createElement('video');
    this.naviVideo.width = NaviComponent.NAVI_WIDTH;
    this.naviVideo.height = NaviComponent.NAVI_HEIGHT;
    this.naviVideo.muted = true;
    this.naviVideo.playsInline = true;
    this.naviVideo.controls = true;
    this.naviVideo.srcObject = this.naviStream;
    this.naviVideo.style.position = 'absolute';
    this.naviVideo.style.top = '0';
    this.naviVideo.style.left = '0';

    // ビデオ要素のイベントハンドラを設定
    // (Safari では PiP において nexttrack / previoustrack による操作ができないため、一時停止で次のポーズへ遷移する)
    this.naviVideo.onpause = () => {
      console.log(`[NaviComponent] onpause`);
      this.onRequestNextTrack();
      this.naviVideo?.play();
    };

    // 再生開始まで待機
    await new Promise<void>((resolve, reject) => {
      if (!this.naviVideo || !this.naviStream) {
        return reject();
      }
      this.naviVideo.ontimeupdate = () => {
        //console.log(`[NaviComponent] initNavi - ontimeupdate`);
        resolve();
      };
      console.log(`[NaviComponent] initNavi - play...`, this.naviStream);
      this.naviVideo.play().catch((e) => {
        console.error(`[NaviComponent] initNavi - play failed`, e);
        reject(e);
      });
    });

    // PiP を開始・終了したときのイベントハンドラを設定
    this.naviVideo.onenterpictureinpicture = () => {
      if (!this.naviVideo) return;
      console.log(`[NaviComponent] onenterpictureinpicture`);
      //this.naviVideo.style.display = 'none';
    };
    this.naviVideo.onleavepictureinpicture = () => {
      if (!this.naviVideo) return;
      console.log(`[NaviComponent] onleavepictureinpicture`);
      //this.naviVideo.remove();
    };
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
        this.poseImages[key] = image;
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
      console.error(`[NaviComponent] draw - naviCanvas not ready...`);
      return;
    }
    console.log(`[NaviComponent] draw`);

    // 領域をクリア
    this.naviCanvasContext.fillStyle = '#DDEDFF';
    this.naviCanvasContext.fillRect(
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

    // 状態を描画
    this.naviCanvasContext.fillText(
      `${new Date().getSeconds()}`,
      width - 20,
      height - footerHeight / 2,
    );

    if (isLoop && this.isNaviPlaying) {
      requestAnimationFrame(() => {
        this.draw(true);
      });
    }
  }

  private async onRequestNextTrack() {
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
