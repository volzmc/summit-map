import { Component, OnInit, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatDialog } from '@angular/material';
import { Summit } from '../models/summit';
import { PhotoAlbumComponent } from '../photo-album/photo-album.component';
import { ApiService } from '../services/api.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.coverPhotoUrl = this.apiService.getMediaItem(this.data.album.coverPhotoMediaItemId)
      .pipe(
        map(mediaItem => {
          const width = mediaItem.mediaMetadata.width;
          const height = mediaItem.mediaMetadata.height;
          return `${this.data.album.coverPhotoBaseUrl}=w${Math.round(width / 8)}-h${Math.round(height / 8)}`;
        }));
  }

  openPhotoAlbum() {
    const modalRef = this.modalService.open(PhotoAlbumComponent, {
      data: this.data,
      backdropClass: 'photo-album-backdrop'
    });
  }

}
