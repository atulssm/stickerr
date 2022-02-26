import { keyframes } from '@angular/animations';
import { Component } from '@angular/core';
import { CellPosition, ColDef, IsRowSelectable, TabToNextCellParams } from 'ag-grid-community';
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
  activIndex = -1;
  startIndex = 1;
  fontSize = 20;
  marginBottom = 20;
  showContextMenu = false;
  showPrintPage = false;
  printLayout = "four-block-print";
  pageOrientation = "landscape";
  pageMargin = {
    top: 8,
    right: 8,
    bottom: 8,
    left: 8
  }
  defaultColDef: ColDef = {
    editable: true,
    suppressKeyboardEvent: params => {
      if (params.editing == true && params.event.code == "Enter") {
        //this.gridApi.stopEditing(false);
        setTimeout((e: any) => {
          let focusedCell = this.gridApi.getFocusedCell();
          this.gridApi.setFocusedCell(focusedCell.rowIndex + 1, focusedCell.column.colId, null);
        }, 10);


      } else if (params.event.code == "Delete") {

        const selectedRows = this.gridApi.getSelectedRows();
        if (selectedRows.length > 0) {
          this.deleteRows(params.event);

          let focusedCell = this.gridApi.getFocusedCell();
          let rowIndex = this.gridApi.rowModel.getRowCount() > focusedCell.rowIndex ? focusedCell.rowIndex : this.gridApi.rowModel.getRowCount() - 1;
          this.gridApi.setFocusedCell(rowIndex, focusedCell.column.colId, null);

          return true
        } else {
          return false;
        }
      }
      return false;
    }
  };

  contextMenu = [
    { label: 'Add Row', action: this.addRow.bind(this) },
    { label: 'Delete Row', action: this.deleteRows.bind(this) },
  ]

  columnDefs: ColDef[] = [
    {
      headerName: "",
      valueGetter: "node.rowIndex + 1",
      width: 25,
      cellClass: "text-center row-index-cell",
    },
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
          } else if (params.event.code === "Enter") {
            this.gridApi.startEditingCell({ rowIndex: params.node.rowIndex, colKey: params.colDef.field });
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


    let itemPerPage = 4;
    switch (this.printLayout) {
      case "four-block-print":
        itemPerPage = 4;
        break;
      case "two-block-print":
        itemPerPage = 2;
        break;
      case "three-block-print":
        itemPerPage = 3;
        break;
    }

    let printPages: any = [];
    let count = 0;
    this.gridApi.rowModel.forEachNode((e: any) => {

      let row = e.data;

      let totalItems = row.qty / row.itemPerCase;

      for (let j = 0; j < totalItems; j++) {

        if (printPages.length == itemPerPage) {
          this.printPages.push(printPages);
          printPages = [];
        }

        let page = {
          image: row.image,
          description: row.description,
          code: row.code,
          qty: row.itemPerCase,
          itemPerCase: row.itemPerCase,
          caseNo: `${(count++) + this.startIndex}`,
          finish: row.finish
        }
        printPages.push(page);
      }


      //let item = this.rowData.slice(i * 4, i * 4 + 4);


    })
    if (printPages.length > 0) {
      this.printPages.push(printPages);
    }

    if (this.printPages.length == 0) {
      alert("There is nothing to print on the page.\n Make sure Quatity and Item Per case columns is not zero.");
    } else {
      this.showPrintPage = true;
    }
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

  onContextMenuKeyPress(event: any) {
    switch (event.code) {
      case "ArrowDown":
        this.activIndex = (this.activIndex + 1) % this.contextMenu.length;
        break;
      case "ArrowUp":
        this.activIndex = (this.activIndex - 1 + this.contextMenu.length) % this.contextMenu.length;
        break;
      case "Escape":
        this.hideContextMenu();
        break;
      case "Enter":
        this.contextMenuItemClick(event, this.contextMenu[this.activIndex]);
    }
  }

  contextMenuItemClick($event: any, item: any) {
    item.action($event);
    let focusedCell = this.gridApi.getFocusedCell();
    this.gridApi.setFocusedCell(focusedCell.rowIndex, focusedCell.column.colId, null);
    this.hideContextMenu();
  }

  ngOnInit() {
    window.addEventListener('paste', this.processPasteEvent.bind(this));
  }

  onRowClicked(event: any) {
    return false;
    event.stopPropagation();
    console.log(event);
  }

  hideContextMenu() {
    this.showContextMenu = false;
  }


  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();

    (document.querySelector(".ag-body-viewport") as HTMLElement).addEventListener("contextmenu", (e: any) => {
      e.preventDefault();
      e.stopPropagation();

      this.gridApi.deselectAll();
      this.gridApi.getDisplayedRowAtIndex(this.gridApi.getFocusedCell().rowIndex).setSelected(true);
      this.showContextMenu = true;
      this.contextMenuX = e.clientX;
      this.contextMenuY = e.clientY;
      this.activIndex = -1;

      setTimeout(() => {
        (document.querySelector(".context-menu") as HTMLElement).focus();

      }, 100);

    });
  }

  onTabToNextCell(event: any) {
    if (event.event.keyCode == 9) {
      this.gridApi.tabToNextCell();
      event.event.preventDefault();
    }
  }

  processPasteEvent(event: any) {

    let focusedCell = this.gridApi.getFocusedCell();
    let startRowIndex = focusedCell.rowIndex;
    let startColIndex = this.columnDefs.findIndex(e => e.field == focusedCell.column.getColId());

    if (event.clipboardData.types[0] == 'Files') {
      let file = event.clipboardData.files[0];
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e: any) => {

        let node = this.gridApi.rowModel.getRow(startRowIndex);
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
      }
      return;
    }

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
  }

  addRows(event: any) {
    let focusedCell = this.gridApi.getFocusedCell();
    let rowIndex = focusedCell ? focusedCell.rowIndex : this.gridApi.rowModel.getRowCount() - 1;
    let noOfNewRows = 0;

    this.gridApi.updateRowData({
      add: Array(parseInt(((document.getElementById("add-row-input")) as HTMLInputElement).value)).fill({}),
      addIndex: rowIndex
    });

    this.gridApi.sizeColumnsToFit();
  }

  deleteRows(event: any) {
    const selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows.length == 0) {
      alert("Please select at least one row to delete");
    }

    this.gridApi.applyTransaction({ remove: selectedRows });
    return true;
  }

  cssPagedMedia = (function () {
    var style = document.createElement('style');
    style.innerHTML = `@page {
      margin: 0mm;
      size: A4 landscape;
    }`;
    document.head.appendChild(style);
    return function (rule: string) {
      style.innerHTML = rule;
    };
  }());

  changePageOrientation() {
    this.cssPagedMedia('@page {margin:0cm; size: A4 ' + this.pageOrientation + ';}');
  }

  printPage() {
    if (this.printPages.length == 0) {
      alert("There is nothing to print on the page. Please check.")
    } else {
      window.print();
    }
  }
}

