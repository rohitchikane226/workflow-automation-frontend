import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppPopup } from './app-popup';

describe('AppPopup', () => {
  let component: AppPopup;
  let fixture: ComponentFixture<AppPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
