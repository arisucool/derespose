import { query } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['../shared/style.scss', './auth-page.component.scss'],
})
export class AuthPageComponent implements OnInit {
  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    if (queryParams['token'] && queryParams['token'].length > 0) {
      window.localStorage.setItem('deresposeToken', queryParams['token']);

      // トップページへ遷移
      window.location.href = '/';
    }
  }
}
