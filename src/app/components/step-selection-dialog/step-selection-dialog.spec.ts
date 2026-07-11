import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepSelectionDialog } from './step-selection-dialog';

describe('StepSelectionDialog', () => {
  let component: StepSelectionDialog;
  let fixture: ComponentFixture<StepSelectionDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepSelectionDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepSelectionDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
