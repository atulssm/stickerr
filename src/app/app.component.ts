import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { ImageCellRendererComponent } from './image-cell-renderer/image-cell-renderer.component';

type tplotOptions = {
  [key: string]: any
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'stickerr';
  fontSize = 16;
  marginBottom = 10;
  showPrintPage = false;
  defaultColDef: ColDef = {
    editable: true
  };

  columnDefs: ColDef[] = [
    { field: "image", cellRendererFramework: ImageCellRendererComponent, editable: false },
    { field: 'description' },
    { field: 'code' },
    { field: 'qty' },
    { field: 'itemPerCase' },
    { field: 'finish' },
  ];

  rowData: any[] = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];

  printPages: any[] = [];

  gridApi: any;
  gridColumnApi: any;

  print() {
    this.printPages = [];
    console.log(this.rowData);
    this.showPrintPage = true;



    let printPages: any = [];
    let count = 0;
    this.gridApi.rowModel.forEachNode((e: any) => {

      let row = e.data;

      let totalItems = row.qty / row.itemPerCase;

      for (let j = 0; j < totalItems; j++) {

        if (printPages.length == 4) {
          this.printPages.push(printPages);
          printPages = [];
        }

        let page = {
          image: row.image,
          description: row.description,
          code: row.code,
          qty: row.itemPerCase,
          itemPerCase: row.itemPerCase,
          caseNo: `${++count}`,
          finish: row.finish
        }
        printPages.push(page);
      }


      //let item = this.rowData.slice(i * 4, i * 4 + 4);


    })
    this.printPages.push(printPages);

    // setTimeout((e: any) => { window.print(); }, 1000)


  }

  closePrintPopup() {
    this.showPrintPage = false;
  }

  ngOnInit() {
    window.addEventListener('paste', this.insertNewRowsBeforePaste.bind(this));
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  insertNewRowsBeforePaste(event: any) {



    console.log(event)

    let clipboardData = event.clipboardData.getData('text/plain');

    let rows = clipboardData.split('\n');

    let focusedCell = this.gridApi.getFocusedCell();
    let startRowIndex = focusedCell.rowIndex;
    let startColIndex = this.columnDefs.findIndex(e => e.field == focusedCell.column.getColId());


    let availableRows = this.gridApi.rowModel.getRowCount();
    if (startRowIndex + rows.length > availableRows) {
      this.gridApi.updateRowData({ add: Array(rows.length - availableRows).fill({}) });
    }

    for (let i = 0; i < rows.length && rows[i] !== ""; i++) {
      let node = this.gridApi.getRowNode(startRowIndex + i);
      let cells = rows[i].split('\t');
      let data = Object.assign({}, node.data);
      for (let j = 0; j < cells.length; j++) {
        let colIndex = this.columnDefs[startColIndex + j].field || "";
        data[colIndex] = cells[j];
      }
      node.setData(data);
    }

  }
}
