import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PoseList } from 'src/.api-client/models/pose-list';
import { PoseListsService } from '../../pose-lists.service';

@Component({
  selector: 'app-my-pose-list-create-dialog',
  templateUrl: './my-pose-list-create-dialog.component.html',
  styleUrls: ['./my-pose-list-create-dialog.component.scss'],
})
export class MyPoseListCreateDialogComponent implements OnInit {
  public title: string = '';
  public publicMode: 'public' | 'sharedByUrl' = 'sharedByUrl';
  public poseList?: PoseList;
  public isCreating?: boolean;

  constructor(
    private dialogRef: MatDialogRef<MyPoseListCreateDialogComponent>,
    private poseListsService: PoseListsService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.isCreating = false;
  }

  async create() {
    if (this.isCreating) return;

    this.isCreating = true;
    let poseList;

    try {
      poseList = await this.poseListsService.createPoseList(
        this.title,
        this.publicMode,
      );
    } catch (e: any) {
      console.error(e);
      this.isCreating = false;
      this.snackBar.open('エラー: ' + e.error.message, 'OK');
      return;
    }
    this.dialogRef.close({
      event: 'close',
      data: {
        poseList: poseList,
      },
    });
  }
}
