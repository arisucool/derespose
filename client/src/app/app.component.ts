import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from 'src/.api-client/models/user';
import { ApiService } from 'src/.api-client/services/api.service';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  $currentUser: Observable<User | undefined> = this.authService.$currentUser;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.getCurrentUser();
  }
}
