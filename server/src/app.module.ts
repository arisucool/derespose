import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { Helper } from './helper';
import { PosesModule } from './poses/poses.module';
import { PoseTagsModule } from './pose-tags/pose-tags.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // Serve the frontend (Angular) app (../../client/dist/client/) as a static files
    // (for production environment)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client', 'dist', 'client'),
    }),
    // .env ファイルの読み込み
    ConfigModule.forRoot({
      envFilePath: ['.env.development'],
    }),
    // データベースへ接続するための設定
    TypeOrmModule.forRoot(Helper.getDBSettings()),
    // モジュール
    PosesModule,
    PoseTagsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
