import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummitDetailsComponent } from './summit-details.component';

describe('SummitDetailsComponent', () => {
  let component: SummitDetailsComponent;
  let fixture: ComponentFixture<SummitDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummitDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummitDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
