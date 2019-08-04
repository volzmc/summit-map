import { Component, OnInit, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatDialog } from '@angular/material';
import { Summit } from '../models/summit';
import { PhotoAlbumComponent } from '../photo-album/photo-album.component';

@Component({
  selector: 'sm-summit-slider',
  templateUrl: './summit-slider.component.html',
  styleUrls: ['./summit-slider.component.scss']
})
export class SummitSliderComponent implements OnInit {

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: Summit,
    private modalService: MatDialog
  ) { }

  ngOnInit() {
  }

  getCoverPhotoUrl(): string {
    const url = `${this.data.album.coverPhotoBaseUrl}=w400-h300`;
    return url;
  }

  openPhotoAlbum() {
    const modalRef = this.modalService.open(PhotoAlbumComponent, {
      data: this.data
    });
  }

}
