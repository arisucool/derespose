import {
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { PoseTag } from 'src/pose-tags/entities/pose-tag.entity';
import { Pose } from './entities/pose.entity';
import { PosesService } from './poses.service';

@Controller('poses')
export class PosesController {
  constructor(private posesService: PosesService) {}

  @Get('by-pose-tags/:poseTagName')
  @ApiResponse({
    type: Pose,
    isArray: true,
  })
  async getPosesByPoseTag(@Param('poseTagName') poseTagName: string) {
    return this.posesService.getPosesByPoseTag(poseTagName);
  }

  @Get(':poseSetName/:poseSetItemId/pose-tags')
  @ApiResponse({
    type: PoseTag,
    isArray: true,
  })
  async getPoseTags(
    @Param('poseSetName') poseSetName: string,
    @Param('poseSetItemId', ParseIntPipe) poseSetItemId: number,
  ) {
    const pose = await this.posesService.getPose(poseSetName, poseSetItemId);
    if (!pose) {
      return [];
    }
    return pose.tags;
  }

  @Post(':poseSetName/:poseSetItemId/pose-tags/:poseTagName')
  @ApiResponse({
    type: PoseTag,
    isArray: true,
  })
  async addPoseTag(
    @Param('poseSetName') poseSetName: string,
    @Param('poseSetItemId', ParseIntPipe) poseSetItemId: number,
    @Param('poseTagName') poseTagName: string,
  ) {
    let pose = await this.posesService.getPose(poseSetName, poseSetItemId);

    if (!pose) {
      pose = await this.posesService.registerPose(poseSetName, poseSetItemId);
    }

    return this.posesService.addPoseTag(pose.id, poseTagName);
  }

  @Delete(':poseSetName/:poseSetItemId/pose-tags/:poseTagName')
  @ApiResponse({
    type: PoseTag,
    isArray: true,
  })
  async removePoseTag(
    @Param('poseSetName') poseSetName: string,
    @Param('poseSetItemId', ParseIntPipe) poseSetItemId: number,
    @Param('poseTagName') poseTagName: string,
  ) {
    let pose = await this.posesService.getPose(poseSetName, poseSetItemId);

    if (!pose) {
      pose = await this.posesService.registerPose(poseSetName, poseSetItemId);
    }

    return this.posesService.removePoseTag(pose.id, poseTagName);
  }
}
