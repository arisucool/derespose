import { Component, OnInit } from '@angular/core';
import { PoseTag } from 'src/.api-client/models/pose-tag';
import { MatchedPose } from '../../interfaces/matched-pose';
import { PoseSearchService } from '../../services/pose-search.service';
import { PoseTagsService } from '../../services/pose-tags.service';

@Component({
  selector: 'app-pose-tags-page',
  templateUrl: './pose-tags-page.component.html',
  styleUrls: ['../../../shared/style.scss', './pose-tags-page.component.scss'],
})
export class PoseTagsPageComponent implements OnInit {
  representivePoses?: MatchedPose[];

  constructor(private poseTagsService: PoseTagsService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.representivePoses = await this.poseTagsService.getRepresentivePoses();
  }
}
