import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MaterialModule } from 'src/material.module';
import { NgxMpPoseExtractorModule } from 'ngx-mp-pose-extractor';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxSpinnerModule.forRoot({
      type: 'ball-fussion',
    }),
  ],
  providers: [],
  exports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    NgxMpPoseExtractorModule,
  ],
})
export class SharedModule {}
