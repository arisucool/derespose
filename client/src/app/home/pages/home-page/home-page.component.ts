import { Component, OnInit } from '@angular/core';
import { PoseTag } from 'src/.api-client/models/pose-tag';
import { AuthService } from 'src/app/auth/services/auth.service';
import { PoseTagsService } from '../../../poses/services/pose-tags.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['../../../shared/style.scss', './home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  public poseTags?: PoseTag[];

  constructor(
    public authService: AuthService,
    private poseTagsService: PoseTagsService,
  ) {}

  async ngOnInit() {
    this.poseTags = await this.poseTagsService.getPoseTags();
  }
}
