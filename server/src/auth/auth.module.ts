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

@Module({
  providers: [AuthService, TwitterStrategy, JwtStrategy],
  imports: [
    // .env ファイルの読み込み
    ConfigModule.forRoot({
      envFilePath: ['.env.development'],
    }),
    // JWT の設定
    JwtModule.register({
      secret: process.env.JWT_TOKEN_SECRET,
      signOptions: { expiresIn: '31 days' },
    }),
    // Passport の設定
    PassportModule.register({ session: true }),
    // データベースの設定
    TypeOrmModule.forFeature([User, Session]),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
