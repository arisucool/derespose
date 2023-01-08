import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tag-search-form',
  templateUrl: './tag-search-form.component.html',
  styleUrls: ['./tag-search-form.component.scss'],
})
export class TagSearchFormComponent {
  @Input()
  public tagName?: string = '';
}
