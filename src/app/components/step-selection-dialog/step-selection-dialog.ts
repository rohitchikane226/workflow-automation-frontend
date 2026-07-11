import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { OutputSelectionDialogComponent } from '../../components/output-selection-dialog/output-selection-dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-step-selection-dialog',
  templateUrl: './step-selection-dialog.html',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  styleUrls: ['./step-selection-dialog.scss']
})
export class StepSelectionDialogComponent {
  previousSteps: any[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<StepSelectionDialogComponent>,
    private dialog: MatDialog
  ) {
    this.previousSteps = data.previousSteps || [];
  }

 openStepOutputs(step: any) {

  const dialogRef = this.dialog.open(OutputSelectionDialogComponent, {
    width: '600px',
    data: {
      sourceStep: step,
      field: this.data.field,
      targetStep: this.data.step
    }
  });

  dialogRef.afterClosed().subscribe((selectedOutput) => {

    if (selectedOutput) {
      this.dialogRef.close(selectedOutput);
    }

  });
}
}
