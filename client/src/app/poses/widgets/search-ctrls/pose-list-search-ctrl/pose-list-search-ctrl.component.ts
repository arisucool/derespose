import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { lastValueFrom, timer } from 'rxjs';
import { PoseList } from 'src/.api-client/models/pose-list';
import { MatchedPose } from 'src/app/poses/interfaces/matched-pose';
import { OnPoseSearchCompleted } from 'src/app/poses/interfaces/pose-search-event';
import { PoseListsService } from 'src/app/poses/services/pose-lists.service';
import { PoseSearchService } from 'src/app/poses/services/pose-search.service';
import { PoseTagsService } from 'src/app/poses/services/pose-tags.service';

@Component({
  selector: 'app-pose-list-search-ctrl',
  templateUrl: './pose-list-search-ctrl.component.html',
  styleUrls: ['./pose-list-search-ctrl.component.scss'],
})
export class PoseListSearchCtrlComponent implements OnInit, OnChanges {
  @Input()
  public poseListId?: string;

  @Output()
  public onPoseSearchStarted: EventEmitter<void> = new EventEmitter();

  @Output()
  public onPoseSearchCompleted: EventEmitter<OnPoseSearchCompleted> =
    new EventEmitter();

  public poseList?: PoseList;

  constructor(
    private poseSearchService: PoseSearchService,
    private poseTagsService: PoseTagsService,
    private poseListsService: PoseListsService,
    private snackBar: MatSnackBar,
  ) {}

  async ngOnInit() {
    this.poseSearch();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['poseListId']) {
      await this.poseSearch();
    }
  }

  async poseSearch() {
    if (this.poseListId === undefined) {
      return;
    }

    console.log(`[PoseListSearchCtrl] poseSearch`, this.poseListId);
    this.poseList = await this.poseListsService.getPoseList(this.poseListId);

    this.onPoseSearchStarted.emit();

    // 少し待つ
    await lastValueFrom(timer(200));

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
}
