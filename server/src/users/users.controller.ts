import { Controller, Delete, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/me')
  @ApiResponse({
    type: User,
  })
  getMe(@Req() req: any): Promise<User> {
    const userId = req.user.user.id;
    return this.usersService.getUserById(userId);
  }

  @Delete('/me')
  deleteMe(@Req() req: any): Promise<void> {
    const userId = req.user.user.id;
    this.usersService.deleteUserById(userId);
    return;
  }
}
