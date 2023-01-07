import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, Observable, startWith } from 'rxjs';
import { MatchedPose } from '../matched-pose';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-matched-pose',
  templateUrl: './matched-pose.component.html',
  styleUrls: ['../../shared/style.scss', './matched-pose.component.scss'],
})
export class MatchedPoseComponent {
  @Input()
  public pose?: MatchedPose;

  public availableTags: string[] = [
    '手を振る',
    '考える',
    'ダブルピース',
    'おー！',
  ];

  // タグ編集
  @ViewChild('tagInput') tagInput?: ElementRef<HTMLInputElement>;
  public isShowingTagEditForm = false;
  public tagFormCtrl = new FormControl('');
  filteredAvailableTags: Observable<string[]>;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor() {
    this.filteredAvailableTags = this.tagFormCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) =>
        tag ? this.filterTagName(tag) : this.availableTags.slice(),
      ),
    );
  }

  onTagSelected(event: MatAutocompleteSelectedEvent): void {
    if (!this.pose || !this.tagInput) return;

    if (!this.pose.tags) {
      this.pose.tags = [];
    }
    this.pose.tags.push(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.tagFormCtrl.setValue(null);
  }

  addTag(event: MatChipInputEvent) {
    if (!this.pose) return;
    if (!this.pose.tags) this.pose.tags = [];

    const value = (event.value || '').trim();
    if (value) {
      this.pose.tags.push(value);
    }
    event.chipInput!.clear();

    this.tagFormCtrl.setValue(null);
  }

  removeTag(tagName: string) {
    if (!this.pose || !this.pose.tags) return;

    const index = this.pose.tags.indexOf(tagName);
    if (index >= 0) {
      this.pose.tags.splice(index, 1);
    }
  }

  private filterTagName(tagName: string): any {
    const filterValue = tagName.toLowerCase();
    return this.availableTags.filter((tag) =>
      tag.toLowerCase().includes(filterValue),
    );
  }
}
