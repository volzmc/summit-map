import { Component, OnInit, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material';
import { Summit } from '../models/summit';

@Component({
  selector: 'sm-summit-slider',
  templateUrl: './summit-slider.component.html',
  styleUrls: ['./summit-slider.component.scss']
})
export class SummitSliderComponent implements OnInit {

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: Summit
  ) { }

  ngOnInit() {
  }

}
