import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MaterialModule } from 'src/material.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ConfirmDialogComponent } from './widgets/dialogs/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [ConfirmDialogComponent],
  imports: [
    CommonModule,
    MaterialModule,
    NgxSpinnerModule.forRoot({
      type: 'ball-fussion',
    }),
  ],
  providers: [],
  exports: [
    CommonModule,
    MaterialModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
  ],
})
export class SharedModule {}
