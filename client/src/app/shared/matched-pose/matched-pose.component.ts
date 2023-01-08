import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { MatchedPose } from '../matched-pose';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { PoseTagsService } from '../pose-tags.service';
import { PoseTag } from 'src/.api-client/models/pose-tag';

@Component({
  selector: 'app-matched-pose',
  templateUrl: './matched-pose.component.html',
  styleUrls: ['../../shared/style.scss', './matched-pose.component.scss'],
})
export class MatchedPoseComponent implements OnInit, OnDestroy {
  @Input()
  public pose?: MatchedPose;

  public availableTags: PoseTag[] = [];

  public onAvailablePoseTagsChangedSubscription?: Subscription;

  // タグ編集
  @ViewChild('tagInput') tagInput?: ElementRef<HTMLInputElement>;
  public isShowingTagEditForm = false;
  public tagFormCtrl = new FormControl('');
  filteredAvailableTags: Observable<string[]>;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private poseTagsService: PoseTagsService) {
    this.filteredAvailableTags = this.tagFormCtrl.valueChanges.pipe(
      startWith(null),
      map((tagName: string | null) => {
        const t = tagName
          ? this.filterTagName(tagName)
          : this.availableTags.slice().map((tag) => tag.name);
        console.log(`[MatchedPoseComponent] filteredAvailableTags`, t);
        return t;
      }),
    );
  }

  async ngOnInit() {
    this.availableTags = await this.poseTagsService.getPoseTags();
    this.onAvailablePoseTagsChangedSubscription =
      this.poseTagsService.onAvailablePoseTagsChanged.subscribe(
        (poseTags: PoseTag[]) => {
          this.availableTags = poseTags;
        },
      );
  }

  ngOnDestroy() {
    if (this.onAvailablePoseTagsChangedSubscription) {
      this.onAvailablePoseTagsChangedSubscription.unsubscribe();
    }
  }

  onTagSelected(event: MatAutocompleteSelectedEvent): void {
    if (!this.pose || !this.tagInput) return;

    const tagName = event.option.viewValue;

    if (!this.pose.tags) {
      this.pose.tags = [];
    }

    if (this.pose.tags.includes(tagName)) {
      return;
    }

    this.pose.tags.push(tagName);
    this.tagInput.nativeElement.value = '';
    this.tagFormCtrl.setValue(null);

    this.poseTagsService.addPoseTag(
      this.pose.poseFileName,
      this.pose.time,
      tagName,
    );
  }

  addTag(event: MatChipInputEvent) {
    if (!this.pose) return;
    if (!this.pose.tags) this.pose.tags = [];

    const tagName = (event.value || '').trim();

    event.chipInput!.clear();
    this.tagFormCtrl.setValue(null);

    if (!tagName) {
      return;
    }

    if (this.pose.tags.includes(tagName)) {
      return;
    }

    this.pose.tags.push(tagName);

    this.poseTagsService.addPoseTag(
      this.pose.poseFileName,
      this.pose.time,
      tagName,
    );
  }

  async removeTag(tagName: string) {
    if (!this.pose || !this.pose.tags) return;

    const index = this.pose.tags.indexOf(tagName);
    if (index < 0) {
      return;
    }

    this.pose.tags.splice(index, 1);

    await this.poseTagsService.removePoseTag(
      this.pose.poseFileName,
      this.pose.time,
      tagName,
    );
  }

  private filterTagName(tagName: string): any {
    const filterValue = tagName.toLowerCase();
    const tagNames = this.availableTags
      .filter((tag) => tag.name.toLowerCase().includes(filterValue))
      .map((tag) => {
        return tag.name;
      });
    console.log(`[MatchedPoseComponent] filterTagName - ${tagName}`, tagNames);
    return tagNames;
  }
}
