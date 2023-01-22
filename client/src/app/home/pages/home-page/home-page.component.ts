import { Component, OnInit } from '@angular/core';
import { PoseTag } from 'src/.api-client/models/pose-tag';
import { PoseTagsService } from '../../../poses/services/pose-tags.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['../../../common/style.scss', './home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  public poseTags?: PoseTag[];

  constructor(private poseTagsService: PoseTagsService) {}

  async ngOnInit() {
    this.poseTags = await this.poseTagsService.getPoseTags();
  }
}
