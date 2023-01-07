import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-camera-search-form',
  templateUrl: './camera-search-form.component.html',
  styleUrls: ['../../shared/style.scss', './camera-search-form.component.scss'],
})
export class CameraSearchFormComponent implements OnInit {
  public cameraVideoStream?: MediaStream;

  constructor(private snackBar: MatSnackBar) {}

  async ngOnInit() {
    await this.initCamera();
  }

  private async initCamera() {
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
      return;
    }

    if (!stream) {
      this.snackBar.open(`カメラが使用できません`, 'OK');
      return;
    }

    this.cameraVideoStream = stream;
  }
}
