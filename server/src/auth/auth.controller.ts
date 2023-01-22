import {
  Controller,
  Get,
  HttpException,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Session } from './entities/session.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TwitterAuthGuard } from './guards/twitter-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(TwitterAuthGuard)
  @Get('login/twitter')
  loginWithTwitter() {
    // TwitterAuthGuard および TwitterStrategy によって、Twitter の認証ページへリダイレクトされる
    return;
  }

  @UseGuards(TwitterAuthGuard)
  @Get('callback/twitter')
  async callbackWithTwitter(@Req() req: any, @Res() res: Response) {
    const session: Session = req.user;
    if (!session) {
      throw new HttpException('Session is not found', 401);
    }

    const jwt = this.authService.generateJwt(session);
    res.redirect(`/auth/callback?token=${jwt.access_token}`);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('logout')
  async logout(@Req() req: any) {
    const session: Session = req.user;
    if (!session) {
      throw new HttpException('Session is not found', 401);
    }

    return await this.authService.deleteAllSessionsByUserId(session.user.id);
  }
}
