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
import { OnPoseSearchCompleted } from 'src/app/poses/interfaces/pose-search-event';
import { PoseSearchFilter } from 'src/app/poses/interfaces/pose-search-filter';
import { PoseSetDefinition } from 'src/app/poses/interfaces/pose-set-definition';
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

  public poseSetDefinition?: PoseSetDefinition;

  public poseSearchFilter?: PoseSearchFilter;

  constructor(
    private poseSearchService: PoseSearchService,
    private poseTagsService: PoseTagsService,
    private snackBar: MatSnackBar,
  ) {}

  async ngOnInit() {
    this.searchPoses();
  }

  async searchPoses() {
    console.log(`[PoseSetSearchCtrl] poseSearch`, this.poseSetName);
    if (this.poseSetName === undefined) {
      return;
    }

    // 読み込み中表示を開始
    this.onPoseSearchStarted.emit();
    await lastValueFrom(timer(200));

    // ポーズセットを取得
    this.poseSetDefinition = await this.poseSearchService.getPoseSetDefinition(
      this.poseSetName,
    );

    // ポーズおよびタグを検索
    let matchedPoses: MatchedPose[] = [];
    try {
      // ポーズを検索
      matchedPoses = await this.poseSearchService.getPosesByPoseSetName(
        this.poseSetName,
      );
      // 各ポーズのタグを取得
      matchedPoses = await this.poseTagsService.setTagsToPoses(matchedPoses);
    } catch (e: any) {
      console.error(e);
      const message = this.snackBar.open(
        'エラー: ポーズの検索に失敗しました',
        '再試行',
      );
      message.onAction().subscribe(() => {
        this.searchPoses();
      });
      return;
    }

    // ポーズをフィルタ
    if (this.poseSearchFilter !== undefined) {
      if (this.poseSearchFilter.faceExpression === 'unknown') {
        matchedPoses = matchedPoses.filter((matchedPose) => {
          return !matchedPose.faceExpression;
        });
      } else if (this.poseSearchFilter.faceExpression !== 'all') {
        matchedPoses = matchedPoses.filter((matchedPose) => {
          return (
            matchedPose.faceExpression &&
            matchedPose.faceExpression.top.label ===
              this.poseSearchFilter!.faceExpression
          );
        });
      }
    }

    // 完了
    this.onPoseSearchCompleted.emit({
      poses: matchedPoses,
    });
  }

  public onFilterChanged(event: PoseSearchFilter) {
    this.poseSearchFilter = event;
    this.searchPoses();
  }
}
