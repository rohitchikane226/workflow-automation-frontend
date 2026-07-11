import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputSelectionDialogComponent } from './output-selection-dialog';

describe('OutputSelectionDialog', () => {
  let component: OutputSelectionDialogComponent;
  let fixture: ComponentFixture<OutputSelectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutputSelectionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutputSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
