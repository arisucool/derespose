import { Component, OnInit } from '@angular/core';
import { PoseListsService } from '../../pose-lists.service';

@Component({
  selector: 'app-pose-lists-page',
  templateUrl: './pose-lists-page.component.html',
  styleUrls: ['../../../common/style.scss', './pose-lists-page.component.scss'],
})
export class PoseListsPageComponent implements OnInit {
  public poseLists: any[] = [];

  constructor(private poseListsService: PoseListsService) {}

  async ngOnInit() {
    this.poseLists = await this.poseListsService.getPublicPoseLists();
  }
}
