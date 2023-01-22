import {
  Controller,
  Delete,
  Get,
  HttpException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PoseList } from 'src/pose-lists/entities/pose-list.entity';
import { PoseListsService } from 'src/pose-lists/pose-lists.service';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private usersService: UsersService,
    private poseListsService: PoseListsService,
  ) {}

  @Get('/me')
  @ApiOperation({
    summary: '自分のユーザ情報の取得',
  })
  @ApiResponse({
    type: User,
  })
  getMe(@Req() req: any): Promise<User> {
    const userId = req.user.user.id;
    return this.usersService.getUserById(userId);
  }

  @Get('/me/pose-lists')
  @ApiOperation({
    summary: '自分のポーズリストの取得',
  })
  @ApiResponse({
    type: PoseList,
    isArray: true,
  })
  async getMyPoseLists(@Req() req: any): Promise<PoseList[]> {
    const userId = req.user.user.id;
    const user = await this.usersService.getUserById(userId);
    if (!user) throw new HttpException('User not found', 404);

    return this.poseListsService.getPoseListsByUserId(user.id);
  }

  @Delete('/me')
  @ApiOperation({
    summary: '自分のユーザ情報の削除',
  })
  deleteMe(@Req() req: any): Promise<void> {
    const userId = req.user.user.id;
    this.usersService.deleteUserById(userId);
    return;
  }
}
