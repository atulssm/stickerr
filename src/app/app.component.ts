import { Component } from '@angular/core';
import { CellPosition, ColDef, TabToNextCellParams } from 'ag-grid-community';
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
  startIndex = 1;
  fontSize = 20;
  marginBottom = 20;
  showContextMenu = false;
  showPrintPage = false;
  defaultColDef: ColDef = {
    editable: true
  };

  columnDefs: ColDef[] = [
    {
      field: "image", cellRendererFramework: ImageCellRendererComponent, editable: false, width: 100,
      suppressKeyboardEvent: params => {
        if (!params.editing) {
          let isDeleteKey = params.event.keyCode === 46;

          if (isDeleteKey) {
            let focusedCell = this.gridApi.getFocusedCell();
            let startRowIndex = focusedCell.rowIndex;
            let node = this.gridApi.rowModel.getRow(startRowIndex);
            let data = node.data;
            data["image"] = "";
            node.setData(data);
            // Delete all selected cell ranges...
            return true
          }
        }
        return false;
      }
    },
    { field: 'description' },
    { field: 'code' },
    { field: 'qty' },
    { field: 'itemPerCase' },
    { field: 'finish' },
  ];

  rowData: any[] = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];

  printPages: any[] = [];

  gridApi: any;
  gridColumnApi: any;
  contextMenuX: number = 0;;
  contextMenuY: number = 0;

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
          caseNo: `${count + this.startIndex}`,
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

  onTab = ({ nextCellPosition, previousCellPosition }: TabToNextCellParams): CellPosition => {
    if (!nextCellPosition) {
      this.gridApi.updateRowData({ add: [{}] });
      this.gridApi.sizeColumnsToFit();
      // this.addBidder();
      return previousCellPosition;
    }
    return nextCellPosition;
  };

  ngOnInit() {
    window.addEventListener('paste', this.insertNewRowsBeforePaste.bind(this));

    setTimeout(() => {
      (document.querySelector(".ag-body-viewport") as HTMLElement).addEventListener("contextmenu", (e: any) => {
        e.preventDefault();
        this.showContextMenu = true;
        this.contextMenuX = e.clientX;
        this.contextMenuY = e.clientY;
        e.target.focus();
      });
    }, 2000);

  }

  hideContextMenu() {
    this.showContextMenu = false;
  }


  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  onTabToNextCell(event: any) {
    if (event.event.keyCode == 9) {
      this.gridApi.tabToNextCell();
      event.event.preventDefault();
    }
  }

  insertNewRowsBeforePaste(event: any) {

    let focusedCell = this.gridApi.getFocusedCell();
    let startRowIndex = focusedCell.rowIndex;
    let startColIndex = this.columnDefs.findIndex(e => e.field == focusedCell.column.getColId());

    if (event.clipboardData.types[0] == 'Files') {
      let file = event.clipboardData.files[0];
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e: any) => {

        let node = this.gridApi.getRow(startRowIndex);
        let data = Object.assign({}, node.data);
        data["image"] = e.target.result;
        node.setData(data);
        let row = {
          image: e.target.result,
          description: '',
          code: '',
          qty: '',
          itemPerCase: '',
          finish: ''
        }
        // this.gridApi.updateRowData({ add: [row] });
        // this.gridApi.sizeColumnsToFit();
      }
      return;
    }
    // const fileReader = new FileReader();
    // fileReader.readAsDataURL(files);
    // fileReader.addEventListener("load", () => {
    //   this.filePath = fileReader.result?.toString() || "";
    //   this.params.setValue(this.filePath);
    // });


    console.log(event)

    let clipboardData = event.clipboardData.getData('text/plain');

    let rows = clipboardData.split('\n');




    let availableRows = this.gridApi.rowModel.getRowCount();
    if (startRowIndex + rows.length > availableRows) {
      this.gridApi.updateRowData({ add: Array(rows.length - availableRows).fill({}) });
    }

    for (let i = 0; i < rows.length && rows[i] !== ""; i++) {
      let node = this.gridApi.rowModel.getRow(startRowIndex + i);
      let cells = rows[i].split('\t');
      let data = Object.assign({}, node.data);
      for (let j = 0; j < cells.length; j++) {
        let colIndex = this.columnDefs[startColIndex + j].field || "";
        data[colIndex] = cells[j];
      }
      node.setData(data);
    }

  }

  addRow(event: any) {
    this.gridApi.updateRowData({
      add: [{}],
      addIndex: this.gridApi.getFocusedCell().rowIndex
    });
    this.gridApi.sizeColumnsToFit();
    this.hideContextMenu();
  }

  addRows(event: any) {
    this.gridApi.updateRowData({
      add: Array(parseInt(((document.getElementById("add-row-input")) as HTMLInputElement).value)).fill({}),
      addIndex: this.gridApi.getFocusedCell().rowIndex + 1
    });
    this.gridApi.sizeColumnsToFit();
  }

  deleteRows(event: any) {
    const selectedRows = this.gridApi.getSelectedRows();
    this.gridApi.applyTransaction({ remove: selectedRows });
    this.hideContextMenu();
    return true;
  }
}
