import { EventEmitter, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { PoseList } from 'src/.api-client/models/pose-list';
import { ApiService } from 'src/.api-client/services/api.service';
import { AuthService } from '../shared/auth.service';

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
    if (this.myPoseLists) return this.myPoseLists;
    if (!this.authService.isLoggedIn()) return [];

    if (this.isRequestingMyPoseLists)
      return lastValueFrom(this.onMyPoseListsChanged);
    this.isRequestingMyPoseLists = true;

    console.log(`[PoseTagsService] getMyPoseLists - Requesting...`);

    const poseLists = await lastValueFrom(
      this.apiService.usersControllerGetMyPoseLists(),
    );
    this.myPoseLists = poseLists;
    this.onMyPoseListsChanged.emit(poseLists);
    return poseLists;
  }

  async getPoseListsByPose(poseFileName: string, poseTime: number) {
    if (!this.myPoseLists) {
      await this.getMyPoseLists();
    }

    if (!this.myPoseLists) return [];

    const poseLists: PoseList[] = [];
    for (const poseList of this.myPoseLists) {
      const p = poseList.poses?.find((pose) => {
        if (pose.poseFileName === poseFileName && pose.time === poseTime) {
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
          poseIdentifiers: [],
        },
      }),
    );

    this.myPoseLists.push(poseList);
    this.onMyPoseListsChanged.emit(this.myPoseLists);

    return poseList;
  }

  async addPoseFromList(
    poseListId: string,
    poseFileName: string,
    poseTime: number,
  ) {
    this.lastAddedPoseListId = poseListId;

    const poseList = await lastValueFrom(
      this.apiService.poseListsControllerAddPoseToPoseList({
        id: poseListId,
        body: {
          poseFileName: poseFileName,
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
    poseFileName: string,
    poseTime: number,
  ) {
    const poseList = await lastValueFrom(
      this.apiService.poseListsControllerRemovePoseFromPoseList({
        id: poseListId,
        body: {
          poseFileName: poseFileName,
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
}
