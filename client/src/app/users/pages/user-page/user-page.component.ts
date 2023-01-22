import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/.api-client/models/user';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['../../../common/style.scss', './user-page.component.scss'],
})
export class UserPageComponent implements OnInit {
  $currentUser!: Observable<User | undefined>;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.$currentUser = this.authService.$currentUser;
    this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
  }
}
