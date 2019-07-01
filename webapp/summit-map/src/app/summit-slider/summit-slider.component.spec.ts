import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummitSliderComponent } from './summit-slider.component';

describe('SummitSliderComponent', () => {
  let component: SummitSliderComponent;
  let fixture: ComponentFixture<SummitSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummitSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummitSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
