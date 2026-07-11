import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowBuilderPage } from './workflow-builder-page';

describe('WorkflowBuilderPage', () => {
  let component: WorkflowBuilderPage;
  let fixture: ComponentFixture<WorkflowBuilderPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowBuilderPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowBuilderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
