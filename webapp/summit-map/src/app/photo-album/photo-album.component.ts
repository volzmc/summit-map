import { Component, OnInit, Inject } from '@angular/core';
import { ApiService } from '../services/api.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Summit } from '../models/summit';
import { MediaItem } from '../models/mediaItem';

@Component({
  selector: 'sm-photo-album',
  templateUrl: './photo-album.component.html',
  styleUrls: ['./photo-album.component.scss']
})
export class PhotoAlbumComponent implements OnInit {

  images: MediaItem[];

  private innerScreenWidth: number;

  constructor(
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) private data: Summit
  ) { }

  ngOnInit() {
    this.apiService.getPhotosFromAlbum(this.data.photoAlbumId)
      .subscribe(items => {
        this.images = items.filter(i => i.filename.endsWith('.jpg') && i.mediaMetadata.width < 5000);
      });

    this.innerScreenWidth = window.innerWidth;
  }

  getImageSource(index: number): string {
    let height = this.images[index].mediaMetadata.height;
    let width = this.images[index].mediaMetadata.width;
    if (height > width) {
      const temp = height;
      height = width;
      width = temp;
    }
    return `${this.images[index].baseUrl}=w${this.getWidth()}-h${this.getHeight(width, height)}`;
  }

  private getWidth(): number {
    return Math.round(this.innerScreenWidth * 0.8);
  }

  private getHeight(imageWidth: number, imageHeight): number {
    const widthRatio = this.getWidth() / imageWidth;
    return Math.round(imageHeight * widthRatio);
  }

}
