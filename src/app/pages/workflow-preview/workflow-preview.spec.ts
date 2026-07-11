import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowPreview } from './workflow-preview';

describe('WorkflowPreview', () => {
  let component: WorkflowPreview;
  let fixture: ComponentFixture<WorkflowPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowPreview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
