import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MaterialModule } from 'src/material.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ConfirmDialogComponent } from './widgets/dialogs/confirm-dialog/confirm-dialog.component';
import { LoadingModalComponent } from './widgets/loading-modal/loading-modal.component';

@NgModule({
  declarations: [ConfirmDialogComponent, LoadingModalComponent],
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
    LoadingModalComponent,
  ],
})
export class SharedModule {}
