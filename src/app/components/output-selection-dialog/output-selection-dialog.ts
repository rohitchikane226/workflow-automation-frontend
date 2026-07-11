import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowService } from '../../services/workflow.service';

@Component({
  selector: 'app-output-selection-dialog',
  standalone: true,
  templateUrl: './output-selection-dialog.html',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  styleUrls: ['./output-selection-dialog.scss']
})
export class OutputSelectionDialogComponent {

  outputs: any[] = [];
  inputId?: number;    // For update PUT

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      sourceStep: any;           // step whose outputs we show
      targetStep: any;           // step whose input must be saved
      field: any;                // input field info
      existingValue?: string;    // already saved DB value
      inputId?: number;          // existing DB record ID
    },
    private dialogRef: MatDialogRef<OutputSelectionDialogComponent>,
    private workflowService: WorkflowService
  ) {

    this.outputs = data?.sourceStep?.outputs || [];
    this.inputId = data.inputId ?? undefined;
  }

  /** User selects an output value to map */
mapField(output: any) {

  const token = `{{step${this.data.sourceStep.stepOrder}.${output.key}}}`;

  let current = this.data.targetStep.config[this.data.field.id] || '';

  console.log('BEFORE:', current);

  // ✅ First value
  if (!current) {
    current = token;
  }
  // ✅ Prevent duplicate
  else if (!current.includes(token)) {
    current = current + ', ' + token;
  }

  console.log('AFTER:', current);

  // ✅ Update UI
  this.data.targetStep.config[this.data.field.id] = current;

  // ✅ Save full updated value
  this.saveToDB(current);

  // ✅ Return FULL VALUE (important for parent)
  this.dialogRef.close({
    value: current,
    key: output.key,
    fromStep: this.data.sourceStep.stepOrder
  });
}

  /** 🔥 Create or Update DB save logic */
  saveToDB(value: string) {
    const payload = {
      stepKey: this.data.field.key,
      label:value,
      value: value
    };

    const stepId = this.data.targetStep.id;

    // UPDATE existing input
    if (this.inputId) {
      this.workflowService.updateStepInput(stepId, this.inputId, payload)
        .subscribe();
    }
    else {
      // CREATE new input
      this.workflowService.saveStepInput(stepId, payload)
        .subscribe((res: any) => {
          this.inputId = res.id; // store for future updates
        });
    }
  }

  close() {
    this.dialogRef.close();
  }
}
