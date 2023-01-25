import { EventEmitter, Injectable } from '@angular/core';
import { Pose, PoseItem } from 'ngx-mp-pose-extractor';
import { SimilarPoseItem } from 'ngx-mp-pose-extractor/lib/interfaces/matched-pose-item';
import { lastValueFrom } from 'rxjs';
import { PoseList } from 'src/.api-client/models/pose-list';
import { PoseTag } from 'src/.api-client/models/pose-tag';
import { ApiService } from 'src/.api-client/services/api.service';
import { DetectedPose } from '../interfaces/detected-pose';
import { MatchedPose } from '../interfaces/matched-pose';
import { PoseSet } from '../interfaces/pose-set';
import { PoseListsService } from './pose-lists.service';

@Injectable({
  providedIn: 'root',
})
export class PoseSearchService {
  // ポーズセットのURL
  public static readonly POSESET_BASE_URL =
    'https://arisucool.github.io/derespose-poses/';
  public static readonly POSESET_DEFINITIONS_URL = `${PoseSearchService.POSESET_BASE_URL}poses.json`;

  // ポーズファイル定義のキャッシュ有効期限 (6時間)
  public static readonly POSESET_DEFINITIONS_CACHE_EXPIRES = 1000 * 60 * 60 * 6;

  // ポーズファイルのキャッシュ有効期限 (1週間)
  public static readonly POSESET_CACHE_EXPIRES = 1000 * 60 * 60 * 24 * 7;

  // ポーズの類似度のしきい値
  public static readonly POSE_SIMILARITY_THRESHOLD = 0.85;

  // ポーズの最大数
  public static readonly MAX_POSE_COUNT = 10;

  public availableTags: string[] = [];

  private poseSets?: {
    [key: string]: PoseSet;
  };

  constructor(
    private apiService: ApiService,
    private poseListsService: PoseListsService,
  ) {}

  async loadPoseSets() {
    if (this.poseSets) {
      return;
    }

    // ポーズ定義ファイルを読み込む
    let poseSetDefinitions: {
      [key: string]: {
        title: string;
        type: 'song' | 'chanpoku';
      };
    };

    const cache = this.getCachedJson(
      'poseSetDefinitions',
      PoseSearchService.POSESET_DEFINITIONS_CACHE_EXPIRES,
    );

    if (cache !== undefined) {
      poseSetDefinitions = cache;
    } else {
      console.log(
        `[PoseSearchService] loadPoses - Requesting poseset definitions...`,
      );
      const res = await fetch(PoseSearchService.POSESET_DEFINITIONS_URL);
      poseSetDefinitions = await res.json();

      this.setCachedJson(
        'poseSetDefinitions',
        poseSetDefinitions,
        PoseSearchService.POSESET_DEFINITIONS_CACHE_EXPIRES,
      );
    }
    console.log(
      `[PoseSearchService] loadPoses - Loaded poseset definitions`,
      poseSetDefinitions,
    );

    const poseSets: any = {};
    for (const poseSetName of Object.keys(poseSetDefinitions)) {
      const pose = await this.loadPoseSet(poseSetName);
      poseSets[poseSetName] = {
        title: poseSetDefinitions[poseSetName].title,
        type: poseSetDefinitions[poseSetName].type,
        pose: pose,
      };
    }
    console.log(`[PoseSearchService] loadPoses - Loaded posesets`, poseSets);
    this.poseSets = poseSets;
  }

  async getPoseSets() {
    if (!this.poseSets) {
      await this.loadPoseSets();
    }

    return this.poseSets;
  }

  async getPoseSet(poseSetName: string) {
    if (!this.poseSets) {
      await this.loadPoseSets();
    }

    if (!this.poseSets) {
      throw new Error('Failed to load posesets');
    }

    if (this.poseSets[poseSetName] === undefined) {
      throw new Error(`Poseset not found: ${poseSetName}`);
    }

    return this.poseSets[poseSetName];
  }

  async getPosesByPoseSetName(poseSetName: string): Promise<MatchedPose[]> {
    const poseSet = await this.getPoseSet(poseSetName);

    const pose = poseSet.pose;
    const title = poseSet.title;

    let matchedPoses: MatchedPose[] = [];
    for (const poseItem of pose.getPoses()) {
      // 整形して配列へ追加
      const matchedPose: MatchedPose = {
        id: poseItem.timeMiliseconds,
        title: title,
        poseSetName: poseSetName,
        time: poseItem.timeMiliseconds,
        timeSeconds: Math.floor(poseItem.timeMiliseconds / 1000),
        durationSeconds:
          Math.floor((poseItem.durationMiliseconds / 1000) * 10) / 10,
        score: 0,
        scoreString: 'N/A',
        scoreDetails: {
          similarity: 0,
          foundTargetPoseIndex: 0,
          duration: 0,
          time: 0,
        },
        isFavorite: false,
        tags: [],
        imageUrl: `${PoseSearchService.POSESET_BASE_URL}${poseSetName}/frame-${poseItem.timeMiliseconds}.jpg`,
      };
      matchedPoses.push(matchedPose);
    }

    return matchedPoses;
  }

  async getPosesByPoseListId(poseListId: string): Promise<MatchedPose[]> {
    console.log(
      `[PoseSearchService] getPosesByPoseListId - Finding...`,
      poseListId,
    );
    const poseList = await this.poseListsService.getPoseList(poseListId);
    console.log(`[PoseSearchService] getPosesByPoseListId - Found`, poseList);

    if (
      poseList === undefined ||
      poseList.poses === undefined ||
      poseList.poses.length === 0
    ) {
      return [];
    }

    let matchedPoses: MatchedPose[] = [];
    for (const pose of poseList?.poses) {
      const poseSet = await this.getPoseSet(pose.poseSetName);
      if (!poseSet) continue;

      const poseItem = poseSet.pose.getPoseByTime(pose.time);
      if (!poseItem) continue;

      // 整形して配列へ追加
      const matchedPose: MatchedPose = {
        id: poseItem.timeMiliseconds,
        title: poseSet.title,
        poseSetName: pose.poseSetName,
        time: poseItem.timeMiliseconds,
        timeSeconds: Math.floor(poseItem.timeMiliseconds / 1000),
        durationSeconds:
          Math.floor((poseItem.durationMiliseconds / 1000) * 10) / 10,
        score: 0,
        scoreString: 'N/A',
        scoreDetails: {
          similarity: 0,
          foundTargetPoseIndex: 0,
          duration: 0,
          time: 0,
        },
        isFavorite: false,
        tags: [],
        imageUrl: `${PoseSearchService.POSESET_BASE_URL}${pose.poseSetName}/frame-${poseItem.timeMiliseconds}.jpg`,
      };
      matchedPoses.push(matchedPose);
    }

    return matchedPoses;
  }

  async searchPoseByPose(targetPoses: DetectedPose[]): Promise<MatchedPose[]> {
    if (!this.poseSets) {
      await this.loadPoseSets();
    }

    if (!this.poseSets) {
      throw new Error('Failed to load poses');
    }

    // 一番最近のポーズを先頭にする
    targetPoses = targetPoses.slice().reverse();

    // 各ポーズファイルを反復
    let matchedPoses: MatchedPose[] = [];
    for (const poseSetName of Object.keys(this.poseSets)) {
      const pose = this.poseSets[poseSetName].pose;
      const title = this.poseSets[poseSetName].title;

      let usedFrames = new Set();
      let poseItems: {
        poseItem: SimilarPoseItem;
        // どのポーズに一番近いか (この数値が高いならば、直近の撮影タイミングのポーズに近い。この数値が低いならば、古い撮影タイミングのポーズに近い)
        foundTargetPoseIndex: number;
      }[] = [];

      // 直近の撮影タイミングのポーズを反復
      for (let i = 0, l = targetPoses.length; i < l; i++) {
        const targetPose = targetPoses[i];

        let poseItems_: SimilarPoseItem[] = [];
        try {
          poseItems_ = pose.getSimilarPoses(
            targetPose as any,
            PoseSearchService.POSE_SIMILARITY_THRESHOLD,
          ); // TODO 型定義を修正する
        } catch (e) {
          console.error(e);
          continue;
        }
        for (const poseItem of poseItems_) {
          if (usedFrames.has(poseItem.timeMiliseconds)) {
            continue;
          }
          poseItems.push({
            poseItem: poseItem,
            foundTargetPoseIndex: l - i,
          });
          usedFrames.add(poseItem.timeMiliseconds);
        }
      }

      console.log(
        `[PoseSearchService] - searchPoseByPose`,
        pose.getVideoName(),
        poseItems,
      );

      for (const item of poseItems) {
        // スコア算出 - 類似度
        let score = item.poseItem.similarity * 1.2;

        // スコア算出 - どの撮影タイミングのポーズに一番近いか
        score += item.foundTargetPoseIndex * 0.1;

        // スコア算出 - ポーズの長さ
        score += (item.poseItem.durationMiliseconds / 1000) * 0.05;

        // スコア算出 - ポーズの登場する早さ
        score -= (item.poseItem.timeMiliseconds / 1000) * 0.01;

        // スコア算出 - お気に入りの数
        // TODO

        // スコア算出 - タグの数
        // TODO

        // スコアを小数点以下2桁に丸める
        const scoreString: string = `${Math.round(score * 100) / 100}`;

        // 整形して配列へ追加
        const matchedPose: MatchedPose = {
          id: item.poseItem.timeMiliseconds,
          title: title,
          poseSetName: poseSetName,
          time: item.poseItem.timeMiliseconds,
          timeSeconds: Math.floor(item.poseItem.timeMiliseconds / 1000),
          durationSeconds:
            Math.floor((item.poseItem.durationMiliseconds / 1000) * 10) / 10,
          score: score,
          scoreString: scoreString,
          scoreDetails: {
            similarity: item.poseItem.similarity,
            foundTargetPoseIndex: item.foundTargetPoseIndex,
            duration: item.poseItem.durationMiliseconds,
            time: item.poseItem.timeMiliseconds,
          },
          isFavorite: false,
          tags: [],
          imageUrl: `${PoseSearchService.POSESET_BASE_URL}${poseSetName}/frame-${item.poseItem.timeMiliseconds}.jpg`,
        };
        matchedPoses.push(matchedPose);
      }
    }

    // スコア順にソート
    matchedPoses = matchedPoses.sort((a, b) => {
      return b.score - a.score;
    });

    // 上限まで削る
    matchedPoses = matchedPoses.slice(0, PoseSearchService.MAX_POSE_COUNT);

    return matchedPoses;
  }

  async searchPosesByTag(tagName: string) {
    if (!this.poseSets) {
      await this.loadPoseSets();
    }

    const receivedPoses = await lastValueFrom(
      this.apiService.posesControllerGetPosesByPoseTag({
        poseTagName: tagName,
      }),
    );

    console.log(`[PoseSearchService] - searchPosesByTag`, receivedPoses);

    let matchedPoses: MatchedPose[] = [];
    for (const receivedPose of receivedPoses) {
      const poseItem = this.getPoseByPoseSetNameAndTime(
        receivedPose.poseSetName,
        receivedPose.time,
      );
      if (!poseItem) continue;

      let poseSetTitle = 'Unknown';
      if (this.poseSets && this.poseSets[receivedPose.poseSetName]) {
        poseSetTitle = this.poseSets[receivedPose.poseSetName].title;
      }

      // スコア算出 - ポーズの長さ
      let score = (poseItem.durationMiliseconds / 1000) * 0.1;

      // スコア算出 - ポーズの登場する早さ
      score -= (poseItem.timeMiliseconds / 1000) * 0.01;

      // スコア算出 - お気に入りの数
      // TODO

      // スコア算出 - タグの数
      // TODO

      // スコアを小数点以下2桁に丸める
      const scoreString: string = `${Math.round(score * 100) / 100}`;

      // 整形して配列へ追加
      const matchedPose: MatchedPose = {
        id: receivedPose.id,
        title: poseSetTitle,
        poseSetName: receivedPose.poseSetName,
        time: receivedPose.time,
        timeSeconds: Math.floor(receivedPose.time / 1000),
        durationSeconds:
          Math.floor((poseItem.durationMiliseconds / 1000) * 10) / 10,
        score: score,
        scoreString: scoreString,
        scoreDetails: {
          similarity: -1,
          foundTargetPoseIndex: -1,
          duration: poseItem.durationMiliseconds,
          time: poseItem.timeMiliseconds,
        },
        isFavorite: false,
        tags: receivedPose?.tags?.map((tag: PoseTag) => {
          return tag.name;
        }),
        imageUrl: `${PoseSearchService.POSESET_BASE_URL}${receivedPose.poseSetName}/frame-${receivedPose.time}.jpg`,
      };
      matchedPoses.push(matchedPose);
    }

    // スコア順にソート
    matchedPoses = matchedPoses.sort((a, b) => {
      return b.score - a.score;
    });

    return matchedPoses;
  }

  private getPoseByPoseSetNameAndTime(
    poseSetName: string,
    timeMiliseconds: number,
  ) {
    if (!this.poseSets) return;

    const poseSet = this.poseSets[poseSetName];
    if (!poseSet) return;

    const pose = poseSet.pose.getPoseByTime(timeMiliseconds);
    return pose;
  }

  private async loadPoseSet(poseSetName: string) {
    let pose: Pose;
    try {
      let cache = this.getCachedJson(
        poseSetName,
        PoseSearchService.POSESET_CACHE_EXPIRES,
      );

      pose = new Pose();
      if (cache !== undefined) {
        pose.loadJson(JSON.stringify(cache));
      } else {
        console.log(
          `[PoseSearchService] loadPoses - Requesting poseset...`,
          poseSetName,
        );
        const req = await fetch(
          `${PoseSearchService.POSESET_BASE_URL}${poseSetName}/poses.json`,
        );

        const poseJson = await req.text();
        pose.loadJson(poseJson);

        this.setCachedJson(
          poseSetName,
          poseJson,
          PoseSearchService.POSESET_CACHE_EXPIRES,
        );
      }
    } catch (e: any) {
      console.error(
        `[PoseSearchService] loadPoses - Failed to load pose: ${poseSetName}`,
        e,
      );
      throw e;
    }
    return pose;
  }

  private getCachedJson(key: string, expires: number) {
    const cacheStr = window.localStorage.getItem(`cache__${key}`);
    if (cacheStr === null) return undefined;

    let cache: {
      content: any;
      createdAt: number;
    };
    try {
      cache = JSON.parse(cacheStr);
    } catch (e: any) {
      return undefined;
    }
    if (!cache || !cache.content || !cache.createdAt) {
      return undefined;
    }

    const now = new Date().getTime();
    if (expires < now - cache.createdAt) {
      window.localStorage.removeItem(key);
      return undefined;
    }

    return cache['content'];
  }

  private setCachedJson(key: string, content: any, expires: number) {
    const now = new Date().getTime();

    if (typeof content === 'string') {
      content = JSON.parse(content);
    }

    const cache = {
      content: content,
      createdAt: now,
    };
    window.localStorage.setItem(`cache__${key}`, JSON.stringify(cache));
  }
}
