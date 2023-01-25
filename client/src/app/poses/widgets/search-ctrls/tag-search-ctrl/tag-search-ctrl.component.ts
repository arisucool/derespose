import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tag-search-ctrl',
  templateUrl: './tag-search-ctrl.component.html',
  styleUrls: ['./tag-search-ctrl.component.scss'],
})
export class TagSearchCtrlComponent {
  @Input()
  public tagName?: string = '';
}
