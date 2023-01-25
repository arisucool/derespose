import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { lastValueFrom, timer } from 'rxjs';
import { PoseFile } from 'src/app/poses/interfaces/pose-file';
import { OnPoseSearchCompleted } from 'src/app/poses/interfaces/pose-search-event';
import { PoseSearchService } from 'src/app/poses/services/pose-search.service';
import { PoseTagsService } from 'src/app/poses/services/pose-tags.service';

@Component({
  selector: 'app-tag-search-ctrl',
  templateUrl: './tag-search-ctrl.component.html',
  styleUrls: ['./tag-search-ctrl.component.scss'],
})
export class TagSearchCtrlComponent {
  @Input()
  public tagName?: string = '';

  @Output()
  public onPoseSearchStarted: EventEmitter<void> = new EventEmitter();

  @Output()
  public onPoseSearchCompleted: EventEmitter<OnPoseSearchCompleted> =
    new EventEmitter();

  public poseSet?: PoseFile;

  constructor(
    private poseSearchService: PoseSearchService,
    private poseTagsService: PoseTagsService,
    private snackBar: MatSnackBar,
  ) {}

  async ngOnInit() {
    this.poseSearch();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['tagName']) {
      await this.poseSearch();
    }
  }

  async poseSearch() {
    if (this.tagName === undefined) {
      return;
    }

    console.log(`[TagSearchCtrl] poseSearch`, this.tagName);
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
