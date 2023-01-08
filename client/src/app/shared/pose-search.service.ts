import { EventEmitter, Injectable } from '@angular/core';
import { Pose, PoseItem } from 'ngx-mp-pose-extractor';
import { DetectedPose } from './detected-pose';
import { MatchedPose } from './matched-pose';

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

  public availableTags: string[] = [];
  public onAvailableTagChanged: EventEmitter<string[]> = new EventEmitter();

  private poseFiles?: {
    [key: string]: {
      title: string;
      type: 'song' | 'chanpoku';
      pose: Pose;
    };
  };

  constructor() {}

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

  async searchPoseByPose(targetPoses: DetectedPose[]): Promise<MatchedPose[]> {
    if (!this.poseFiles) {
      await this.loadPoseFiles();
    }

    if (!this.poseFiles) {
      throw new Error('Failed to load poses');
    }

    let matchedPoses: MatchedPose[] = [];
    for (const poseFileName of Object.keys(this.poseFiles)) {
      const pose = this.poseFiles[poseFileName].pose;
      const title = this.poseFiles[poseFileName].title;

      let usedFrames = new Set();
      let poseItems: PoseItem[] = [];
      for (const targetPose of targetPoses) {
        const poseItems_ = pose.getSimilarPoses(targetPose as any); // TODO 型定義を修正する
        for (const poseItem of poseItems_) {
          if (usedFrames.has(poseItem.t)) {
            continue;
          }
          poseItems.push(poseItem);
          usedFrames.add(poseItem.t);
        }
      }

      console.log(
        `[PoseSearchService] - searchPoseByPose`,
        pose.getVideoName(),
        poseItems,
      );

      for (const poseItem of poseItems) {
        const matchedPose: MatchedPose = {
          id: poseItem.t,
          title: title,
          timeSeconds: Math.floor(poseItem.t / 1000),
          score: 0,
          isFavorite: false,
          tags: [],
          imageUrl: `${PoseSearchService.POSE_FILE_BASE_URL}${poseFileName}/frame-${poseItem.t}.jpg`,
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
