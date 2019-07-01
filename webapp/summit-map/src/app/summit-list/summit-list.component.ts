import { Component, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';

import { ApiService } from '../services/api.service';
import { Summit } from '../models/summit';
import { SummitDetailsComponent } from '../summit-details/summit-details.component';

@Component({
  selector: 'sm-summit-list',
  templateUrl: './summit-list.component.html',
  styleUrls: ['./summit-list.component.scss']
})
export class SummitListComponent implements OnInit {

  dataSource: Summit[];
  isLoading = false;

  displayedColumns: string[] = [
    'name',
    'coordinates',
    'elevation',
    'gain',
    'date',
    'photo'
  ];

  constructor(
    private apiService: ApiService,
    private dialogService: MatDialog
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.apiService.getAllSummits()
      .subscribe(summits => {
        this.dataSource = summits;
        this.isLoading = false;
      });
  }

  openSummit(summit: Summit): void {
    this.dialogService.open(SummitDetailsComponent, {
      data: summit,
      width: '600px',
      id: 'current'
    });
  }

  createNewSummit(): void {
    this.openSummit(new Summit());
  }

}
