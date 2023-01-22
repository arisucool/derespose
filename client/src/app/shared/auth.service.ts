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

  constructor(private apiService: ApiService) {}

  async getCurrentUser() {
    if (!this.getAccessToken()) {
      this.currentUserSource.next(undefined);
      return undefined;
    }

    try {
      this.currentUser = await lastValueFrom(
        this.apiService.usersControllerGetMe(),
      );
    } catch (e: any) {
      console.error(`Error getting current user: ${e.message}`);
    }
    this.currentUserSource.next(this.currentUser);
    return this.currentUser;
  }

  getAccessToken(): string | null {
    const accessToken = window.localStorage.getItem('deresposeToken');
    return accessToken;
  }

  async logout() {
    await lastValueFrom(this.apiService.authControllerLogout());
    window.localStorage.removeItem('deresposeToken');
    this.currentUserSource.next(undefined);
    window.location.href = '/';
  }
}
