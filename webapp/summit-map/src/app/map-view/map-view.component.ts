/// <reference types="@types/googlemaps" />

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { ApiService } from '../services/api.service';
import { Summit } from '../models/summit';
import { SummitSliderComponent } from '../summit-slider/summit-slider.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'sm-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit {

  @ViewChild('map', { static: true}) mapElement: any;
  map: google.maps.Map;

  private htmlString = `
  <div id="centerControl">
    <button mat-icon-button class="mat-focus-indicator mat-menu-trigger example-icon mat-icon-button mat-button-base">
        <span class="mat-button-wrapper">
          <mat-icon class="mat-icon notranslate material-icons mat-icon-no-color">gps_fixed</mat-icon>
        </span>
    </button>
  </div>
  `

  private allSummits: Summit[];
  private homeCenter = new google.maps.LatLng(47.2732900725505, -121.44201323593751);
  private defaultZoom = 8;

  constructor(
    private apiService: ApiService,
    private bottomSheetService: MatBottomSheet
  ) { }

  ngOnInit() {
    this.initMap();

    forkJoin(this.apiService.getAllSummits(), this.apiService.getAllAlbums()).subscribe(tuple => {
      const summits = tuple[0];
      const albums = tuple[1];

      this.allSummits = summits;
        summits.forEach(sum => {
          const marker = new google.maps.Marker({
            position: new google.maps.LatLng(sum.latitude, sum.longitude),
            map: this.map,
            title: sum.title,
            icon: this.getIcon(sum)
          });

          marker.addListener('click', () => {
            console.info("Click registered on marker");
            this.handleMarkerClicked(marker);
          });
        });

      albums.forEach(album => {
        this.allSummits.forEach(s => {
          if (s.photoAlbumName === album.title) {
            s.photoAlbumId = album.id;
            s.album = album;
          }
        })
      });
    });
  }

  initMap(): void {
    this.map = new google.maps.Map(
      this.mapElement.nativeElement,
      {
        center: this.homeCenter,
        zoom: this.defaultZoom,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
      });

    const container = document.createRange().createContextualFragment(this.htmlString).firstElementChild;

    container.addEventListener('click', () => {
      this.centerMap();
    });

    this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(container);
  }

  centerMap(): void {
    this.map.setCenter(this.homeCenter);
    this.map.setZoom(this.defaultZoom);
  }

  handleMarkerClicked(marker: google.maps.Marker): void {
    const summit = this.allSummits.find(s => s.title === marker.getTitle());

    this.bottomSheetService.open(SummitSliderComponent, {
      data: summit
    });
  }

  private getIcon(summit: Summit): any {
    return summit.bulgersNumber ?
      {
        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      } :
      {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
      };
  }

}
