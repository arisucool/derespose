import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { ConfirmDialogOptions } from '../interfaces/app-dialog';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../widgets/dialogs/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class AppDialogService {
  constructor(private matDialog: MatDialog) {}

  public async openConfirmDialog(
    title: string,
    text: string,
    options: ConfirmDialogOptions = {},
  ): Promise<boolean> {
    const data: ConfirmDialogData = {
      title,
      text: text,
      positiveButtonLabel: options.positiveButtonLabel || 'OK',
      positiveButtonColor: options.positiveButtonColor || 'primary',
      negativeButtonLabel: options.negativeButtonLabel || 'キャンセル',
    };

    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      data: data,
      autoFocus: options.autoFocus === undefined ? true : options.autoFocus,
    });
    const result = await lastValueFrom(dialogRef.afterClosed());

    if (!result || result !== 'OK') return false;

    return true;
  }
}
