import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarRef,
  SimpleSnackBar,
} from '@angular/material/snack-bar';
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
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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

  // シェアするためのブランドアイコン
  public twitterIcon = faTwitter;

  // シェアするためのURL
  public tweetUrl?: SafeUrl;

  // ポーズリストに評価をつけたかどうか
  public isVoted = false;

  constructor(
    private poseSearchService: PoseSearchService,
    private poseTagsService: PoseTagsService,
    private poseListsService: PoseListsService,
    private appDialogService: AppDialogService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router,
    private domSanitizer: DomSanitizer,
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

    // ポーズリストに評価をつけたかどうかを判定
    if (this.poseList) {
      this.isVoted = this.poseListsService.isVoted(this.poseList.id);
    }

    // シェアするためのURLを設定
    const tweetUrlParams = new URLSearchParams();
    tweetUrlParams.append(
      'text',
      `${this.poseList?.title} - デレスポAR ポーズ検索`,
    );
    tweetUrlParams.append('hashtags', 'Derespose,デレスポAR,デレステAR');
    tweetUrlParams.append(
      'url',
      `${location.origin}/poses/pose-lists/${this.poseListId}`,
    );
    tweetUrlParams.append('related', 'arisucool');
    this.tweetUrl = this.domSanitizer.bypassSecurityTrustUrl(
      `https://twitter.com/intent/tweet?${tweetUrlParams.toString()}`,
    );

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

    // ポーズセットのリストを取得
    const poseSetDefinitions =
      (await this.poseSearchService.getPoseSetDefinitions()) || {};

    // ポーズリストのポーズをソート
    matchedPoses = matchedPoses.sort((a, b) => {
      // ポーズセットの順序 ＆ ポーズのタイミングでソート
      const orderOfPoseSetOfPoseA =
        poseSetDefinitions[a.poseSetName]?.orderInType ?? 0;
      const orderOfPoseSetOfPoseB =
        poseSetDefinitions[b.poseSetName]?.orderInType ?? 0;
      return (
        orderOfPoseSetOfPoseA - orderOfPoseSetOfPoseB ||
        a.timeSeconds - b.timeSeconds
      );
    });

    // 各ポーズのタグを取得
    matchedPoses = await this.poseTagsService.setTagsToPoses(matchedPoses);

    // 完了
    this.onPoseSearchCompleted.emit({
      poses: matchedPoses,
    });
  }

  public async setPublicModeOfPoseList(publicMode: 'public' | 'sharedByUrl') {
    if (!this.poseList) {
      return;
    }

    this.isRequestingUpdatePoseList = true;
    const message = this.snackBar.open(
      `ポーズリストを変更しています... お待ちください...`,
    );

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
   * ポーズリストの公開モードのトグル
   */
  public async togglePublicModeOfPoseList() {
    if (!this.poseList) {
      return;
    }
    const publicMode =
      this.poseList.publicMode === 'public' ? 'sharedByUrl' : 'public';

    this.setPublicModeOfPoseList(publicMode);
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

  async toggleVoteOfPoseList() {
    if (!this.poseList) return;

    let message: MatSnackBarRef<SimpleSnackBar>;
    if (!this.isVoted) {
      message = this.snackBar.open(`いいねをつけています... お待ちください...`);
    } else {
      message = this.snackBar.open(
        `いいねを取り消しています... お待ちください...`,
      );
    }

    try {
      if (!this.isVoted) {
        await this.poseListsService.addVoteToPoseList(this.poseList.id);
      } else {
        await this.poseListsService.removeVoteFromPoseList(this.poseList.id);
      }
    } catch (e: any) {
      message.dismiss();
      this.snackBar.open('エラー: ' + e.message, 'OK');
      console.error(e);
      return;
    }

    message.dismiss();

    if (!this.isVoted) {
      this.snackBar.open('いいねしました', undefined, {
        duration: 2000,
      });
      this.isVoted = true;
    } else {
      this.snackBar.open('いいねを取り消しました', undefined, {
        duration: 2000,
      });
      this.isVoted = false;
    }
  }
}
