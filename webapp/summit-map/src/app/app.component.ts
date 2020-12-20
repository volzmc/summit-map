import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './models/user';
import { UserService } from './services/user.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  user: User = this.userService.getUser();

  constructor(
    private router: Router,
    private userService: UserService
  ) { }
  
  goTo(route: string) {
    this.router.navigateByUrl(route)
  }

  signOut() {
    this.userService.signOut();
  }
}
