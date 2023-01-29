import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { lastValueFrom, Subscription } from 'rxjs';
import { PoseList } from 'src/.api-client/models/pose-list';
import { User } from 'src/.api-client/models/user';
import { AuthService } from 'src/app/auth/services/auth.service';
import { MatchedPose } from 'src/app/poses/interfaces/matched-pose';
import { PoseListsService } from '../../services/pose-lists.service';
import { MyPoseListCreateDialogComponent } from '../my-pose-list-create-dialog/my-pose-list-create-dialog.component';

export interface MyPoseListSelectorDialogData {
  poseSetName: string;
  poseTime: number;
  pose: MatchedPose;
}

@Component({
  selector: 'app-my-pose-list-selector-dialog',
  templateUrl: './my-pose-list-selector-dialog.component.html',
  styleUrls: ['./my-pose-list-selector-dialog.component.scss'],
})
export class MyPoseListSelectorDialogComponent implements OnInit, OnDestroy {
  // 当該ポーズ
  pose?: MatchedPose;

  // 当該ユーザの全てのポーズリスト
  poseLists: { poseList: PoseList; selected: boolean }[] = [];

  // 当該ユーザがログインしているか
  isLoggedIn?: boolean;
  currentUserSubscription?: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MyPoseListSelectorDialogData,
    private poseListsService: PoseListsService,
    private matDialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
  ) {}

  async ngOnInit() {
    await this.load();

    this.currentUserSubscription = this.authService.$currentUser.subscribe(
      async (currentUser) => {
        console.log(
          `[MyPoseListSelectorDialogComponent] - currentUser updated`,
          currentUser,
        );

        // ゲスト状態からログインされた状態に変化したとき
        if (!this.isLoggedIn && currentUser) {
          await this.load();
        }
      },
    );
  }

  ngOnDestroy(): void {
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
  }

  async load() {
    this.isLoggedIn = this.authService.isLoggedIn();

    this.pose = this.data.pose;

    const poseLists = await this.poseListsService.getMyPoseLists();
    this.poseLists = [];
    for (const poseList of poseLists) {
      const p = poseList.poses?.find((pose) => {
        if (
          pose.poseSetName === this.data.poseSetName &&
          pose.time === this.pose?.time
        ) {
          return true;
        }
        return false;
      });
      this.poseLists.push({ poseList, selected: p ? true : false });
    }
  }

  async createPoseList() {
    const ref = this.matDialog.open(MyPoseListCreateDialogComponent);
    const result = await lastValueFrom(ref.afterClosed());

    console.log(`[MyPoseListSelectorDialogComponent] - createPoseList`, result);
    if (result?.event !== 'close' || !result?.data?.poseList) return;

    this.poseLists.push({
      poseList: result.data.poseList,
      selected: true,
    });

    if (!this.pose) return;

    try {
      await this.poseListsService.addPoseFromList(
        result.data.poseList.id,
        this.pose?.poseSetName,
        this.pose?.time,
      );
    } catch (e: any) {
      console.error(e);
      this.snackBar.open(`エラー: ${e.error.message}`, 'OK');
      return;
    }

    this.snackBar.open(
      `ポーズリストへ追加しました: ${result.data.poseList.title}`,
      undefined,
      { duration: 2000 },
    );
  }

  async onSelectionChanges(poseListId: string, value: boolean) {
    if (!this.pose) return;

    const poseList = await this.getPoseListByPoseListId(poseListId);
    if (!poseList) return;

    const messageText = value
      ? 'ポーズリストへ追加しています...'
      : 'ポーズリストから削除しています...';
    const message = this.snackBar.open(
      messageText + poseList.title,
      undefined,
      { duration: 2000 },
    );

    try {
      if (value) {
        await this.poseListsService.addPoseFromList(
          poseListId,
          this.pose.poseSetName,
          this.pose.time,
        );
      } else {
        await this.poseListsService.removePoseFromList(
          poseListId,
          this.pose.poseSetName,
          this.pose.time,
        );
      }
    } catch (e: any) {
      message.dismiss();
      console.error(e);
      this.snackBar.open(`エラー: ${e.error.message}`, 'OK');
      return;
    }

    message.dismiss();
    if (value) {
      this.snackBar.open(
        `ポーズリストへ追加しました: ${poseList.title}`,
        undefined,
        { duration: 2000 },
      );
    } else {
      this.snackBar.open(
        `ポーズリストから削除しました: ${poseList.title}`,
        undefined,
        { duration: 2000 },
      );
    }
  }

  async getPoseListByPoseListId(poseListId: string) {
    const item = this.poseLists.find((p) => p.poseList.id === poseListId);
    if (!item) return;
    return item?.poseList;
  }
}
