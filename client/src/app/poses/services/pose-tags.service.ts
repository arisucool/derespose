import { EventEmitter, Injectable } from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { PoseTag } from 'src/.api-client/models/pose-tag';
import { ApiService } from 'src/.api-client/services/api.service';
import { MatchedPose } from '../interfaces/matched-pose';
import { PoseSearchService } from './pose-search.service';

@Injectable({
  providedIn: 'root',
})
export class PoseTagsService {
  public onAvailablePoseTagsChanged: EventEmitter<PoseTag[]> =
    new EventEmitter();

  private poseTags?: PoseTag[];
  private isRequestingPoseTags = false;

  constructor(
    private apiService: ApiService,
    private poseSearchService: PoseSearchService,
  ) {}

  async getPoseTags(): Promise<PoseTag[]> {
    if (this.poseTags !== undefined) return this.poseTags;

    if (this.isRequestingPoseTags)
      return firstValueFrom(this.onAvailablePoseTagsChanged);
    this.isRequestingPoseTags = true;

    console.log(`[PoseTagsService] getPoseTags - Requesting...`);

    const poseTags = await lastValueFrom(
      this.apiService.poseTagsControllerGetPoseTags({
        isIncludeRepresentivePoses: false,
      }),
    );
    this.poseTags = poseTags;
    this.onAvailablePoseTagsChanged.emit(poseTags);
    return poseTags;
  }

  async getRepresentivePoses(): Promise<MatchedPose[]> {
    let poseTags = await lastValueFrom(
      this.apiService.poseTagsControllerGetPoseTags({
        isIncludeRepresentivePoses: true,
      }),
    );

    poseTags = poseTags.filter(async (poseTag) => {
      if (poseTag.poses === undefined || poseTag.poses.length === 0) {
        return false;
      }
      return true;
    });

    const representivePoses: MatchedPose[] = [];

    for (const poseTag of poseTags) {
      if (poseTag.poses === undefined) {
        continue;
      }

      const pose = poseTag.poses[0];
      const matchedPose = await this.poseSearchService.getByPoseSetNameAndId(
        pose.poseSetName,
        pose.poseSetItemId,
      );
      if (!matchedPose) continue;

      matchedPose.tags = [poseTag.name];
      representivePoses.push(matchedPose);
    }

    return representivePoses;
  }

  async getPosesWithPoseTags(poses: MatchedPose[]) {
    return lastValueFrom(
      this.apiService.poseTagsControllerGetPoseTagsByPoses({
        poses: poses
          .map((pose) => `${pose.poseSetName}:${pose.poseSetItemId}`)
          .join(','),
      }),
    );
  }

  async addPoseTag(
    poseSetName: string,
    poseSetItemId: number,
    poseTagName: string,
  ) {
    if (this.poseTags === undefined) {
      await this.getPoseTags();
    }

    let poseTags = await lastValueFrom(
      this.apiService.posesControllerAddPoseTag({
        poseSetName: poseSetName,
        poseSetItemId: poseSetItemId,
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
    poseSetItemId: number,
    poseTagName: string,
  ) {
    return await lastValueFrom(
      this.apiService.posesControllerRemovePoseTag({
        poseSetName: poseSetName,
        poseSetItemId: poseSetItemId,
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
          matchedPose.poseSetItemId === poseWithPoseTags.poseSetItemId
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
