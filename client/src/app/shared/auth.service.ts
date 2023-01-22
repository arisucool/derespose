import { EventEmitter, Injectable } from '@angular/core';
import { lastValueFrom, Subject } from 'rxjs';
import { User } from 'src/.api-client/models/user';
import { ApiService } from 'src/.api-client/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser?: User;
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

  async getCurrentUser() {
    if (!this.getAccessToken()) {
      this.currentUserSource.next(undefined);
      return undefined;
    }

    let user;
    try {
      user = await lastValueFrom(this.apiService.usersControllerGetMe());
    } catch (e: any) {
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

  setAccessToken(token: string) {
    window.localStorage.setItem('deresposeToken', token);
    window.localStorage.setItem('deresposeLoggedInAt', Date.now().toString());
    console.log(`[AuthService] - setAccessToken`);
  }

  getAccessToken(): string | null {
    const accessToken = window.localStorage.getItem('deresposeToken');
    return accessToken;
  }

  async logout() {
    await lastValueFrom(this.apiService.authControllerLogout());
    window.localStorage.removeItem('deresposeToken');
    window.localStorage.removeItem('deresposeLoggedInAt');
    this.currentUserSource.next(undefined);
    window.location.href = '/';
  }
}
