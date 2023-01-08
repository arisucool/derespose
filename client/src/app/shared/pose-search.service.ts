import { EventEmitter, Injectable } from '@angular/core';
import { Pose } from 'ngx-mp-pose-extractor';
import { DetectedPose } from './detected-pose';
import { MatchedPose } from './matched-pose';

@Injectable({
  providedIn: 'root',
})
export class PoseSearchService {
  public availableTags: string[] = [];
  public onAvailableTagChanged: EventEmitter<string[]> = new EventEmitter();

  public static readonly POSE_JSON_NAMES = ['0'];

  private poses?: Pose[];

  constructor() {}

  async loadPoses() {
    const poses = [];
    for (const poseJsonName of PoseSearchService.POSE_JSON_NAMES) {
      console.log(`Loading pose...`);
      try {
        const poseJson = await fetch(`assets/poses/${poseJsonName}.json`);
        const pose = new Pose();
        pose.loadJson(await poseJson.text());
        poses.push(pose);
      } catch (e: any) {
        console.error(
          `[PoseSearchService] loadPoses - Failed to load pose: ${poseJsonName}`,
          e,
        );
        throw e;
      }
    }
    this.poses = poses;
  }

  async searchPoseByPose(targetPose: DetectedPose): Promise<MatchedPose[]> {
    if (!this.poses) {
      await this.loadPoses();
    }

    if (!this.poses) {
      throw new Error('Failed to load poses');
    }

    let matchedPoses: MatchedPose[] = [];
    for (const pose of this.poses) {
      const poseItems = pose.getSimilarPoses(targetPose as any); // TODO
      console.log(
        `[PoseSearchService] - searchPoseByPose`,
        pose.getVideoName(),
        poseItems,
      );

      for (const poseItem of poseItems) {
        const matchedPose: MatchedPose = {
          id: poseItem.t,
          songName: pose.getVideoName(),
          timeSeconds: Math.floor(poseItem.t / 1000),
          score: 0,
          isFavorite: false,
          tags: [],
        };
        matchedPoses.push(matchedPose);
      }
    }

    return matchedPoses;
  }

  searchPosesByTag(tagName: string) {
    throw new Error('Method not implemented.');
  }

  addTag(id: number, tagName: string) {
    // TODO: サーバへ送信する処理
    throw new Error('Method not implemented.');

    if (!this.availableTags.includes(tagName)) {
      this.availableTags.push(tagName);
      this.onAvailableTagChanged.emit(this.availableTags);
    }
  }

  removeTag(id: number, tagName: string) {
    throw new Error('Method not implemented.');
  }
}
