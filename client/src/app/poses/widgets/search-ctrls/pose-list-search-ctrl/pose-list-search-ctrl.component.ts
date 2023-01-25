import { Component, Input } from '@angular/core';
import { PoseList } from 'src/.api-client/models/pose-list';

@Component({
  selector: 'app-pose-list-search-ctrl',
  templateUrl: './pose-list-search-ctrl.component.html',
  styleUrls: ['./pose-list-search-ctrl.component.scss'],
})
export class PoseListSearchCtrlComponent {
  @Input()
  public poseListId?: string;
}
