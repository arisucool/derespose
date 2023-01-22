import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-twitter';
import { AuthService } from '../auth.service';
import { Session } from '../entities/session.entity';

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    if (!process.env.TWITTER_API_KEY) {
      console.warn('[TwitterStrategy] TWITTER_API_KEY is not defined');
    } else if (!process.env.TWITTER_API_KEY_SECRET) {
      console.warn('[TwitterStrategy] TWITTER_API_KEY_SECRET is not defined');
    } else if (!process.env.TWITTER_API_CALLBACK_URL) {
      console.warn('[TwitterStrategy] TWITTER_API_CALLBACK_URL is not defined');
    }

    super({
      consumerKey: process.env.TWITTER_API_KEY,
      consumerSecret: process.env.TWITTER_API_KEY_SECRET,
      callbackURL: process.env.TWITTER_API_CALLBACK_URL,

      // リクエスト情報を validate メソッドへ渡す
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    token: string,
    tokenSecret: string,
    profile: any,
  ): Promise<Session> {
    const ipAddress = req.get('x-forwarded-for') || req.ip;

    return this.authService.validateTwitterUser(
      token,
      tokenSecret,
      profile,
      ipAddress,
    );
  }
}
