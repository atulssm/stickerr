import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AgGridModule } from 'ag-grid-angular';
import { FormsModule } from '@angular/forms';
import { ImageCellRendererComponent } from './image-cell-renderer/image-cell-renderer.component'; 

@NgModule({
  declarations: [
    AppComponent,
    ImageCellRendererComponent
  ],
  imports: [
    BrowserModule,
    AgGridModule.withComponents([ImageCellRendererComponent]),
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
