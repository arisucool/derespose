import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
  public tags: string[] = [
    'ハート',
    'ダブルピース',
    '手を振る',
    '考える',
    'おー！',
    'びっくり',
    'がんばる',
  ];
}
