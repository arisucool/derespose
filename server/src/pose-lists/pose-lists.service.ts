import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PosesService } from 'src/poses/poses.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AddPoseToPoseListDto } from './dtos/add-pose-to-pose-list.dto';
import { CreatePostListDto } from './dtos/create-pose-list.dto';
import { RemovePoseFromPoseListDto } from './dtos/remove-pose-from-pose-list.dto';
import { UpdatePoseListDto } from './dtos/update-pose-list.dto';
import { PoseList } from './entities/pose-list.entity';

@Injectable()
export class PoseListsService {
  constructor(
    private posesService: PosesService,
    @InjectRepository(PoseList)
    private poseListsRepository: Repository<PoseList>,
  ) {}

  async getMyPoseLists(user: User): Promise<PoseList[]> {
    return this.poseListsRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: ['user'],
    });
  }

  async getPublicPoseLists(): Promise<PoseList[]> {
    const items = await this.poseListsRepository.find({
      where: {
        publicMode: 'public',
      },
      relations: ['user'],
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
    const item = await this.poseListsRepository.findOne({
      where: {
        id,
      },
    });
    if (!item) {
      throw new HttpException('Item not found', 404);
    }
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
      poses: await this.getPoseByPoseIdentifiers(dto.poseIdentifiers),
      user: user,
    });
  }

  async updatePoseList(id: string, dto: UpdatePoseListDto, user: User) {
    const item = await this.poseListsRepository.findOne({
      where: {
        id,
      },
    });
    if (!item) {
      throw new HttpException('Item not found', 404);
    }

    if (item.user.id !== user.id) {
      throw new HttpException('Forbidden', 403);
    }

    item.title = dto.title;
    item.description = dto.description;
    item.poses = await this.getPoseByPoseIdentifiers(dto.poseIdentifiers);
    item.createdAt = new Date();

    return this.poseListsRepository.save(item);
  }

  async deletePoseList(id: string, user: User) {
    const item = await this.poseListsRepository.findOne({
      where: {
        id,
      },
    });
    if (!item) {
      throw new HttpException('Item not found', 404);
    }

    if (item.user.id !== user.id) {
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
