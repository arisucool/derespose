import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pose } from 'src/poses/entities/pose.entity';
import { Repository } from 'typeorm';
import { PoseTag } from './entities/pose-tag.entity';

@Injectable()
export class PoseTagsService {
  constructor(
    @InjectRepository(PoseTag)
    private poseTagRepository: Repository<PoseTag>,
    @InjectRepository(Pose)
    private poseRepository: Repository<Pose>,
  ) {
    return;
  }

  addPoseTag(poseTagName: string): Promise<PoseTag> {
    const tag = new PoseTag();
    tag.name = poseTagName;
    return this.poseTagRepository.save(tag);
  }

  getPoseTags(): Promise<PoseTag[]> {
    return this.poseTagRepository.find();
  }

  async getPosesWithPoseTags(
    requestedPoses: { poseFileName: string; poseTime: number }[],
  ): Promise<Pose[]> {
    const wheres = requestedPoses.map((pose) => {
      return {
        poseFileName: pose.poseFileName,
        time: pose.poseTime,
      };
    });

    const poses = await this.poseRepository.find({
      where: wheres,
      relations: ['tags'],
    });
    console.warn(poses);

    return poses;
  }
}
