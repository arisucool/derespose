import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { lastValueFrom, timer } from 'rxjs';
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

    // 読み込み中表示を開始
    this.onPoseSearchStarted.emit();
    await lastValueFrom(timer(100));

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
