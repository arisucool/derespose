import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';

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

    let user = await this.usersRepository.findOne({
      where: {
        twitterUserId: profile.id,
      },
    });

    if (!user) {
      user = new User();
      user.twitterAccessToken = token;
      user.twitterUserId = profile.id;
      user.twitterUserName = profile.username;
      user.displayName = profile.displayName;
    }

    user.lastLoggedAt = new Date();
    user.lastLoggedIpAddress = ipAddress;
    user.save();

    let session = new Session();
    session.user = user;
    session.loggedAt = new Date();
    session.loggedIpAddress = ipAddress;
    session = await session.save();
    return session;
  }

  async validateJwtPayload(payload: any): Promise<Session> {
    //console.log(`[AuthService] validateJwtPayload`, payload);
    const session = await this.sessionsRepository.findOne({
      where: {
        id: payload.sessionId,
      },
      relations: ['user'],
    });

    if (!session) return null;

    return session;
  }

  generateJwt(session: Session) {
    //console.log(`[AuthService] generateJwt`, session);
    const payload: JwtPayload = {
      sessionId: session.id,
      userId: session.user.id,
      displayName: session.user.displayName,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
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
