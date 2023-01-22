import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedPoseTag } from 'src/pose-tags/entities/blocked-pose-tag.entity';
import { PoseTag } from 'src/pose-tags/entities/pose-tag.entity';
import { PoseTagsModule } from 'src/pose-tags/pose-tags.module';
import { PoseTagsService } from 'src/pose-tags/pose-tags.service';
import { Pose } from 'src/poses/entities/pose.entity';
import { PosesModule } from 'src/poses/poses.module';
import { PosesService } from 'src/poses/poses.service';
import { PoseList } from './entities/pose-list.entity';
import { PoseListsController } from './pose-lists.controller';
import { PoseListsService } from './pose-lists.service';

@Module({
  imports: [TypeOrmModule.forFeature([PoseList]), PosesModule, PoseTagsModule],
  controllers: [PoseListsController],
  providers: [PoseListsService, PosesService, PoseTagsService],
})
export class PoseListsModule {}
