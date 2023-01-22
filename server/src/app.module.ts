import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { Helper } from './helper';
import { PosesModule } from './poses/poses.module';
import { PoseTagsModule } from './pose-tags/pose-tags.module';
import { ConfigModule } from '@nestjs/config';
import { ForceHttpsMiddleware } from './shared/force-https/force-https.middleware';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PoseListsModule } from './pose-lists/pose-lists.module';

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
    UsersModule,
    AuthModule,
    PoseListsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ForceHttpsMiddleware).forRoutes('*');
  }
}
