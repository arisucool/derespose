import { Component, Input } from '@angular/core';
import { PoseFile } from 'src/app/shared/pose-file';

@Component({
  selector: 'app-file-search-form',
  templateUrl: './file-search-form.component.html',
  styleUrls: ['./file-search-form.component.scss'],
})
export class FileSearchFormComponent {
  @Input()
  public poseFile?: PoseFile;
}
