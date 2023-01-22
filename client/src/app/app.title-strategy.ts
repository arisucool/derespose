import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(route: RouterStateSnapshot) {
    const title = this.buildTitle(route);
    if (title === undefined) {
      // 共通のタイトルを設定
      this.title.setTitle(`Derespose - デレスポAR ポーズ検索`);
      return;
    }

    let routeChildren = route?.root.children;
    if (1 <= routeChildren.length) {
      let routeChildren_ = routeChildren[0].children;
      if (1 <= routeChildren_.length) {
        const tagName = routeChildren_[0].params['tagName'];
        if (tagName) {
          // ページ別のタイトルを設定
          this.title.setTitle(
            `${routeChildren_[0]?.routeConfig?.title} > ${tagName} | Derespose`,
          );
          return;
        }
      }
    }

    // ページ別のタイトルを設定
    this.title.setTitle(`${title} | Derespose`);
  }
}
