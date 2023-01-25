import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { lastValueFrom, timer } from 'rxjs';
import { PoseList } from 'src/.api-client/models/pose-list';
import { AuthService } from 'src/app/auth/services/auth.service';
import { MatchedPose } from 'src/app/poses/interfaces/matched-pose';
import { OnPoseSearchCompleted } from 'src/app/poses/interfaces/pose-search-event';
import { PoseListsService } from 'src/app/poses/services/pose-lists.service';
import { PoseSearchService } from 'src/app/poses/services/pose-search.service';
import { PoseTagsService } from 'src/app/poses/services/pose-tags.service';
import { AppDialogService } from 'src/app/shared/services/app-dialog.service';

@Component({
  selector: 'app-pose-list-search-ctrl',
  templateUrl: './pose-list-search-ctrl.component.html',
  styleUrls: [
    '../../../../shared/style.scss',
    './pose-list-search-ctrl.component.scss',
  ],
})
export class PoseListSearchCtrlComponent implements OnInit {
  @Input()
  public poseListId?: string;

  @Output()
  public onPoseSearchStarted: EventEmitter<void> = new EventEmitter();

  @Output()
  public onPoseSearchCompleted: EventEmitter<OnPoseSearchCompleted> =
    new EventEmitter();

  // ポーズリスト
  public poseList?: PoseList;

  // ポーズリストの作成者かどうか
  public isMyPoseList?: boolean;

  // ポーズリストを変更中かどうか
  public isRequestingUpdatePoseList: boolean = false;

  constructor(
    private poseSearchService: PoseSearchService,
    private poseTagsService: PoseTagsService,
    private poseListsService: PoseListsService,
    private appDialogService: AppDialogService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router,
  ) {}

  async ngOnInit() {
    this.poseSearch();
  }

  async poseSearch() {
    console.log(`[PoseListSearchCtrl] poseSearch`, this.poseListId);
    if (this.poseListId === undefined) {
      return;
    }

    // 読み込み中表示を開始
    this.onPoseSearchStarted.emit();
    await lastValueFrom(timer(100));

    // ポーズリストを取得
    try {
      this.poseList = await this.poseListsService.getPoseList(this.poseListId);
    } catch (e: any) {
      if (e.status === 404) {
        this.snackBar.open(
          'エラー: 指定されたポーズリストが存在しません',
          'OK',
        );
      } else {
        this.snackBar.open('エラー: ポーズリストの取得に失敗しました', 'OK');
      }
      console.error(e);
      this.onPoseSearchCompleted.emit({
        poses: [],
      });
      return;
    }

    // ポーズリストの作成者かどうかを判定
    const currentUser = await this.authService.getCurrentUser();
    if (currentUser && currentUser.id === this.poseList?.user.id) {
      this.isMyPoseList = true;
    } else {
      this.isMyPoseList = false;
    }

    // ポーズを検索
    let matchedPoses: MatchedPose[] = [];
    try {
      matchedPoses = await this.poseSearchService.getPosesByPoseListId(
        this.poseListId,
      );
    } catch (e: any) {
      this.snackBar.open('エラー: ポーズの取得に失敗しました', 'OK');
      console.error(e);
    }

    // 各ポーズのタグを取得
    matchedPoses = await this.poseTagsService.setTagsToPoses(matchedPoses);

    // 完了
    this.onPoseSearchCompleted.emit({
      poses: matchedPoses,
    });
  }

  /**
   * ポーズリストの公開モードのトグル
   */
  public async togglePublicModeOfPoseList() {
    if (!this.poseList) {
      return;
    }

    this.isRequestingUpdatePoseList = true;
    const message = this.snackBar.open(
      `ポーズリストを変更しています... お待ちください...`,
    );

    const publicMode =
      this.poseList.publicMode === 'public' ? 'sharedByUrl' : 'public';

    try {
      this.poseList = await this.poseListsService.setPublicModeOfPoseList(
        this.poseList,
        publicMode,
      );
    } catch (e: any) {
      message.dismiss();
      this.snackBar.open('エラー: ポーズリストの変更に失敗しました', 'OK');
      console.error(e);
      this.isRequestingUpdatePoseList = false;
    }

    message.dismiss();
    this.snackBar.open('ポーズリストを変更しました', undefined, {
      duration: 2000,
    });
    this.isRequestingUpdatePoseList = false;
  }

  /**
   * ポーズリストの削除
   */
  public async deletePoseList() {
    console.log(`[PoseListSearchCtrl] deletePoseList`);
    if (!this.poseList) {
      return;
    }

    const result = await this.appDialogService.openConfirmDialog(
      'ポーズリストの削除 - ' + this.poseList.title,
      'この操作は取り消しできません。本当に削除しますか？',
      {
        positiveButtonLabel: '削除',
        positiveButtonColor: 'warn',
        negativeButtonLabel: 'キャンセル',
        autoFocus: false,
      },
    );
    if (!result) {
      return;
    }

    this.isRequestingUpdatePoseList = true;
    const message = this.snackBar.open(
      `ポーズリストを削除しています... お待ちください...`,
    );

    try {
      await this.poseListsService.deletePoseList(this.poseList.id);
    } catch (e: any) {
      message.dismiss();
      this.snackBar.open('エラー: ポーズリストの削除に失敗しました', 'OK');
      console.error(e);
      this.isRequestingUpdatePoseList = false;
    }

    message.dismiss();
    this.snackBar.open('ポーズリストを削除しました', undefined, {
      duration: 5000,
    });
    this.isRequestingUpdatePoseList = false;

    // マイポーズ一覧へ遷移
    this.router.navigate(['/poses/pose-lists'], {
      queryParams: {
        userId: 'me',
      },
    });
  }
}
