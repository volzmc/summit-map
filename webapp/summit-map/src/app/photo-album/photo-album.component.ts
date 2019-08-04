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

  constructor(
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) private data: Summit
  ) { }

  ngOnInit() {
    this.apiService.getPhotosFromAlbum(this.data.photoAlbumId)
      .subscribe(items => {
        this.images = items.filter(i => i.filename.endsWith('.jpg') && i.mediaMetadata.width < 5000);
      });
  }

  getImageSource(index: number): string {
    let height = this.images[index].mediaMetadata.height;
    let width = this.images[index].mediaMetadata.width;
    if (height > width) {
      const temp = height;
      height = width;
      width = temp;
    }
    return `${this.images[index].baseUrl}=w${width / 4}-h${height / 4}`;
  }

}
