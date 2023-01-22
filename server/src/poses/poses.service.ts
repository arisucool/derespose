import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PoseTagsService } from 'src/pose-tags/pose-tags.service';
import { Pose } from 'src/poses/entities/pose.entity';
import { Repository } from 'typeorm';
import { PoseTag } from '../pose-tags/entities/pose-tag.entity';

@Injectable()
export class PosesService {
  constructor(
    @InjectRepository(Pose)
    private poseRepository: Repository<Pose>,
    @InjectRepository(PoseTag)
    private poseTagRepository: Repository<PoseTag>,
    private poseTagsService: PoseTagsService,
  ) {
    return;
  }

  async getPose(
    poseFileName: string,
    poseTime: number,
    shouldCreate = false,
  ): Promise<Pose> {
    let pose = await this.poseRepository.findOne({
      where: {
        poseFileName: poseFileName,
        time: poseTime,
      },
    });

    if (!pose && shouldCreate) {
      pose = await this.registerPose(poseFileName, poseTime);
    }

    return pose;
  }

  getPosesByPoseTag(poseTagName: string) {
    return this.poseRepository.find({
      where: {
        tags: {
          name: poseTagName,
        },
      },
      relations: ['tags'],
    });
  }

  registerPose(poseFileName: string, poseTime: number): Promise<Pose> {
    return this.poseRepository.save({
      poseFileName: poseFileName,
      time: poseTime,
    });
  }

  async addPoseTag(poseId: number, poseTagName: string): Promise<PoseTag[]> {
    if (await this.poseTagsService.isBlockedPoseTag(poseTagName)) {
      throw new HttpException('このタグ名は使用できません', 400);
    }

    const pose = await this.poseRepository.findOne({
      where: {
        id: poseId,
      },
      relations: ['tags'],
    });

    if (pose.tags.find((tag) => tag.name === poseTagName)) {
      return pose.tags;
    }

    await this.poseTagsService.addPoseTag(poseTagName);

    const tag = new PoseTag();
    tag.name = poseTagName;

    pose.tags.push(tag);
    pose.save();

    return pose.tags;
  }

  async removePoseTag(poseId: number, poseTagName: any) {
    const pose = await this.poseRepository.findOne({
      where: {
        id: poseId,
      },
      relations: ['tags'],
    });

    pose.tags = pose.tags.filter((tag) => tag.name !== poseTagName);
    pose.save();
    return pose.tags;
  }

  getPoseTags(): Promise<PoseTag[]> {
    return this.poseTagRepository.find();
  }
}
