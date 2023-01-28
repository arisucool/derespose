import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoseTagsModule } from 'src/pose-tags/pose-tags.module';
import { PoseTagsService } from 'src/pose-tags/pose-tags.service';
import { PosesModule } from 'src/poses/poses.module';
import { PosesService } from 'src/poses/poses.service';
import { PoseListVote } from './entities/pose-list-vote.entity';
import { PoseList } from './entities/pose-list.entity';
import { PoseListsController } from './pose-lists.controller';
import { PoseListsService } from './pose-lists.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PoseList, PoseListVote]),
    PosesModule,
    PoseTagsModule,
  ],
  controllers: [PoseListsController],
  providers: [PoseListsService, PosesService, PoseTagsService],
})
export class PoseListsModule {}
