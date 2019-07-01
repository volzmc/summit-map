import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayPairComponent } from './display-pair.component';

describe('DisplayPairComponent', () => {
  let component: DisplayPairComponent;
  let fixture: ComponentFixture<DisplayPairComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayPairComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayPairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
