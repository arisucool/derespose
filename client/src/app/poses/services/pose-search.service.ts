import { Injectable } from '@angular/core';
import { PoseSet, PoseSetItem } from 'ngx-mp-pose-extractor';
import { SimilarPoseItem } from 'ngx-mp-pose-extractor/lib/interfaces/similar-pose-item';
import { lastValueFrom, Subject } from 'rxjs';
import { Pose } from 'src/.api-client/models/pose';
import { PoseTag } from 'src/.api-client/models/pose-tag';
import { ApiService } from 'src/.api-client/services/api.service';
import { AppCacheService } from 'src/app/shared/services/app-cache.service';
import { DetectedPose } from '../interfaces/detected-pose';
import { MatchedPose } from '../interfaces/matched-pose';
import { PoseSetDefinition } from '../interfaces/pose-set-definition';
import { PoseSetDefinitionJson } from '../interfaces/pose-set-definition-json';
import { PoseListsService } from './pose-lists.service';

@Injectable({
  providedIn: 'root',
})
export class PoseSearchService {
  // ポーズセット定義ファイルのURL
  public static readonly POSESET_BASE_URL =
    'https://arisucool.github.io/derespose-poses/';
  public static readonly POSESET_DEFINITIONS_URL = `${PoseSearchService.POSESET_BASE_URL}pose-sets.json`;

  // ポーズセット定義ファイルのキャッシュ有効期限 (1時間)
  public static readonly POSESET_DEFINITIONS_CACHE_EXPIRES = 1000 * 60 * 60 * 1;

  // ポーズセットファイルのキャッシュ有効期限 (無期限)
  public static readonly POSESET_CACHE_EXPIRES = undefined;

  // ポーズの類似度のしきい値
  public static readonly BODY_POSE_SIMILARITY_THRESHOLD = 0.75;
  public static readonly HAND_POSE_SIMILARITY_THRESHOLD = 0.6;

  // ポーズの最大数
  public static readonly MAX_POSE_SEARCH_RESULT_COUNT = 50;

  // ポーズの読み込み情報を伝えるイベント
  private onPoseLoading: Subject<number> = new Subject();
  public onPoseLoading$ = this.onPoseLoading.asObservable();

  public availableTags: string[] = [];

  private poseSetDefinitions?: {
    [key: string]: PoseSetDefinition;
  };

  constructor(
    private apiService: ApiService,
    private poseListsService: PoseListsService,
    private appCacheService: AppCacheService,
  ) {}

  async loadPoseSets() {
    if (this.poseSetDefinitions) {
      return;
    }

    // イベントを伝達
    this.onPoseLoading.next(0);

    // ポーズセット定義ファイルを読み込む
    let poseSetDefinitionJson: {
      [key: string]: PoseSetDefinitionJson;
    };

    const cache = await this.appCacheService.getCachedJson(
      'poseSetDefinitions',
      PoseSearchService.POSESET_DEFINITIONS_CACHE_EXPIRES,
    );

    if (cache !== undefined) {
      poseSetDefinitionJson = cache;
    } else {
      console.log(
        `[PoseSearchService] loadPoses - Requesting poseset definitions...`,
      );
      const res = await fetch(
        PoseSearchService.POSESET_DEFINITIONS_URL + '?v=' + Date.now(),
      );
      poseSetDefinitionJson = await res.json();

      await this.appCacheService.setCachedJson(
        'poseSetDefinitions',
        poseSetDefinitionJson,
      );
    }
    console.log(
      `[PoseSearchService] loadPoses - Loaded poseset definitions`,
      poseSetDefinitionJson,
    );

    // 各ポーズセットファイルを読み込む
    const poseSetDefinitions: { [key: string]: PoseSetDefinition } = {};
    let numOfAllPoseSets = Object.keys(poseSetDefinitionJson).length,
      count = 0;
    for (const poseSetName of Object.keys(poseSetDefinitionJson)) {
      const expectVersion =
        poseSetDefinitionJson[poseSetName].version !== undefined
          ? poseSetDefinitionJson[poseSetName].version!
          : -1;

      const poseSet = await this.loadPoseSet(poseSetName, expectVersion);
      poseSetDefinitions[poseSetName] = {
        ...poseSetDefinitionJson[poseSetName],
        poseSet: poseSet,
      };

      // イベントを伝達
      count++;
      this.onPoseLoading.next(count / numOfAllPoseSets);
    }
    console.log(
      `[PoseSearchService] loadPoses - Loaded posesets`,
      poseSetDefinitions,
    );
    this.poseSetDefinitions = poseSetDefinitions;

    // イベントを伝達
    this.onPoseLoading.next(1.0);
  }

  async getPoseSetDefinitions() {
    if (!this.poseSetDefinitions) {
      await this.loadPoseSets();
    }

    return this.poseSetDefinitions;
  }

  async getPoseSetDefinition(poseSetName: string) {
    if (!this.poseSetDefinitions) {
      await this.loadPoseSets();
    }

    if (!this.poseSetDefinitions) {
      throw new Error('Failed to load posesets');
    }

    if (this.poseSetDefinitions[poseSetName] === undefined) {
      throw new Error(`Poseset not found: ${poseSetName}`);
    }

    return this.poseSetDefinitions[poseSetName];
  }

  async getPosesByPoseSetName(poseSetName: string): Promise<MatchedPose[]> {
    const poseSetDefinition = await this.getPoseSetDefinition(poseSetName);
    const poseSet = poseSetDefinition.poseSet;
    const title = poseSetDefinition.title;

    let matchedPoses: MatchedPose[] = [];
    for (const poseSetItem of poseSet.getPoses()) {
      // 整形して配列へ追加
      const matchedPose: MatchedPose = this.getMatchedPose(
        poseSetName,
        title,
        poseSetItem,
      );
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
      const poseSet = await this.getPoseSetDefinition(pose.poseSetName);
      if (!poseSet) continue;

      const poseSetItem = poseSet.poseSet.getPoseById(pose.poseSetItemId);
      if (!poseSetItem) continue;

      // 整形して配列へ追加
      const matchedPose: MatchedPose = this.getMatchedPose(
        pose.poseSetName,
        poseSet.title,
        poseSetItem,
      );
      matchedPoses.push(matchedPose);
    }

    return matchedPoses;
  }

  async searchPoseByPose(
    targetPoses: DetectedPose[],
    targetRange: 'all' | 'bodyPose' | 'handPose',
  ): Promise<MatchedPose[]> {
    console.log(
      `[PoseSearchService] searchPoseByPose - Searching...`,
      targetPoses,
    );
    if (!this.poseSetDefinitions) {
      await this.loadPoseSets();
    }

    if (!this.poseSetDefinitions) {
      throw new Error('Failed to load poses');
    }

    // 一番最近のポーズを先頭にする
    targetPoses = targetPoses.slice().reverse();

    // 各ポーズファイルを反復
    let matchedPoses: MatchedPose[] = [];
    for (const poseSetName of Object.keys(this.poseSetDefinitions)) {
      const pose = this.poseSetDefinitions[poseSetName].poseSet;
      const title = this.poseSetDefinitions[poseSetName].title;

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
            targetRange === 'handPose'
              ? PoseSearchService.HAND_POSE_SIMILARITY_THRESHOLD
              : PoseSearchService.BODY_POSE_SIMILARITY_THRESHOLD,
            targetRange,
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
        let score: number;
        if (targetRange === 'all') {
          score =
            ((item.poseItem.bodyPoseSimilarity ?? 0.0) +
              (item.poseItem.handPoseSimilarity === undefined ||
              item.poseItem.handPoseSimilarity === -1
                ? 0.0
                : item.poseItem.handPoseSimilarity)) *
            2;
        } else {
          score = item.poseItem.similarity * 2;
        }

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
        const matchedPose: MatchedPose = this.getMatchedPose(
          poseSetName,
          title,
          item.poseItem,
          {
            score: score,
            scoreString: scoreString,
            scoreDetails: {
              similarity: item.poseItem.similarity,
              bodyPoseSimilarity: item.poseItem.bodyPoseSimilarity,
              handPoseSimilarity: item.poseItem.handPoseSimilarity,
              foundTargetPoseIndex: item.foundTargetPoseIndex,
              duration: item.poseItem.durationMiliseconds,
              time: item.poseItem.timeMiliseconds,
            },
          },
        );
        matchedPoses.push(matchedPose);
      }
    }

    // スコア順にソート
    matchedPoses = matchedPoses.sort((a, b) => {
      return b.score - a.score;
    });

    // 上限まで削る
    matchedPoses = matchedPoses.slice(
      0,
      PoseSearchService.MAX_POSE_SEARCH_RESULT_COUNT,
    );

    return matchedPoses;
  }

  async searchPosesByTag(tagName: string) {
    if (!this.poseSetDefinitions) {
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
      const poseSetItem = this.getPoseSetItemByPoseSetNameAndId(
        receivedPose.poseSetName,
        receivedPose.poseSetItemId,
      );
      if (!poseSetItem) continue;

      let poseSetTitle = 'Unknown';
      if (
        this.poseSetDefinitions &&
        this.poseSetDefinitions[receivedPose.poseSetName]
      ) {
        poseSetTitle = this.poseSetDefinitions[receivedPose.poseSetName].title;
      }

      // スコア算出 - ポーズの長さ
      let score = (poseSetItem.durationMiliseconds / 1000) * 0.1;

      // スコア算出 - ポーズの登場する早さ
      score -= (poseSetItem.timeMiliseconds / 1000) * 0.01;

      // スコア算出 - お気に入りの数
      // TODO

      // スコア算出 - タグの数
      // TODO

      // スコアを小数点以下2桁に丸める
      const scoreString: string = `${Math.round(score * 100) / 100}`;

      // 整形して配列へ追加
      const matchedPose: MatchedPose = this.getMatchedPose(
        receivedPose.poseSetName,
        poseSetTitle,
        poseSetItem,
        {
          score: score,
          scoreString: scoreString,
          scoreDetails: {
            similarity: -1,
            foundTargetPoseIndex: -1,
            duration: poseSetItem.durationMiliseconds,
            time: poseSetItem.timeMiliseconds,
          },
        },
      );
      matchedPose.tags = receivedPose?.tags?.map((tag: PoseTag) => {
        return tag.name;
      });
      matchedPoses.push(matchedPose);
    }

    // スコア順にソート
    matchedPoses = matchedPoses.sort((a, b) => {
      return b.score - a.score;
    });

    return matchedPoses;
  }

  async getByPoseSetNameAndId(poseSetName: string, poseSetItemId: number) {
    const poseSetDefinition = await this.getPoseSetDefinition(poseSetName);
    if (!poseSetDefinition) {
      throw new Error(`PoseSet not found: ${poseSetName}`);
    }

    const title = poseSetDefinition.title;

    const poseSetItem = this.getPoseSetItemByPoseSetNameAndId(
      poseSetName,
      poseSetItemId,
    );
    if (!poseSetItem) {
      return;
    }

    const matchedPose: MatchedPose = this.getMatchedPose(
      poseSetName,
      title,
      poseSetItem,
    );

    return matchedPose;
  }

  private getMatchedPose(
    poseSetName: string,
    poseSetTitle: string,
    poseSetItem: PoseSetItem,
    score?: {
      score: number;
      scoreString: string;
      scoreDetails: {
        similarity: number;
        bodyPoseSimilarity?: number;
        handPoseSimilarity?: number;
        foundTargetPoseIndex: number;
        duration: number;
        time: number;
      };
    },
  ): MatchedPose {
    return {
      id: poseSetItem.id,
      title: poseSetTitle,
      poseSetName: poseSetName,
      poseSetItemId: poseSetItem.id,
      timeSeconds: Math.floor(poseSetItem.timeMiliseconds / 1000),
      durationSeconds:
        Math.floor((poseSetItem.durationMiliseconds / 1000) * 10) / 10,
      faceExpression:
        poseSetItem.extendedData &&
        poseSetItem.extendedData['faceExp'] &&
        1 <= poseSetItem.extendedData['faceExp'].length
          ? {
              top: {
                label: poseSetItem.extendedData['faceExp'][0].label,
                prob: poseSetItem.extendedData['faceExp'][0].prob,
              },
              predictions: poseSetItem.extendedData['faceExp'],
            }
          : undefined,
      score: score?.score ?? 0,
      scoreString: score?.scoreString ?? 'N/A',
      scoreDetails: score?.scoreDetails ?? {
        similarity: -1,
        foundTargetPoseIndex: -1,
        duration: poseSetItem.durationMiliseconds,
        time: poseSetItem.timeMiliseconds,
      },
      isFavorite: false,
      tags: [], // TODO: タグを取得する
      imageUrl: `${PoseSearchService.POSESET_BASE_URL}${poseSetName}/frame-${poseSetItem.id}.webp`,
    };
  }

  private getPoseSetItemByPoseSetNameAndId(
    poseSetName: string,
    poseSetItemId: number,
  ) {
    if (!this.poseSetDefinitions) return;

    const poseSet = this.poseSetDefinitions[poseSetName];
    if (!poseSet) return;

    const pose = poseSet.poseSet.getPoseById(poseSetItemId);
    return pose;
  }

  private async loadPoseSet(poseSetName: string, expectVersion: number) {
    let poseSet: PoseSet;
    try {
      let cache = await this.appCacheService.getCachedJson(
        poseSetName,
        PoseSearchService.POSESET_CACHE_EXPIRES,
      );

      poseSet = new PoseSet();
      if (
        cache !== undefined &&
        cache.version !== undefined &&
        cache.version === expectVersion
      ) {
        // キャッシュから読み込み
        poseSet.loadJson(JSON.stringify(cache.poseSet));
      } else {
        // サーバから読み込み
        console.log(
          `[PoseSearchService] loadPoses - Requesting poseset...`,
          poseSetName,
        );
        const req = await fetch(
          `${PoseSearchService.POSESET_BASE_URL}${poseSetName}/poses.json?v=` +
            expectVersion,
        );

        const poseSetJson = await req.text();
        poseSet.loadJson(poseSetJson);

        // キャッシュへ保存
        this.appCacheService.setCachedJson(poseSetName, {
          version: expectVersion,
          poseSet: JSON.parse(poseSetJson),
        });
      }
    } catch (e: any) {
      console.error(
        `[PoseSearchService] loadPoses - Failed to load pose: ${poseSetName}`,
        e,
      );
      throw e;
    }
    return poseSet;
  }
}
