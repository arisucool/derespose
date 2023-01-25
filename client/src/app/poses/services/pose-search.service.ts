import { EventEmitter, Injectable } from '@angular/core';
import { Pose, PoseItem } from 'ngx-mp-pose-extractor';
import { SimilarPoseItem } from 'ngx-mp-pose-extractor/lib/interfaces/matched-pose-item';
import { lastValueFrom } from 'rxjs';
import { PoseList } from 'src/.api-client/models/pose-list';
import { PoseTag } from 'src/.api-client/models/pose-tag';
import { ApiService } from 'src/.api-client/services/api.service';
import { DetectedPose } from '../interfaces/detected-pose';
import { MatchedPose } from '../interfaces/matched-pose';
import { PoseFile } from '../interfaces/pose-file';
import { PoseListsService } from './pose-lists.service';

@Injectable({
  providedIn: 'root',
})
export class PoseSearchService {
  // ポーズファイルのURL
  public static readonly POSE_FILE_BASE_URL =
    'https://arisucool.github.io/derespose-poses/';
  public static readonly POSE_FILE_DEFINITIONS_URL = `${PoseSearchService.POSE_FILE_BASE_URL}poses.json`;

  // ポーズファイル定義のキャッシュ有効期限 (6時間)
  public static readonly POSE_FILE_DEFINITIONS_CACHE_EXPIRES =
    1000 * 60 * 60 * 6;

  // ポーズファイルのキャッシュ有効期限 (1週間)
  public static readonly POSE_FILE_CACHE_EXPIRES = 1000 * 60 * 60 * 24 * 7;

  // ポーズの類似度のしきい値
  public static readonly POSE_SIMILARITY_THRESHOLD = 0.85;

  // ポーズの最大数
  public static readonly MAX_POSE_COUNT = 10;

  public availableTags: string[] = [];

  private poseFiles?: {
    [key: string]: PoseFile;
  };

  constructor(
    private apiService: ApiService,
    private poseListsService: PoseListsService,
  ) {}

  async loadPoseFiles() {
    if (this.poseFiles) {
      return;
    }

    // ポーズ定義ファイルを読み込む
    let poseFileDefinitions: {
      [key: string]: {
        title: string;
        type: 'song' | 'chanpoku';
      };
    };

    const cache = this.getCachedJson(
      'poseFileDefinitions',
      PoseSearchService.POSE_FILE_DEFINITIONS_CACHE_EXPIRES,
    );

    if (cache !== undefined) {
      poseFileDefinitions = cache;
    } else {
      console.log(
        `[PoseSearchService] loadPoses - Requesting pose file definitions...`,
      );
      const res = await fetch(PoseSearchService.POSE_FILE_DEFINITIONS_URL);
      poseFileDefinitions = await res.json();

      this.setCachedJson(
        'poseFileDefinitions',
        poseFileDefinitions,
        PoseSearchService.POSE_FILE_DEFINITIONS_CACHE_EXPIRES,
      );
    }
    console.log(
      `[PoseSearchService] loadPoses - Loaded pose file definitions`,
      poseFileDefinitions,
    );

    const poseFiles: any = {};
    for (const poseFileName of Object.keys(poseFileDefinitions)) {
      const pose = await this.loadPoseFile(poseFileName);
      poseFiles[poseFileName] = {
        title: poseFileDefinitions[poseFileName].title,
        type: poseFileDefinitions[poseFileName].type,
        pose: pose,
      };
    }
    console.log(
      `[PoseSearchService] loadPoses - Loaded ${poseFiles.length} pose files`,
    );
    this.poseFiles = poseFiles;
  }

  async getPoseFiles() {
    if (!this.poseFiles) {
      await this.loadPoseFiles();
    }

    return this.poseFiles;
  }

  async getPoseFile(poseFileName: string) {
    if (!this.poseFiles) {
      await this.loadPoseFiles();
    }

    if (!this.poseFiles) {
      throw new Error('Failed to load poses');
    }

    if (this.poseFiles[poseFileName] === undefined) {
      throw new Error(`Pose file not found: ${poseFileName}`);
    }

    return this.poseFiles[poseFileName];
  }

  async getPosesByFileName(poseFileName: string): Promise<MatchedPose[]> {
    const poseFile = await this.getPoseFile(poseFileName);

    const pose = poseFile.pose;
    const title = poseFile.title;

    let matchedPoses: MatchedPose[] = [];
    for (const poseItem of pose.getPoses()) {
      // 整形して配列へ追加
      const matchedPose: MatchedPose = {
        id: poseItem.timeMiliseconds,
        title: title,
        poseFileName: poseFileName,
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
        imageUrl: `${PoseSearchService.POSE_FILE_BASE_URL}${poseFileName}/frame-${poseItem.timeMiliseconds}.jpg`,
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
      const poseFile = await this.getPoseFile(pose.poseFileName);
      if (!poseFile) continue;

      const poseItem = poseFile.pose.getPoseByTime(pose.time);
      if (!poseItem) continue;

      // 整形して配列へ追加
      const matchedPose: MatchedPose = {
        id: poseItem.timeMiliseconds,
        title: poseFile.title,
        poseFileName: pose.poseFileName,
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
        imageUrl: `${PoseSearchService.POSE_FILE_BASE_URL}${pose.poseFileName}/frame-${poseItem.timeMiliseconds}.jpg`,
      };
      matchedPoses.push(matchedPose);
    }

    return matchedPoses;
  }

  async searchPoseByPose(targetPoses: DetectedPose[]): Promise<MatchedPose[]> {
    if (!this.poseFiles) {
      await this.loadPoseFiles();
    }

    if (!this.poseFiles) {
      throw new Error('Failed to load poses');
    }

    // 一番最近のポーズを先頭にする
    targetPoses = targetPoses.slice().reverse();

    // 各ポーズファイルを反復
    let matchedPoses: MatchedPose[] = [];
    for (const poseFileName of Object.keys(this.poseFiles)) {
      const pose = this.poseFiles[poseFileName].pose;
      const title = this.poseFiles[poseFileName].title;

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
          poseFileName: poseFileName,
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
          imageUrl: `${PoseSearchService.POSE_FILE_BASE_URL}${poseFileName}/frame-${item.poseItem.timeMiliseconds}.jpg`,
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
    if (!this.poseFiles) {
      await this.loadPoseFiles();
    }

    const receivedPoses = await lastValueFrom(
      this.apiService.posesControllerGetPosesByPoseTag({
        poseTagName: tagName,
      }),
    );

    console.log(`[PoseSearchService] - searchPosesByTag`, receivedPoses);

    let matchedPoses: MatchedPose[] = [];
    for (const receivedPose of receivedPoses) {
      const poseItem = this.getPoseByPoseFileNameAndTime(
        receivedPose.poseFileName,
        receivedPose.time,
      );
      if (!poseItem) continue;

      let poseFileTitle = 'Unknown';
      if (this.poseFiles && this.poseFiles[receivedPose.poseFileName]) {
        poseFileTitle = this.poseFiles[receivedPose.poseFileName].title;
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
        title: poseFileTitle,
        poseFileName: receivedPose.poseFileName,
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
        imageUrl: `${PoseSearchService.POSE_FILE_BASE_URL}${receivedPose.poseFileName}/frame-${receivedPose.time}.jpg`,
      };
      matchedPoses.push(matchedPose);
    }

    // スコア順にソート
    matchedPoses = matchedPoses.sort((a, b) => {
      return b.score - a.score;
    });

    return matchedPoses;
  }

  private getPoseByPoseFileNameAndTime(
    poseFileName: string,
    timeMiliseconds: number,
  ) {
    if (!this.poseFiles) return;

    const poseFile = this.poseFiles[poseFileName];
    if (!poseFile) return;

    const pose = poseFile.pose.getPoseByTime(timeMiliseconds);
    return pose;
  }

  private async loadPoseFile(poseFileName: string) {
    let pose: Pose;
    try {
      let cache = this.getCachedJson(
        poseFileName,
        PoseSearchService.POSE_FILE_CACHE_EXPIRES,
      );

      pose = new Pose();
      if (cache !== undefined) {
        pose.loadJson(JSON.stringify(cache));
      } else {
        console.log(
          `[PoseSearchService] loadPoses - Requesting pose file...`,
          poseFileName,
        );
        const req = await fetch(
          `${PoseSearchService.POSE_FILE_BASE_URL}${poseFileName}/poses.json`,
        );

        const poseJson = await req.text();
        pose.loadJson(poseJson);

        this.setCachedJson(
          poseFileName,
          poseJson,
          PoseSearchService.POSE_FILE_CACHE_EXPIRES,
        );
      }
    } catch (e: any) {
      console.error(
        `[PoseSearchService] loadPoses - Failed to load pose: ${poseFileName}`,
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
