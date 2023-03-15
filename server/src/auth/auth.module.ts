import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TwitterStrategy } from './strategies/twitter.strategy';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { User } from 'src/users/entities/user.entity';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  providers: [AuthService, TwitterStrategy, JwtStrategy, RefreshTokenStrategy],
  imports: [
    // .env ファイルの読み込み
    ConfigModule.forRoot({
      envFilePath: ['.env.development'],
    }),
    // JWT (アクセストークン) の設定
    JwtModule.register({
      secret: process.env.JWT_TOKEN_SECRET,
      signOptions: { expiresIn: process.env.JWT_TOKEN_EXPIRES || '10s' },
    }),
    // Passport の設定
    PassportModule.register({ session: true }),
    // データベースの設定
    TypeOrmModule.forFeature([User, Session]),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
