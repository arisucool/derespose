import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export class Helper {
  /**
   * APIドキュメントの生成・取得
   * @param app Nest アプリケーション
   * @return 生成されたドキュメント
   */
  static generateAPIDocument(app: INestApplication): OpenAPIObject {
    // アプリケーション名の取得
    let package_name = null,
      package_version = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const package_json = require(`${__dirname}/../../../package.json`);
      package_name = package_json.name;
      package_version = package_version = package_json.version;
    } catch (e) {}

    // ドキュメント情報の設定
    let doc_app_name = null,
      doc_app_description = null,
      doc_app_version = 'x.x.x';
    if (!package_name || package_name === 'im-pact') {
      doc_app_name = 'im pact';
      doc_app_description = `for "${doc_app_name}" by arisu.cool 🍓 Project.`;
    } else {
      doc_app_name = package_name;
      doc_app_description = `for ${doc_app_name} (based on "derespose" by arisu.cool 🍓 Project).`;
    }
    if (package_version) doc_app_version = package_version;

    // Swagger による OpenAPI の対応 (/api/docs/ にてドキュメントを公開)
    const options = new DocumentBuilder()
      .setTitle(`${doc_app_name} API Document`)
      .setDescription(`API Document ${doc_app_description}`)
      .setVersion(doc_app_version)
      .addBearerAuth()
      .build();
    return SwaggerModule.createDocument(app, options);
  }

  /**
   * データベース接続設定の取得
   */
  static getDBSettings(synchronize = true): any {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.length <= 0) {
      // 環境変数 DATABASE_URL が未指定ならば
      // オンメモリデータベースを使用
      console.log('[NOTE] On memory database enabled');
      return {
        type: 'sqlite',
        database: ':memory:',
        dropSchema: true,
        autoLoadEntities: true,
        synchronize: synchronize,
      };
    }

    // DATABASE_URL で指定されたデータベースを使用
    const dbSettings = {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: null,
    };

    // 暗号化通信について設定
    if (process.env.DATABASE_URL.match(/sslmode=disable/)) {
      // DATABASE_URL にて明示的に無効化されているならば
      // 暗号化通信を無効化
      dbSettings.ssl = false;
    } else {
      // 暗号化通信を有効化
      dbSettings.ssl = {
        rejectUnauthorized: false,
      };
    }

    return dbSettings;
  }
}
