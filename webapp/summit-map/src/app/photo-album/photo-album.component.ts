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
  isLoading = true;

  constructor(
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) private data: Summit
  ) { }

  ngOnInit() {
    this.apiService.getPhotosFromAlbum(this.data.photoAlbumId)
      .subscribe(items => {
        this.isLoading = false;
        this.images = items.filter(i => (i.filename.endsWith('.jpg') || i.filename.endsWith('.HEIC')));
        console.log(`Number of images: ${this.images.length}`)
      });

    this.innerScreenWidth = window.innerWidth;
  }

  getImageSource(index: number): string {
    return `${this.images[index].baseUrl}=s${this.getWidth()}`;
  }

  private getWidth(): number {
    return Math.round(this.innerScreenWidth * 0.8);
  }

}
