import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pose } from 'src/poses/entities/pose.entity';
import { PoseTag } from './entities/pose-tag.entity';
import { PoseTagsController } from './pose-tags.controller';
import { PoseTagsService } from './pose-tags.service';

@Module({
  imports: [TypeOrmModule.forFeature([PoseTag, Pose])],
  controllers: [PoseTagsController],
  providers: [PoseTagsService],
})
export class PoseTagsModule {}
