import { EventEmitter, Injectable } from '@angular/core';
import { lastValueFrom, Subject } from 'rxjs';
import * as uuid from 'uuid';
import { User } from 'src/.api-client/models/user';
import { ApiService } from 'src/.api-client/services/api.service';

interface SavedTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser?: User;
  private accessToken?: string;
  private currentUserSource = new Subject<User | undefined>();
  public $currentUser = this.currentUserSource.asObservable();

  private timerForWatchingLoginState: any;
  private previousLoggedInAt = 0;

  constructor(private apiService: ApiService) {
    this.startWatchingLoginState();
  }

  startWatchingLoginState() {
    if (this.timerForWatchingLoginState)
      clearInterval(this.timerForWatchingLoginState);

    this.timerForWatchingLoginState = setInterval(() => {
      const loggedInAtStr = window.localStorage.getItem('deresposeLoggedInAt');
      if (!loggedInAtStr) return;

      const loggedInAt = parseInt(loggedInAtStr, 10);
      if (isNaN(loggedInAt)) return;

      if (this.previousLoggedInAt != loggedInAt) {
        console.log(`[AuthService] - Detect login state changed`);
        this.previousLoggedInAt = loggedInAt;
        this.getCurrentUser();
      }
    }, 1000);
  }

  async getCurrentUser(enableRetry = true): Promise<User | undefined> {
    if (!this.getAccessToken()) {
      this.currentUserSource.next(undefined);
      return undefined;
    }

    let user;
    try {
      user = await lastValueFrom(this.apiService.usersControllerGetMe());
    } catch (e: any) {
      if (e.status === 401) {
        this.clearTokens();
        return undefined;
      }
      console.error(`Error getting current user: ${e.message}`);
    }

    this.currentUser = user;
    this.currentUserSource.next(user);
    return user;
  }

  isLoggedIn() {
    if (this.currentUser) return true;
    return false;
  }

  setTokens(accessToken: string, refreshToken: string) {
    const tokens: SavedTokens = {
      accessToken,
      refreshToken,
    };
    window.localStorage.setItem('deresposeTokens', JSON.stringify(tokens));
    window.localStorage.setItem('deresposeLoggedInAt', Date.now().toString());
    console.log(`[AuthService] - setTokens`);
  }

  clearTokens() {
    this.currentUser = undefined;
    window.localStorage.removeItem('deresposeTokens');
    window.localStorage.removeItem('deresposeLoggedInAt');
    this.currentUserSource.next(undefined);
  }

  getAccessToken(): string | undefined {
    return this.getSavedTokens()?.accessToken;
  }

  async refreshAccessToken(): Promise<string | undefined> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return undefined;

    try {
      const response = await lastValueFrom(
        this.apiService.authControllerRefreshToken({
          'X-Refresh-Token': refreshToken,
        }),
      );
      console.log(`[AuthService] refreshAccessToken - Refreshed`);
      this.setTokens(response, refreshToken);
      return response;
    } catch (e: any) {
      console.error(`[AuthService] refreshAccessToken`, e);
      return undefined;
    }
  }

  async logout() {
    await lastValueFrom(this.apiService.authControllerLogout());
    this.clearTokens();
    window.location.href = '/';
  }

  getRandomUserIdentifier() {
    let identifier = window.localStorage.getItem('deresposeRandomUID');
    if (identifier) return identifier;

    identifier = uuid.v4();
    window.localStorage.setItem('deresposeRandomUID', identifier);
    return identifier;
  }

  private getRefreshToken(): string | undefined {
    return this.getSavedTokens()?.refreshToken;
  }

  private getSavedTokens(): SavedTokens | undefined {
    const tokensJson = window.localStorage.getItem('deresposeTokens');
    if (!tokensJson) return undefined;

    try {
      const tokens = JSON.parse(tokensJson);
      return tokens;
    } catch (e: any) {}

    return undefined;
  }
}
