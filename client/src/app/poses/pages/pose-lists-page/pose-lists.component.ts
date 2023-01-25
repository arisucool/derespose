import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PoseList } from 'src/.api-client/models/pose-list';
import { PoseListsService } from '../../services/pose-lists.service';

@Component({
  selector: 'app-pose-lists-page',
  templateUrl: './pose-lists-page.component.html',
  styleUrls: ['../../../shared/style.scss', './pose-lists-page.component.scss'],
})
export class PoseListsPageComponent implements OnInit {
  public poseLists: PoseList[] = [];
  public userId?: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private poseListsService: PoseListsService,
  ) {}

  async ngOnInit() {
    this.userId =
      this.activatedRoute.snapshot.queryParams['userId'] &&
      this.activatedRoute.snapshot.queryParams['userId'] === 'me'
        ? 'me'
        : undefined;

    if (this.userId === 'me') {
      this.poseLists = await this.poseListsService.getMyPoseLists();
    } else {
      this.poseLists = await this.poseListsService.getPublicPoseLists();
    }
  }
}
