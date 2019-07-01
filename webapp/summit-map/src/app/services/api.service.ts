import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Summit } from '../models/summit';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) { }

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
