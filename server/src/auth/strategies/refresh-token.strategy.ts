import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Session } from '../entities/session.entity';
import { Strategy } from 'passport-custom';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: Request): Promise<Session> {
    const refreshTokenHeader = req.header('X-Refresh-Token');
    if (!refreshTokenHeader || refreshTokenHeader.length === 0) {
      return null;
    }

    return this.authService.validateRefreshToken(refreshTokenHeader);
  }
}
