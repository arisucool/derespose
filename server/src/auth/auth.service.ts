import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import * as uuid from 'uuid';

interface JwtPayload {
  sessionId: string;
  userId: string;
  displayName: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Session) private sessionsRepository: Repository<Session>,
  ) {
    return;
  }

  async validateTwitterUser(
    token: string,
    tokenSecret: string,
    profile: any,
    ipAddress: string,
  ): Promise<Session> {
    //console.log(`[AuthService] validateTwitterUser`, profile);

    // ユーザを生成または上書き保存
    let user = await this.usersRepository.findOne({
      where: {
        twitterUserId: profile.id,
      },
    });

    let avatarImageUrl: string | undefined;
    if (profile.photos && profile.photos.length > 0) {
      avatarImageUrl = profile.photos[0].value.replace(/^https:/g, '');
    }

    if (!user) {
      user = new User();
      user.twitterUserId = profile.id;
    }

    user.twitterAccessToken = token;
    user.lastLoggedAt = new Date();
    user.lastLoggedIpAddress = ipAddress;
    user.twitterUserName = profile.username;
    user.displayName = profile.displayName;
    user.avatarImageUrl = avatarImageUrl;
    user = await user.save();

    // セッションを生成
    let session = new Session();
    session.user = user;
    session.loggedAt = new Date();
    session.loggedIpAddress = ipAddress;
    session.refreshToken = this.generateRefreshToken(user);
    session = await session.save();

    return session;
  }

  async validateJwtPayload(payload: { sessionId: string }): Promise<Session> {
    const session = await this.sessionsRepository.findOne({
      where: {
        id: payload.sessionId,
      },
      relations: ['user'],
    });

    if (!session) return null;

    return session;
  }

  async validateRefreshToken(refreshToken: string): Promise<Session> {
    const session = await this.sessionsRepository.findOne({
      where: {
        refreshToken: refreshToken,
      },
      relations: ['user'],
    });

    if (!session) return null;

    return session;
  }

  generateAccessToken(session: Session): string {
    // JWT によるアクセストークンを生成
    const jwtPayload: JwtPayload = {
      sessionId: session.id,
      userId: session.user.id,
      displayName: session.user.displayName,
    };
    const jwtAccessToken = this.jwtService.sign(jwtPayload);
    return jwtAccessToken;
  }

  generateRefreshToken(user: User): string {
    return user.id + '-' + uuid.v4();
  }

  async deleteSession(session: Session) {
    if (!session) return;
    await this.sessionsRepository.delete({
      id: session.id,
    });
  }

  async deleteAllSessionsByUserId(userId: string) {
    if (!userId) return;
    await this.sessionsRepository.delete({
      user: {
        id: userId,
      },
    });
  }
}
