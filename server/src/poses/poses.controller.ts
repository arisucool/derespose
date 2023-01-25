import {
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
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

  @Get(':poseSetName/:poseTime/pose-tags')
  @ApiResponse({
    type: PoseTag,
    isArray: true,
  })
  async getPoseTags(
    @Param('poseSetName') poseSetName,
    @Param('poseTime') poseTimeString,
  ) {
    const poseTime = parseInt(poseTimeString, 10);
    if (isNaN(poseTime)) {
      throw new HttpException('Invalid pose time', 400);
    }

    const pose = await this.posesService.getPose(poseSetName, poseTime);
    if (!pose) {
      return [];
    }
    return pose.tags;
  }

  @Post(':poseSetName/:poseTime/pose-tags/:poseTagName')
  @ApiResponse({
    type: PoseTag,
    isArray: true,
  })
  async addPoseTag(
    @Param('poseSetName') poseSetName: string,
    @Param('poseTime') poseTimeString: string,
    @Param('poseTagName') poseTagName: string,
  ) {
    const poseTime = parseInt(poseTimeString, 10);
    if (isNaN(poseTime)) {
      throw new HttpException('Invalid pose time', 400);
    }

    let pose = await this.posesService.getPose(poseSetName, poseTime);

    if (!pose) {
      pose = await this.posesService.registerPose(poseSetName, poseTime);
    }

    return this.posesService.addPoseTag(pose.id, poseTagName);
  }

  @Delete(':poseSetName/:poseTime/pose-tags/:poseTagName')
  @ApiResponse({
    type: PoseTag,
    isArray: true,
  })
  async removePoseTag(
    @Param('poseSetName') poseSetName: string,
    @Param('poseTime') poseTimeString: string,
    @Param('poseTagName') poseTagName: string,
  ) {
    const poseTime = parseInt(poseTimeString, 10);
    if (isNaN(poseTime)) {
      throw new HttpException('Invalid pose time', 400);
    }

    let pose = await this.posesService.getPose(poseSetName, poseTime);

    if (!pose) {
      pose = await this.posesService.registerPose(poseSetName, poseTime);
    }

    return this.posesService.removePoseTag(pose.id, poseTagName);
  }
}
