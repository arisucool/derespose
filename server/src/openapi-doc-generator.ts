/**
 * APIドキュメントを生成するためのスクリプト
 * (サーバの起動なしにAPIドキュメントのJSONファイルを生成可能)
 */

import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { Helper } from './helper';
import * as fs from 'fs';

async function bootstrap(): Promise<void> {
  // AppModule にてインポートされているモジュールを取得
  const imports = Reflect.getMetadata('imports', AppModule);
  const modules = imports.filter((item: any) => {
    return typeof item === 'function';
  });

  // 各モジュールのコントローラおよびプロバイダを取得
  let controllers = Reflect.getMetadata('controllers', AppModule);
  let providers = Reflect.getMetadata('providers', AppModule);
  for (const mod of modules) {
    controllers = controllers.concat(Reflect.getMetadata('controllers', mod));
    providers = providers.concat(Reflect.getMetadata('providers', mod));
  }

  controllers = controllers.filter((controller: any) => {
    return controller !== undefined;
  });

  // プロバイダのモックを生成
  const mockedProviders = providers
    .filter((provider: any) => {
      return provider !== undefined;
    })
    .map((provider: any) => {
      return {
        provide: provider,
        useValue: {},
      };
    });

  // アプリケーションのインスタンスを生成
  const testingModule = await Test.createTestingModule({
    controllers: controllers,
    providers: mockedProviders,
  }).compile();

  const app = testingModule.createNestApplication();

  // URLのプレフィックスが /api となるように設定
  app.setGlobalPrefix('api');

  // API ドキュメント (JSON) を生成
  const document = Helper.generateAPIDocument(app);
  const docJson = JSON.stringify(document);

  // 引数を確認
  let outputPath = null;
  for (const arg of process.argv) {
    if (arg.match(/^--output=(.+)$/)) {
      outputPath = RegExp.$1;
      break;
    }
  }

  // API ドキュメント (JSON) を出力
  if (outputPath) {
    fs.writeFileSync(outputPath, docJson);
  } else {
    console.log(docJson);
  }
}

bootstrap();
