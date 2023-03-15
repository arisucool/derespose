import { query } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['../../../shared/style.scss', './auth-page.component.scss'],
})
export class AuthPageComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.saveTokens();
  }

  saveTokens() {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    if (!queryParams) {
      return;
    }

    if (
      !queryParams['accessToken'] ||
      queryParams['accessToken'].length === 0
    ) {
      return;
    }
    if (
      !queryParams['refreshToken'] ||
      queryParams['refreshToken'].length === 0
    ) {
      return;
    }

    this.authService.setTokens(
      queryParams['accessToken'],
      queryParams['refreshToken'],
    );

    // トップページへ遷移
    window.location.href = '/';
  }
}
