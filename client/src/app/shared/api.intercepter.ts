import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, lastValueFrom, Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

/**
 * API クライアントによる通信にアクセストークンを付与するための Intercepter
 */
@Injectable()
export class ApiIntercepter implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const accessToken = this.authService.getAccessToken();
    if (accessToken) {
      // Authorization ヘッダにアクセストークンを付与
      req = this.appendAuthHeader(req, accessToken);
    }

    if (!accessToken || req.url.match(/auth\/refreshToken/)) {
      // アクセストークンのない場合またはリフレッシュトークンの取得ならば、そのままリクエスト処理
      return next.handle(req);
    }

    // リクエストを処理して、エラーだった場合はエラー処理を実行
    return next
      .handle(req)
      .pipe(catchError((res) => this.onRequestDenied(req, res, next)));
  }

  private appendAuthHeader(req: HttpRequest<any>, accessToken: string) {
    if (!accessToken) return req;

    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  private async onRequestDenied(
    req: HttpRequest<any>,
    res: any,
    next: HttpHandler,
  ) {
    if (res.error.statusCode === 401) {
      // アクセストークンの期限切れならば
      console.log(`[ApiIntercepter] intercept - token has expired...`, res);

      // アクセストークンのリフレッシュ
      if (!(await this.authService.refreshAccessToken())) {
        console.error(`[ApiIntercepter] intercept - Could not refresh token`);
        this.authService.clearTokens();
        return lastValueFrom(throwError(res));
      }

      // Authorization ヘッダに新しいアクセストークンをセット
      const accessToken = this.authService.getAccessToken();
      if (accessToken) {
        req = this.appendAuthHeader(req, accessToken);
      }

      // 元のリクエストを再試行
      console.info(`[ApiIntercepter] intercept - retrying...`, req);
      return lastValueFrom(next.handle(req));
    }

    // そのままエラーを返す
    return lastValueFrom(throwError(res));
  }
}
