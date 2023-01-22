import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedPoseTag } from 'src/pose-tags/entities/blocked-pose-tag.entity';
import { PoseTag } from 'src/pose-tags/entities/pose-tag.entity';
import { PoseTagsService } from 'src/pose-tags/pose-tags.service';
import { Pose } from 'src/poses/entities/pose.entity';
import { PosesController } from './poses.controller';
import { PosesService } from './poses.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlockedPoseTag, Pose, PoseTag])],
  controllers: [PosesController],
  providers: [PosesService, PoseTagsService],
  exports: [TypeOrmModule],
})
export class PosesModule {}
