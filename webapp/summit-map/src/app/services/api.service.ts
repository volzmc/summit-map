import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Summit } from '../models/summit';
import { environment } from '../../environments/environment';
import { Album } from '../models/album';
import { MediaItem } from '../models/mediaItem';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) { }

  public auth() {
    const urlParts = environment.apiBase.split('/');
    urlParts.splice(urlParts.length - 1);
    return this.http.request<any>('GET', `${urlParts.join('/')}/auth/google`);
  }

  public getAllSummits(): Observable<Summit[]> {
    return this.makeRequest(
      'GET',
      'allSummits',
      null
    );
  }

  public addOrUpdateSummit(summit: Summit) {
    return this.makeRequest(
      'POST',
      'update',
      summit
    );
  }

  public deleteSummit(summit: Summit) {
    return this.makeRequest(
      'POST',
      'remove',
      summit
    );
  }

  public getPhotosFromAlbum(albumId: string): Observable<MediaItem[]> {
    return this.makeRequest(
      'POST',
      'photos',
      {
        albumId: albumId
      }
    );
  }

  public getAllAlbums(): Observable<Album[]> {
    return this.makeRequest(
      'GET',
      'albums',
      null
    );
  }

  private makeRequest<T>(method: string, url: string, body: any, reload = false): Observable<T> {
    const options: {
      body?: any;
    } = {};

    if (body) {
      options.body = body;
    }

    return this.http.request<T>(method, this.buildUrl(url), options);
  }

  private buildUrl(endpoint: string): string {
    return `${environment.apiBase}/${endpoint}`;
  }
}
