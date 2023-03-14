import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { Pose } from 'src/poses/entities/pose.entity';
import { GetPoseTagsByPosesDto } from './dtos/get-pose-tags-by-poses.dto';
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
  @ApiParam({
    name: 'isIncludeRepresentivePoses',
    description: '代表するポーズを含めるかどうか',
    required: false,
    type: Boolean,
  })
  getPoseTags(@Param() isIncludeRepresentivePoses = false): Promise<PoseTag[]> {
    return this.poseTagsService.getPoseTags(isIncludeRepresentivePoses);
  }

  @Post('by-poses')
  @ApiOkResponse({
    type: Pose,
    description: 'タグ付けされたポーズのリスト',
    isArray: true,
  })
  getPoseTagsByPoses(@Body() dto: GetPoseTagsByPosesDto): Promise<Pose[]> {
    const requestedPoses: { poseSetName: string; poseSetItemId: number }[] = [];
    if (!dto.poseIdentifiers) {
      throw new HttpException('poseIdentifiers is required', 400);
    }
    for (const poseIdentifier of dto.poseIdentifiers) {
      const [poseSetName, poseId] = poseIdentifier.split(':');
      requestedPoses.push({
        poseSetName: poseSetName,
        poseSetItemId: Number(poseId),
      });
    }

    return this.poseTagsService.getPosesWithPoseTags(requestedPoses);
  }
}
