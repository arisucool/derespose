import { Component, EventEmitter, Output } from '@angular/core';
import {
  PoseFaceExpression,
  PoseSearchFilter,
} from '../../interfaces/pose-search-filter';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['../../../shared/style.scss', './search-filter.component.scss'],
})
export class SearchFilterComponent {
  @Output()
  public onFilterChanged: EventEmitter<PoseSearchFilter> = new EventEmitter();

  public faceExpression = 'all';
  public faceExpressions = [
    {
      label: 'ふつう・無表情',
      value: 'neutral',
    },
    {
      label: '笑顔',
      value: 'smile',
    },
    {
      label: '照れ',
      value: 'blush',
    },
    {
      label: '驚き',
      value: 'surprise',
    },
    {
      label: 'その他',
      value: 'others',
    },
  ];

  public onChanged() {
    this.onFilterChanged.emit({
      faceExpression: this.faceExpression as PoseFaceExpression,
    });
  }
}
