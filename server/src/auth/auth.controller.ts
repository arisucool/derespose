import {
  Controller,
  Get,
  HttpException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiProduces,
  ApiResponse,
  ApiResponseProperty,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Session } from './entities/session.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenAuthGuard } from './guards/refresh-token-auth.guard';
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

    // JWT によるアクセストークンおよびリフレッシュトークンを生成してクライアントへ返す
    // (クライアント側では AuthPageComponent が処理する)
    const accessToken = this.authService.generateAccessToken(session);
    res.redirect(
      `/auth/callback?accessToken=${accessToken}&refreshToken=${session.refreshToken}`,
    );
  }

  @UseGuards(RefreshTokenAuthGuard)
  @Post('refreshToken')
  @ApiProduces(`text/plain`)
  @ApiHeader({
    name: 'X-Refresh-Token',
    description: 'リフレッシュトークン',
  })
  @ApiResponse({
    type: String,
  })
  refreshToken(@Req() req: any) {
    const session: Session = req.user;
    if (!session) {
      throw new HttpException('Session is not found', 401);
    }

    // JWT によるアクセストークンを生成してクライアントへ返す
    return this.authService.generateAccessToken(session);
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
