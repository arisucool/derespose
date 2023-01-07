import { Component, Input } from '@angular/core';
import { MatchedPose } from '../matched-pose';

@Component({
  selector: 'app-matched-pose',
  templateUrl: './matched-pose.component.html',
  styleUrls: ['../../shared/style.scss', './matched-pose.component.scss'],
})
export class MatchedPoseComponent {
  @Input()
  public pose?: MatchedPose;
}
