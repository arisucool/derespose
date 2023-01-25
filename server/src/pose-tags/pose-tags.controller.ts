import { Controller, Get, HttpException, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { Pose } from 'src/poses/entities/pose.entity';
import { PoseTag } from './entities/pose-tag.entity';
import { PoseTagsService } from './pose-tags.service';

@Controller('pose-tags')
export class PoseTagsController {
  constructor(private poseTagsService: PoseTagsService) {
    return;
  }

  @Get()
  @ApiOkResponse({
    type: PoseTag,
    description: 'タグのリスト',
    isArray: true,
  })
  getPoseTags(): Promise<PoseTag[]> {
    return this.poseTagsService.getPoseTags();
  }

  @Get('by-poses/:poses')
  @ApiOkResponse({
    type: Pose,
    description: 'タグ付けされたポーズのリスト',
    isArray: true,
  })
  getPoseTagsByPoses(@Param('poses') poseIdentifier: string): Promise<Pose[]> {
    if (!poseIdentifier) {
      throw new HttpException('Invalid pose identifier', 400);
    }

    const requestedPoses: { poseSetName: string; poseTime: number }[] = [];
    const poseIdentifiers = poseIdentifier.split(',');
    for (const poseIdentifier of poseIdentifiers) {
      const [poseSetName, poseTime] = poseIdentifier.split(':');
      requestedPoses.push({
        poseSetName: poseSetName,
        poseTime: Number(poseTime),
      });
    }

    return this.poseTagsService.getPosesWithPoseTags(requestedPoses);
  }
}
