import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApiService } from './services/api.service';
import { CustomMaterialsModule } from './custom-materials/custom-materials.module';
import { SummitListComponent } from './summit-list/summit-list.component';
import { MapViewComponent } from './map-view/map-view.component';
import { SummitDetailsComponent } from './summit-details/summit-details.component';
import { SummitSliderComponent } from './summit-slider/summit-slider.component';
import { DisplayPairComponent } from './shared/display-pair/display-pair.component';
import { PhotoAlbumComponent } from './photo-album/photo-album.component';

@NgModule({
  declarations: [
    AppComponent,
    SummitListComponent,
    MapViewComponent,
    SummitDetailsComponent,
    SummitSliderComponent,
    DisplayPairComponent,
    PhotoAlbumComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CustomMaterialsModule,
    FormsModule, ReactiveFormsModule
  ],
  providers: [
    ApiService,
    {
      provide: ErrorStateMatcher,
      useClass: ShowOnDirtyErrorStateMatcher
    }
  ],
  entryComponents: [
    SummitDetailsComponent,
    SummitSliderComponent,
    PhotoAlbumComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
