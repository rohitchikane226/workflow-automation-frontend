import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowBuilderComponent } from './workflow-builder';

describe('WorkflowBuilder', () => {
  let component: WorkflowBuilderComponent;
  let fixture: ComponentFixture<WorkflowBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
