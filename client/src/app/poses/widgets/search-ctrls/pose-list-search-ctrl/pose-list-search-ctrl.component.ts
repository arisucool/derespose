import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { PoseList } from 'src/.api-client/models/pose-list';
import { PoseListsService } from 'src/app/poses/services/pose-lists.service';

@Component({
  selector: 'app-pose-list-search-ctrl',
  templateUrl: './pose-list-search-ctrl.component.html',
  styleUrls: ['./pose-list-search-ctrl.component.scss'],
})
export class PoseListSearchCtrlComponent implements OnInit, OnChanges {
  @Input()
  public poseListId?: string;

  public poseList?: PoseList;

  constructor(private poseListsService: PoseListsService) {}

  async ngOnInit() {
    this.load();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['poseListId']) {
      await this.load();
    }
  }

  async load() {
    if (this.poseListId === undefined) {
      return;
    }

    console.log(`[PoseListSearchCtrl] load`, this.poseListId);
    this.poseList = await this.poseListsService.getPoseList(this.poseListId);
    console.log(
      `[PoseListSearchCtrl] load - Found`,
      this.poseListId,
      this.poseList,
    );
  }
}
