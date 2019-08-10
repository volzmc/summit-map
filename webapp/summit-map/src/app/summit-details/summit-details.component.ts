import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Summit } from '../models/summit';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'sm-summit-details',
  templateUrl: './summit-details.component.html',
  styleUrls: ['./summit-details.component.scss']
})
export class SummitDetailsComponent implements OnInit {

  summitForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public summit: Summit,
    private apiService: ApiService,
    private dialogService: MatDialog
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm(): void {
    this.summitForm = new FormGroup({
      name: new FormControl(this.summit.title, [Validators.required]),
      latitude: new FormControl(this.summit.latitude, [Validators.required]),
      longitude: new FormControl(this.summit.longitude, [Validators.required]),
      elevation: new FormControl(this.summit.elevation, [Validators.required]),
      gain: new FormControl(this.summit.totalGain),
      bulgersNumber: new FormControl(this.summit.bulgersNumber),
      photoUrl: new FormControl(this.summit.photoAlbumName),
      date: new FormControl(this.summit.dateClimbed, [Validators.required]),
      description: new FormControl(this.summit.description)
    });
  }

  saveSummit(): void {
    const updatedSummit = new Summit({
      title: this.summitForm.get('name').value,
      latitude: this.summitForm.get('latitude').value,
      longitude: this.summitForm.get('longitude').value,
      elevation: this.summitForm.get('elevation').value,
      totalGain: this.summitForm.get('gain').value,
      bulgersNumber: this.summitForm.get('bulgersNumber').value,
      photoAlbumName: this.summitForm.get('photoUrl').value,
      dateClimbed: this.summitForm.get('date').value,
      description: this.summitForm.get('description').value
    });

    this.apiService.addOrUpdateSummit(updatedSummit)
      .subscribe(() => {
        this.dialogService.closeAll();
        location.reload();
      });
  }

  delete(): void {
    const summitToDelete = new Summit({
      title: this.summitForm.get('name').value
    });

    this.apiService.deleteSummit(summitToDelete)
      .subscribe(() => {
        this.dialogService.closeAll();
        location.reload();
      });
  }

}
