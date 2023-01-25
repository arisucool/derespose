import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { lastValueFrom, timer } from 'rxjs';
import { MatchedPose } from 'src/app/poses/interfaces/matched-pose';
import { PoseSet } from 'src/app/poses/interfaces/pose-set';
import { OnPoseSearchCompleted } from 'src/app/poses/interfaces/pose-search-event';
import { PoseSearchService } from 'src/app/poses/services/pose-search.service';
import { PoseTagsService } from 'src/app/poses/services/pose-tags.service';

@Component({
  selector: 'app-pose-set-search-ctrl',
  templateUrl: './pose-set-search-ctrl.component.html',
  styleUrls: ['./pose-set-search-ctrl.component.scss'],
})
export class PoseSetSearchCtrlComponent implements OnInit {
  @Input()
  public poseSetName?: string;

  @Output()
  public onPoseSearchStarted: EventEmitter<void> = new EventEmitter();

  @Output()
  public onPoseSearchCompleted: EventEmitter<OnPoseSearchCompleted> =
    new EventEmitter();

  public poseSet?: PoseSet;

  constructor(
    private poseSearchService: PoseSearchService,
    private poseTagsService: PoseTagsService,
    private snackBar: MatSnackBar,
  ) {}

  async ngOnInit() {
    this.poseSearch();
  }

  async poseSearch() {
    console.log(`[PoseSetSearchCtrl] poseSearch`, this.poseSetName);
    if (this.poseSetName === undefined) {
      return;
    }

    this.onPoseSearchStarted.emit();

    // 少し待つ
    await lastValueFrom(timer(200));

    // ポーズセットを取得
    this.poseSet = await this.poseSearchService.getPoseSet(this.poseSetName);

    // ポーズを検索
    let matchedPoses: MatchedPose[] = [];
    try {
      matchedPoses = await this.poseSearchService.getPosesByPoseSetName(
        this.poseSetName,
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
