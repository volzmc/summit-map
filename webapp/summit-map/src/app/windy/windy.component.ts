import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-windy',
  templateUrl: './windy.component.html',
  styleUrls: ['./windy.component.css']
})
export class WindyComponent implements OnInit {

  width = window.innerWidth;
  height = window.innerHeight;

  constructor() { }

  ngOnInit(): void {
  }

}
