import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Summit } from '../models/summit';
import { PhotoAlbumComponent } from '../photo-album/photo-album.component';
import { ApiService } from '../services/api.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'sm-summit-slider',
  templateUrl: './summit-slider.component.html',
  styleUrls: ['./summit-slider.component.scss']
})
export class SummitSliderComponent implements OnInit {
  coverPhotoUrl: Observable<string>;
  isLoading = true;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: Summit,
    private modalService: MatDialog,
    private apiService: ApiService,
    private bottomSheetRef: MatBottomSheetRef
  ) { }

  ngOnInit() {
    if (this.data.album) {
      this.isLoading = true;
      
      this.coverPhotoUrl = this.apiService.getMediaItem(this.data.album.coverPhotoMediaItemId)
        .pipe(
          map(mediaItem => {
            this.isLoading = false;
            return `${this.data.album.coverPhotoBaseUrl}=s300`;
          }));
          
    }
  }

  dismissSheet() {
    this.bottomSheetRef.dismiss();
  }

  openPhotoAlbum() {
    const modalRef = this.modalService.open(PhotoAlbumComponent, {
      data: this.data,
      backdropClass: 'photo-album-backdrop'
    });
    this.dismissSheet();
  }

}
