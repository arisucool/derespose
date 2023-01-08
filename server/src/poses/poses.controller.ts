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

  @Get(':poseFileName/:poseTime/pose-tags')
  @ApiResponse({
    type: PoseTag,
    isArray: true,
  })
  async getPoseTags(
    @Param('poseFileName') poseFileName,
    @Param('poseTime') poseTimeString,
  ) {
    const poseTime = parseInt(poseTimeString, 10);
    if (isNaN(poseTime)) {
      throw new HttpException('Invalid pose time', 400);
    }

    const pose = await this.posesService.getPose(poseFileName, poseTime);
    if (!pose) {
      return [];
    }
    return pose.tags;
  }

  @Post(':poseFileName/:poseTime/pose-tags/:poseTagName')
  @ApiResponse({
    type: PoseTag,
    isArray: true,
  })
  async addPoseTag(
    @Param('poseFileName') poseFileName: string,
    @Param('poseTime') poseTimeString: string,
    @Param('poseTagName') poseTagName: string,
  ) {
    const poseTime = parseInt(poseTimeString, 10);
    if (isNaN(poseTime)) {
      throw new HttpException('Invalid pose time', 400);
    }

    let pose = await this.posesService.getPose(poseFileName, poseTime);

    if (!pose) {
      pose = await this.posesService.registerPose(poseFileName, poseTime);
    }

    return this.posesService.addPoseTag(pose.id, poseTagName);
  }

  @Delete(':poseFileName/:poseTime/pose-tags/:poseTagName')
  @ApiResponse({
    type: PoseTag,
    isArray: true,
  })
  async removePoseTag(
    @Param('poseFileName') poseFileName: string,
    @Param('poseTime') poseTimeString: string,
    @Param('poseTagName') poseTagName: string,
  ) {
    const poseTime = parseInt(poseTimeString, 10);
    if (isNaN(poseTime)) {
      throw new HttpException('Invalid pose time', 400);
    }

    let pose = await this.posesService.getPose(poseFileName, poseTime);

    if (!pose) {
      pose = await this.posesService.registerPose(poseFileName, poseTime);
    }

    return this.posesService.removePoseTag(pose.id, poseTagName);
  }
}
