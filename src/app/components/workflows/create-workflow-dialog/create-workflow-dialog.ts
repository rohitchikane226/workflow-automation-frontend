import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-create-workflow-dialog',
  templateUrl: './create-workflow-dialog.html',
  styleUrls: ['./create-workflow-dialog.scss'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ]
})
export class CreateWorkflowDialogComponent {

  workflowName: string = '';

  constructor(private dialogRef: MatDialogRef<CreateWorkflowDialogComponent>) {}

  onCreate() {
    this.dialogRef.close(this.workflowName);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
