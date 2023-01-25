import { EventEmitter, Injectable } from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { PoseTag } from 'src/.api-client/models/pose-tag';
import { ApiService } from 'src/.api-client/services/api.service';
import { MatchedPose } from '../interfaces/matched-pose';

@Injectable({
  providedIn: 'root',
})
export class PoseTagsService {
  public onAvailablePoseTagsChanged: EventEmitter<PoseTag[]> =
    new EventEmitter();

  private poseTags?: PoseTag[];
  private isRequestingPoseTags = false;

  constructor(private apiService: ApiService) {}

  async getPoseTags(): Promise<PoseTag[]> {
    if (this.poseTags !== undefined) return this.poseTags;

    if (this.isRequestingPoseTags)
      return firstValueFrom(this.onAvailablePoseTagsChanged);
    this.isRequestingPoseTags = true;

    console.log(`[PoseTagsService] getPoseTags - Requesting...`);

    const poseTags = await lastValueFrom(
      this.apiService.poseTagsControllerGetPoseTags(),
    );
    this.poseTags = poseTags;
    this.onAvailablePoseTagsChanged.emit(poseTags);
    return poseTags;
  }

  async getPosesWithPoseTags(poses: MatchedPose[]) {
    return lastValueFrom(
      this.apiService.poseTagsControllerGetPoseTagsByPoses({
        poses: poses
          .map((pose) => `${pose.poseSetName}:${pose.time}`)
          .join(','),
      }),
    );
  }

  async addPoseTag(poseSetName: string, poseTime: number, poseTagName: string) {
    if (this.poseTags === undefined) {
      await this.getPoseTags();
    }

    let poseTags = await lastValueFrom(
      this.apiService.posesControllerAddPoseTag({
        poseSetName: poseSetName,
        poseTime: poseTime.toString(),
        poseTagName: poseTagName,
      }),
    );

    if (
      this.poseTags !== undefined &&
      !this.poseTags.find((tag) => tag.name === poseTagName)
    ) {
      this.poseTags.push({
        name: poseTagName,
      });
      this.onAvailablePoseTagsChanged.emit(this.poseTags);
    }

    return poseTags;
  }

  async removePoseTag(
    poseSetName: string,
    poseTime: number,
    poseTagName: string,
  ) {
    return await lastValueFrom(
      this.apiService.posesControllerRemovePoseTag({
        poseSetName: poseSetName,
        poseTime: poseTime.toString(),
        poseTagName: poseTagName,
      }),
    );
  }

  public async setTagsToPoses(
    matchedPoses: MatchedPose[],
  ): Promise<MatchedPose[]> {
    if (0 == matchedPoses.length) {
      return [];
    }

    const posesWithPoseTags = await this.getPosesWithPoseTags(matchedPoses);
    for (const poseWithPoseTags of posesWithPoseTags) {
      const matchedPose = matchedPoses.find((matchedPose: MatchedPose) => {
        return (
          matchedPose.poseSetName === poseWithPoseTags.poseSetName &&
          matchedPose.time === poseWithPoseTags.time
        );
      });
      if (!matchedPose) {
        continue;
      }

      if (poseWithPoseTags.tags === undefined) {
        continue;
      }

      const tagNames = [];
      for (const poseTag of poseWithPoseTags.tags) {
        tagNames.push(poseTag.name);
      }
      matchedPose.tags = tagNames;
    }
    return matchedPoses;
  }
}
