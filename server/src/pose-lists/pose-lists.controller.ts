import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { AddPoseToPoseListDto } from './dtos/add-pose-to-pose-list.dto';
import { CreatePostListDto } from './dtos/create-pose-list.dto';
import { RemovePoseFromPoseListDto } from './dtos/remove-pose-from-pose-list.dto';
import { UpdatePoseListDto } from './dtos/update-pose-list.dto';
import { PoseList } from './entities/pose-list.entity';
import { PoseListsService } from './pose-lists.service';

@Controller('pose-lists')
export class PoseListsController {
  constructor(private poseListsService: PoseListsService) {}

  @Get()
  @ApiOperation({
    summary: '公開されたポーズリストの取得',
  })
  @ApiResponse({
    type: PoseList,
    isArray: true,
  })
  list() {
    return this.poseListsService.getPublicPoseLists();
  }

  @Get(':id')
  @ApiOperation({
    summary: '指定されたポーズリストの取得',
  })
  @ApiResponse({
    type: PoseList,
  })
  get(@Param('id') id: string): Promise<PoseList> {
    return this.poseListsService.getPoseList(id);
  }

  @Post()
  @ApiOperation({
    summary: 'ポーズリストの作成',
  })
  @ApiResponse({
    type: PoseList,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Req() req: any, @Body() dto: CreatePostListDto): Promise<PoseList> {
    return this.poseListsService.createPoseList(dto, req.user.user as User);
  }

  @Put(':id')
  @ApiOperation({
    summary: '指定されたポーズリストの更新',
  })
  @ApiResponse({
    type: PoseList,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePoseListDto,
  ): Promise<PoseList> {
    return this.poseListsService.updatePoseList(id, dto, req.user.user as User);
  }

  @Post(':id/poses')
  @ApiOperation({
    summary: '指定されたポーズリストに対するポーズの追加',
  })
  @ApiResponse({
    type: PoseList,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addPoseToPoseList(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: AddPoseToPoseListDto,
  ): Promise<PoseList> {
    return this.poseListsService.addPoseToPoseList(
      id,
      dto,
      req.user.user as User,
    );
  }

  @Delete(':id/poses')
  @ApiOperation({
    summary: '指定されたポーズリストからのポーズの削除',
  })
  @ApiResponse({
    type: PoseList,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  removePoseFromPoseList(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: RemovePoseFromPoseListDto,
  ): Promise<PoseList> {
    return this.poseListsService.removePoseFromPoseList(
      id,
      dto,
      req.user.user as User,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: '指定されたポーズリストの削除',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  delete(@Req() req: any, @Param('id') id: string) {
    this.poseListsService.deletePoseList(id, req.user.user as User);
  }
}
