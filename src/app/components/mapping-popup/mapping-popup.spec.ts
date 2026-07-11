import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingPopup } from './mapping-popup';

describe('MappingPopup', () => {
  let component: MappingPopup;
  let fixture: ComponentFixture<MappingPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MappingPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MappingPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
