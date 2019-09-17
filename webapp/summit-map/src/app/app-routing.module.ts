import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SummitListComponent } from './summit-list/summit-list.component';
import { MapViewComponent } from './map-view/map-view.component';

const routes: Routes = [
  { path: '', redirectTo: '/map', pathMatch: 'full' },
  { path: 'map', component: MapViewComponent },
  { path: 'admin', component: SummitListComponent },
  { path: 'login', redirectTo: '/auth/google' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
