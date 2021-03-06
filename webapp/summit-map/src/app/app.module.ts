import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApiService } from './services/api.service';
import { SummitListComponent } from './summit-list/summit-list.component';
import { MapViewComponent } from './map-view/map-view.component';
import { SummitDetailsComponent } from './summit-details/summit-details.component';
import { SummitSliderComponent } from './summit-slider/summit-slider.component';
import { DisplayPairComponent } from './shared/display-pair/display-pair.component';
import { PhotoAlbumComponent } from './photo-album/photo-album.component';
import { HttpErrorInterceptor } from './interceptors/error-interceptor';
import { CustomMatieralsModule } from './custom-materials/custom-materials.module';
import { UserService } from './services/user.service';
import { WindyComponent } from './windy/windy.component';


@NgModule({
  declarations: [
    AppComponent,
    SummitListComponent,
    MapViewComponent,
    SummitDetailsComponent,
    SummitSliderComponent,
    DisplayPairComponent,
    PhotoAlbumComponent,
    WindyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule, ReactiveFormsModule,
    CustomMatieralsModule,
    NgbModule
  ],
  providers: [
    ApiService,
    {
      provide: ErrorStateMatcher,
      useClass: ShowOnDirtyErrorStateMatcher
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    CookieService,
    UserService
  ],
  entryComponents: [
    SummitDetailsComponent,
    SummitSliderComponent,
    PhotoAlbumComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
