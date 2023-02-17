import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pose } from 'src/poses/entities/pose.entity';
import { Repository } from 'typeorm';
import { BlockedPoseTag } from './entities/blocked-pose-tag.entity';
import { PoseTag } from './entities/pose-tag.entity';

@Injectable()
export class PoseTagsService {
  constructor(
    @InjectRepository(PoseTag)
    private poseTagRepository: Repository<PoseTag>,
    @InjectRepository(Pose)
    private poseRepository: Repository<Pose>,
    @InjectRepository(BlockedPoseTag)
    private blockedPoseTagRepository: Repository<BlockedPoseTag>,
  ) {
    return;
  }

  addPoseTag(poseTagName: string): Promise<PoseTag> {
    const tag = new PoseTag();
    tag.name = poseTagName;
    return this.poseTagRepository.save(tag);
  }

  async getPoseTags(includePoses = false): Promise<PoseTag[]> {
    const poseTags = (
      await this.poseTagRepository.find({
        loadRelationIds: includePoses ? false : true,
        relations: includePoses ? ['poses'] : [],
      })
    )
      .filter((poseTag) => {
        return poseTag.poses.length > 0;
      })
      .sort((a, b) => {
        return b.poses.length - a.poses.length;
      })
      .map((poseTag) => {
        if (!includePoses) {
          poseTag.poses = undefined;
        }
        return poseTag;
      });

    return poseTags;
  }

  async getPosesWithPoseTags(
    requestedPoses: { poseSetName: string; poseTime: number }[],
  ): Promise<Pose[]> {
    const wheres = requestedPoses.map((pose) => {
      return {
        poseSetName: pose.poseSetName,
        time: pose.poseTime,
      };
    });

    const poses = await this.poseRepository.find({
      where: wheres,
      relations: ['tags'],
    });

    return poses;
  }

  async isBlockedPoseTag(tagName: string) {
    const tag = await this.blockedPoseTagRepository.findOne({
      where: {
        name: tagName,
      },
    });

    return tag !== null;
  }
}
