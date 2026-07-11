import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWorkflowDialogComponent } from './create-workflow-dialog';

describe('CreateWorkflowDialog', () => {
  let component: CreateWorkflowDialogComponent;
  let fixture: ComponentFixture<CreateWorkflowDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateWorkflowDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateWorkflowDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
