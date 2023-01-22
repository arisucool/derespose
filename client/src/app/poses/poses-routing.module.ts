import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PoseListsPageComponent } from './pages/pose-lists-page/pose-lists.component';
import { PoseSetsPageComponent } from './pages/pose-sets-page/pose-sets-page.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';

const routes: Routes = [
  {
    path: 'search/camera',
    component: SearchPageComponent,
    title: '自分でポーズを取って探す',
  },
  {
    path: 'search/tag/:tagName',
    component: SearchPageComponent,
    title: 'タグでポーズを探す',
  },
  {
    path: 'pose-sets',
    component: PoseSetsPageComponent,
    title: 'ポーズの一覧',
  },
  {
    path: 'pose-sets/:poseFileName',
    component: SearchPageComponent,
    title: 'ポーズの一覧',
  },
  {
    path: 'pose-lists',
    component: PoseListsPageComponent,
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
