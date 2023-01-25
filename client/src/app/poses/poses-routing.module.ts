import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PoseListsPageComponent } from './pages/pose-lists-page/pose-lists.component';
import { PoseSetsPageComponent } from './pages/pose-sets-page/pose-sets-page.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';

const routes: Routes = [
  // 自分でポーズをとって探す
  {
    path: 'search/camera',
    component: SearchPageComponent,
    title: '自分でポーズをとって探す',
  },
  // タグでポーズを探す (タグ検索)
  {
    path: 'pose-tags/:tagName',
    component: SearchPageComponent,
    title: 'タグでポーズを探す',
  },
  // 全てのポーズをじっくり眺める (ポーズセット)
  {
    path: 'pose-sets',
    component: PoseSetsPageComponent,
    title: 'ポーズセットの一覧',
  },
  {
    path: 'pose-sets/:poseSetName',
    component: SearchPageComponent,
    title: 'ポーズセット > ポーズの一覧',
  },
  // ポーズリスト
  {
    path: 'pose-lists',
    component: PoseListsPageComponent,
    title: 'ポーズリストの一覧',
  },
  {
    path: 'pose-lists/:poseListId',
    component: SearchPageComponent,
    title: 'ポーズリスト',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PosesRoutingModule {}
