import {
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
} from '@nestjs/common';
import { PosesService } from './poses.service';

@Controller('poses')
export class PosesController {
  constructor(private posesService: PosesService) {}

  @Get(':poseFileName/:poseTime/pose-tags')
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
