import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { lastValueFrom, timer } from 'rxjs';
import { PoseSet } from 'src/app/poses/interfaces/pose-set';
import { OnPoseSearchCompleted } from 'src/app/poses/interfaces/pose-search-event';
import { PoseSearchService } from 'src/app/poses/services/pose-search.service';
import { PoseTagsService } from 'src/app/poses/services/pose-tags.service';

@Component({
  selector: 'app-pose-tag-search-ctrl',
  templateUrl: './pose-tag-search-ctrl.component.html',
  styleUrls: ['./pose-tag-search-ctrl.component.scss'],
})
export class PoseTagSearchCtrlComponent implements OnInit {
  @Input()
  public tagName?: string = '';

  @Output()
  public onPoseSearchStarted: EventEmitter<void> = new EventEmitter();

  @Output()
  public onPoseSearchCompleted: EventEmitter<OnPoseSearchCompleted> =
    new EventEmitter();

  public poseSet?: PoseSet;

  constructor(
    private poseSearchService: PoseSearchService,
    private poseTagsService: PoseTagsService,
  ) {}

  async ngOnInit() {
    this.poseSearch();
  }

  async poseSearch() {
    console.log(`[PoseTagSearchCtrl] poseSearch`, this.tagName);
    if (this.tagName === undefined) {
      return;
    }

    this.onPoseSearchStarted.emit();

    // 少し待つ
    await lastValueFrom(timer(200));

    // ポーズを検索
    let matchedPoses = await this.poseSearchService.searchPosesByTag(
      this.tagName,
    );
    if (!matchedPoses) {
      matchedPoses = [];
    }

    // 各ポーズのタグを取得
    matchedPoses = await this.poseTagsService.setTagsToPoses(matchedPoses);

    // 完了
    this.onPoseSearchCompleted.emit({
      poses: matchedPoses,
    });
  }
}
