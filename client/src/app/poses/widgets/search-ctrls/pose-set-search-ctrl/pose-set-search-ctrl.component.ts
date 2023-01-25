import { Component, Input } from '@angular/core';
import { PoseFile } from 'src/app/poses/interfaces/pose-file';

@Component({
  selector: 'app-pose-set-search-ctrl',
  templateUrl: './pose-set-search-ctrl.component.html',
  styleUrls: ['./pose-set-search-ctrl.component.scss'],
})
export class PoseSetSearchCtrlComponent {
  @Input()
  public poseSet?: PoseFile;
}
