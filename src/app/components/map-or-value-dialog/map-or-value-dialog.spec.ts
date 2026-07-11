import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapOrValueDialogComponent } from './map-or-value-dialog';

describe('MapOrValueDialog', () => {
  let component: MapOrValueDialogComponent;
  let fixture: ComponentFixture<MapOrValueDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapOrValueDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapOrValueDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
