import { Component, OnInit, Inject } from '@angular/core';
import { ApiService } from '../services/api.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
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
        this.images = items.filter(i => (i.filename.endsWith('.jpg') || i.filename.endsWith('.HEIC')));
        console.log(`Number of images: ${this.images.length}`)
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
    return `${this.images[index].baseUrl}=s${this.getWidth()}`;
  }

  private getMaxDimension(): number {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    return Math.round(Math.min(screenHeight, screenWidth) * 0.8);
  }

  private getWidth(): number {
    return Math.round(this.innerScreenWidth * 0.8);
  }

  private getHeight(imageWidth: number, imageHeight): number {
    const widthRatio = this.getWidth() / imageWidth;
    return Math.round(imageHeight * widthRatio);
  }

}
