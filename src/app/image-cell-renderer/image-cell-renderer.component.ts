import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-cell-renderer',
  templateUrl: './image-cell-renderer.component.html',
  styleUrls: ['./image-cell-renderer.component.css']
})
export class ImageCellRendererComponent implements OnInit {
  params: any;
  filePath = "";
  constructor() { }

  ngOnInit(): void {
  }

  agInit(params: any) {
    this.params = params;
  }

  openFileSelector(event: any) {
    console.log(event);
  }

  onFileChange(event: any) {
    //Read input file path and set to the variable
    this.filePath = event.target.files[0].name;

    const files = event.target.files[0];
    if (files) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(files);
      fileReader.addEventListener("load", () => {
        this.filePath = fileReader.result?.toString() || "";
        this.params.setValue(this.filePath);
      });
    }
  }

}
