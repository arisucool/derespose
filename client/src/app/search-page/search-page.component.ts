import { Component, OnInit } from '@angular/core';
import { DetectedPose } from '../shared/detected-pose';
import { MatchedPose } from '../shared/matched-pose';
import { PoseSearchService } from '../shared/pose-search.service';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['../shared/style.scss', './search-page.component.scss'],
})
export class SearchPageComponent implements OnInit {
  public searchTargetPose?: DetectedPose;

  public matchedPoses?: MatchedPose[] = [
    {
      id: 1000,
      title: 'お願い！シンデレラ',
      timeSeconds: 10,
      score: 0.9,
      isFavorite: false,
      tags: ['手を振る', '考える'],
    },
    {
      id: 1000,
      title: 'お願い！シンデレラ',
      timeSeconds: 10,
      score: 0.9,
      isFavorite: false,
      tags: ['手を振る', '考える'],
    },
    {
      id: 1000,
      title: 'お願い！シンデレラ',
      timeSeconds: 10,
      score: 0.9,
      isFavorite: false,
      tags: ['手を振る', '考える'],
    },
    {
      id: 1000,
      title: 'お願い！シンデレラ',
      timeSeconds: 10,
      score: 0.9,
      isFavorite: false,
      tags: ['手を振る', '考える'],
    },
    {
      id: 1000,
      title: 'お願い！シンデレラ',
      timeSeconds: 10,
      score: 0.9,
      isFavorite: false,
      tags: ['手を振る', '考える'],
    },
  ];

  constructor(private poseSearchService: PoseSearchService) {}

  async ngOnInit() {
    this.poseSearchService.loadPoseFiles();
  }

  public async onSearchTargetPoseDecided(searchTargetPoses: DetectedPose[]) {
    console.log(
      `[SearchPageComponent] onSearchTargetPoseDecided`,
      searchTargetPoses,
    );
    this.searchTargetPose = searchTargetPoses[searchTargetPoses.length - 1];

    this.matchedPoses = await this.poseSearchService.searchPoseByPose(
      searchTargetPoses,
    );

    if (this.matchedPoses.length === 0) {
      // ポーズが一件も見つからなければ
      this.searchTargetPose = undefined;
    }
  }
}
