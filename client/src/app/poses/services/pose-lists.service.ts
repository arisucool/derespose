import { EventEmitter, Injectable } from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { CreatePostListDto } from 'src/.api-client/models/create-post-list-dto';
import { PoseList } from 'src/.api-client/models/pose-list';
import { UpdatePoseListDto } from 'src/.api-client/models/update-pose-list-dto';
import { ApiService } from 'src/.api-client/services/api.service';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PoseListsService {
  // このユーザのポーズリスト
  private myPoseLists?: PoseList[];

  // このユーザのポーズリストを取得中か否か
  private isRequestingMyPoseLists = false;

  // 最後にポーズを追加したポーズリストのID
  private lastAddedPoseListId?: string;

  // このユーザのポーズリストが更新されたときに呼び出されるするイベント
  public onMyPoseListsChanged: EventEmitter<PoseList[]> = new EventEmitter();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
  ) {}

  getPublicPoseLists() {
    return lastValueFrom(this.apiService.poseListsControllerList());
  }

  async getMyPoseLists() {
    if (this.myPoseLists) {
      return this.myPoseLists;
    }
    if (!this.authService.getAccessToken()) {
      return [];
    }

    if (this.isRequestingMyPoseLists) {
      return await firstValueFrom(this.onMyPoseListsChanged);
    }
    this.isRequestingMyPoseLists = true;

    console.log(`[PoseListsService] getMyPoseLists - Requesting...`);

    const poseLists = await lastValueFrom(
      this.apiService.usersControllerGetMyPoseLists(),
    );
    this.myPoseLists = poseLists;
    this.onMyPoseListsChanged.emit(poseLists);
    this.isRequestingMyPoseLists = false;
    console.log(`[PoseListsService] getMyPoseLists - Done`, poseLists);
    return poseLists;
  }

  async getPoseListsByPose(poseSetName: string, poseTime: number) {
    if (!this.myPoseLists) {
      await this.getMyPoseLists();
    }

    if (!this.myPoseLists) return [];

    const poseLists: PoseList[] = [];
    for (const poseList of this.myPoseLists) {
      const p = poseList.poses?.find((pose) => {
        if (pose.poseSetName === poseSetName && pose.time === poseTime) {
          return true;
        }
        return false;
      });
      if (p) {
        poseLists.push(poseList);
      }
    }

    return poseLists;
  }

  async getPoseList(poseListId: string): Promise<PoseList | undefined> {
    const poseList = await lastValueFrom(
      this.apiService.poseListsControllerGet({
        id: poseListId,
      }),
    );
    console.log(`[PoseListsService] getPoseList`, poseListId, poseList);
    return poseList;
  }

  getLastAddedPoseListId() {
    return this.lastAddedPoseListId;
  }

  async createPoseList(title: string, publicMode: string) {
    if (!this.myPoseLists) return;

    let poseList = await lastValueFrom(
      this.apiService.poseListsControllerCreate({
        body: {
          title: title,
          publicMode: publicMode,
          description: '',
        },
      }),
    );

    this.myPoseLists.push(poseList);
    this.onMyPoseListsChanged.emit(this.myPoseLists);

    return poseList;
  }

  async addPoseFromList(
    poseListId: string,
    poseSetName: string,
    poseTime: number,
  ) {
    this.lastAddedPoseListId = poseListId;

    const poseList = await lastValueFrom(
      this.apiService.poseListsControllerAddPoseToPoseList({
        id: poseListId,
        body: {
          poseSetName: poseSetName,
          poseTime: poseTime,
        },
      }),
    );

    if (!this.myPoseLists) return poseList;

    const index = this.myPoseLists.findIndex((p) => p.id === poseListId);
    if (index < 0) return poseList;

    this.myPoseLists[index] = poseList;
    this.onMyPoseListsChanged.emit(this.myPoseLists);

    return poseList;
  }

  async removePoseFromList(
    poseListId: string,
    poseSetName: string,
    poseTime: number,
  ) {
    const poseList = await lastValueFrom(
      this.apiService.poseListsControllerRemovePoseFromPoseList({
        id: poseListId,
        body: {
          poseSetName: poseSetName,
          poseTime: poseTime,
        },
      }),
    );

    if (!this.myPoseLists) return poseList;

    const index = this.myPoseLists.findIndex((p) => p.id === poseListId);
    if (index < 0) return poseList;

    this.myPoseLists[index] = poseList;
    this.onMyPoseListsChanged.emit(this.myPoseLists);

    return poseList;
  }

  async setPublicModeOfPoseList(poseList: PoseList, publicMode: string) {
    let poseIdentifiers: string[] = [];
    if (poseList.poses) {
      poseIdentifiers = poseList.poses?.map((pose) => {
        return `${pose.poseSetName}:${pose.time}`;
      });
    }

    const dto: UpdatePoseListDto = {
      title: poseList.title,
      publicMode: publicMode,
      description: poseList.description,
      poseIdentifiers: poseIdentifiers,
    };

    return await lastValueFrom(
      this.apiService.poseListsControllerUpdate({
        id: poseList.id,
        body: dto,
      }),
    );
  }

  async deletePoseList(poseListId: string) {
    await lastValueFrom(
      this.apiService.poseListsControllerDelete({
        id: poseListId,
      }),
    );

    if (!this.myPoseLists) return;

    const index = this.myPoseLists.findIndex((p) => p.id === poseListId);
    if (index < 0) return;

    this.myPoseLists.splice(index, 1);
    this.onMyPoseListsChanged.emit(this.myPoseLists);
  }
}
