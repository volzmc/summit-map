import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummitListComponent } from './summit-list.component';

describe('SummitListComponent', () => {
  let component: SummitListComponent;
  let fixture: ComponentFixture<SummitListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummitListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
