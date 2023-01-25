import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MaterialModule } from 'src/material.module';

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
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
  ],
})
export class SharedModule {}
