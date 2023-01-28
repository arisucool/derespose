import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Session } from 'src/auth/entities/session.entity';
import { PoseListsService } from 'src/pose-lists/pose-lists.service';
import { PosesService } from 'src/poses/poses.service';
import { PosesModule } from 'src/poses/poses.module';
import { PoseTagsService } from 'src/pose-tags/pose-tags.service';
import { PoseList } from 'src/pose-lists/entities/pose-list.entity';
import { PoseListVote } from 'src/pose-lists/entities/pose-list-vote.entity';

@Module({
  providers: [UsersService, PosesService, PoseListsService, PoseTagsService],
  imports: [
    TypeOrmModule.forFeature([User, Session, PoseList, PoseListVote]),
    PosesModule,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
