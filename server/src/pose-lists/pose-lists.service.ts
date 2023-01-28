import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { PosesService } from 'src/poses/poses.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AddPoseToPoseListDto } from './dtos/add-pose-to-pose-list.dto';
import { AddVoteToPoseListDto } from './dtos/add-vote-to-pose-list.dto';
import { CreatePostListDto } from './dtos/create-pose-list.dto';
import { RemovePoseFromPoseListDto } from './dtos/remove-pose-from-pose-list.dto';
import { UpdatePoseListDto } from './dtos/update-pose-list.dto';
import { PoseListVote } from './entities/pose-list-vote.entity';
import { PoseList } from './entities/pose-list.entity';

@Injectable()
export class PoseListsService {
  constructor(
    private posesService: PosesService,
    @InjectRepository(PoseList)
    private poseListsRepository: Repository<PoseList>,
    @InjectRepository(PoseListVote)
    private poseListVotesRepository: Repository<PoseListVote>,
  ) {}

  async getMyPoseLists(user: User): Promise<PoseList[]> {
    const items = await this.poseListsRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: ['user', 'votes'],
    });

    items?.map((item) => {
      item.votes = item.votes?.map((vote) => {
        delete vote.ipAddress;
        delete vote.randomUid;
        return vote;
      });
      return item;
    });

    return items;
  }

  async getPublicPoseLists(): Promise<PoseList[]> {
    const items = await this.poseListsRepository.find({
      where: {
        publicMode: 'public',
      },
      relations: ['user'],
      order: {
        votesCount: 'DESC',
      },
    });

    items.map((item) => {
      delete item.user.createdAt;
      delete item.user.lastLoggedAt;
      delete item.user.lastLoggedIpAddress;
      delete item.user.twitterUserId;
      return item;
    });

    return items;
  }

  async getPoseList(id: string): Promise<PoseList> {
    let item: PoseList;
    try {
      item = await this.poseListsRepository.findOne({
        where: {
          id,
        },
        relations: ['user', 'poses', 'votes'],
      });
    } catch (e: any) {
      throw new HttpException(e.message, 400);
    }

    if (!item) {
      throw new HttpException('Item not found', 404);
    }

    delete item.user.createdAt;
    delete item.user.lastLoggedAt;
    delete item.user.lastLoggedIpAddress;
    delete item.user.twitterUserId;
    item.votes = item.votes?.map((vote) => {
      delete vote.ipAddress;
      delete vote.randomUid;
      return vote;
    });

    return item;
  }

  async createPoseList(dto: CreatePostListDto, user: User) {
    const now = new Date();

    if (
      await this.poseListsRepository.countBy({
        title: dto.title,
        user: {
          id: user.id,
        },
      })
    ) {
      throw new HttpException('Title already exists', 400);
    }

    return this.poseListsRepository.save({
      title: dto.title,
      createdAt: now,
      updatedAt: now,
      publicMode: dto.publicMode,
      description: dto.description,
      poses: [],
      user: user,
    });
  }

  async updatePoseList(id: string, dto: UpdatePoseListDto, user: User) {
    const item = await this.poseListsRepository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });
    if (!item) {
      throw new HttpException('Item not found', 404);
    }

    if (!item.user || item.user.id !== user.id) {
      throw new HttpException('Forbidden', 403);
    }

    item.title = dto.title;
    item.description = dto.description;
    item.poses = await this.getPoseByPoseIdentifiers(dto.poseIdentifiers);
    item.publicMode = dto.publicMode;
    item.updatedAt = new Date();

    return this.poseListsRepository.save(item);
  }

  async deletePoseList(id: string, user: User) {
    const item = await this.poseListsRepository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });
    if (!item) {
      throw new HttpException('Item not found', 404);
    }

    if (!item.user || item.user.id !== user.id) {
      throw new HttpException('Forbidden', 403);
    }

    return item.remove();
  }

  async addPoseToPoseList(
    id: string,
    dto: AddPoseToPoseListDto,
    user: User,
  ): Promise<PoseList> {
    const pose = await this.posesService.getPose(
      dto.poseSetName,
      dto.poseTime,
      true,
    );

    if (!pose) return;

    const item = await this.poseListsRepository.findOne({
      where: {
        id,
      },
      relations: ['user', 'poses'],
    });

    if (!item) {
      throw new HttpException('Item not found', 404);
    }

    if (item.user.id !== user.id) {
      throw new HttpException('Forbidden', 403);
    }

    item.poses.push(pose);
    return this.poseListsRepository.save(item);
  }

  async removePoseFromPoseList(
    id: string,
    dto: RemovePoseFromPoseListDto,
    user: User,
  ): Promise<PoseList> {
    const pose = await this.posesService.getPose(
      dto.poseSetName,
      dto.poseTime,
      true,
    );

    if (!pose) return;

    const item = await this.poseListsRepository.findOne({
      where: {
        id,
      },
      relations: ['user', 'poses'],
    });

    if (!item) {
      throw new HttpException('Item not found', 404);
    }

    if (item.user.id !== user.id) {
      throw new HttpException('Forbidden', 403);
    }

    item.poses = item.poses.filter((p) => p.id !== pose.id);
    return this.poseListsRepository.save(item);
  }

  async addVoteToPoseList(
    id: string,
    dto: AddVoteToPoseListDto,
    req: Request,
  ): Promise<PoseList> {
    const ipAddress = req.get('x-forwarded-for') || req.ip;

    try {
      await this.poseListVotesRepository.save({
        randomUid: dto.randomUid,
        poseList: {
          id,
        },
        ipAddress: ipAddress,
      });
    } catch (e: any) {
      console.warn(`[PoseListsService] addVoteToPoseList: ${e.message}`);
    }

    return await this.getPoseList(id);
  }

  async removeVoteFromPoseList(
    id: string,
    dto: AddVoteToPoseListDto,
    req: Request,
  ): Promise<PoseList> {
    try {
      await this.poseListVotesRepository.delete({
        randomUid: dto.randomUid,
        poseList: {
          id,
        },
      });
    } catch (e: any) {
      console.warn(`[PoseListsService] deleteVoteByPoseList: ${e.message}`);
    }

    return await this.getPoseList(id);
  }

  getPoseListsByUserId(userId: string): Promise<PoseList[]> {
    return this.poseListsRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['poses'],
    });
  }

  private async getPoseByPoseIdentifiers(poseIdentifiers: string[]) {
    const poses = [];
    for (const poseIdentifier of poseIdentifiers) {
      const arr = poseIdentifier.split(/:/);
      if (arr.length !== 2) {
        continue;
      }
      const poseSetName = arr[0];
      const poseTime = parseInt(arr[1], 10);
      const pose = await this.posesService.getPose(poseSetName, poseTime, true);
      if (!pose) continue;
      poses.push(pose);
    }
    return poses;
  }
}
