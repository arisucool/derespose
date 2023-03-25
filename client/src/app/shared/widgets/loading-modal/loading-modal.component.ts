import { Component, OnInit } from '@angular/core';
import { PoseSearchService } from 'src/app/poses/services/pose-search.service';

@Component({
  selector: 'app-loading-modal',
  templateUrl: './loading-modal.component.html',
  styleUrls: ['./loading-modal.component.scss'],
})
export class LoadingModalComponent implements OnInit {
  public onPoseLoading$ = this.poseSearchService.onPoseLoading$;

  constructor(private poseSearchService: PoseSearchService) {}

  ngOnInit() {}
}
