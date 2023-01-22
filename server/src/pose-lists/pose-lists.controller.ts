import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { CreatePostListDto } from './dtos/create-pose-list.dto';
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
    @Body() dto: CreatePostListDto,
  ): Promise<PoseList> {
    return this.poseListsService.updatePoseList(id, dto, req.user.user as User);
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
