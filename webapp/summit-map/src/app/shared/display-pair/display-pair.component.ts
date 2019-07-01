import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'sm-display-pair',
  templateUrl: './display-pair.component.html',
  styleUrls: ['./display-pair.component.scss']
})
export class DisplayPairComponent implements OnInit {

  @Input() key: string;
  @Input() value: string;
  @Input() isTitle = false;

  constructor() { }

  ngOnInit() {
  }

}
