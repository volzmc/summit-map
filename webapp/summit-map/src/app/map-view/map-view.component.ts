import { Component, OnInit, ViewChild } from '@angular/core';
import { } from 'googlemaps';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { ApiService } from '../services/api.service';
import { Summit } from '../models/summit';
import { SummitSliderComponent } from '../summit-slider/summit-slider.component';

@Component({
  selector: 'sm-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit {

  @ViewChild('map', { static: false}) mapElement: any;
  map: google.maps.Map;

  private allSummits: Summit[];

  constructor(
    private apiService: ApiService,
    private bottomSheetService: MatBottomSheet
  ) { }

  ngOnInit() {
    this.initMap();

    this.apiService.getAllSummits()
      .subscribe(summits => {
        this.allSummits = summits;
        summits.forEach(sum => {
          const marker = new google.maps.Marker({
            position: new google.maps.LatLng(sum.latitude, sum.longitude),
            map: this.map,
            title: sum.title
          });

          marker.addListener('click', () => {
            this.handleMarkerClicked(marker);
          });
        });
    });
  }

  initMap(): void {
    this.map = new google.maps.Map(
      this.mapElement.nativeElement,
      {
        center: new google.maps.LatLng(47.2732900725505, -121.44201323593751),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
      });
  }

  handleMarkerClicked(marker: google.maps.Marker): void {
    const summit = this.allSummits.find(s => s.title === marker.getTitle());

    this.bottomSheetService.open(SummitSliderComponent, {
      data: summit
    });
  }

}
