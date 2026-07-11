import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { StepSelectionDialogComponent } from '../../components/step-selection-dialog/step-selection-dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-map-or-value-dialog',
  templateUrl: './map-or-value-dialog.html',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  styleUrls: ['./map-or-value-dialog.scss']
})
export class MapOrValueDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<MapOrValueDialogComponent>,
    private dialog: MatDialog
  ) {}

  enterManually() {
    this.dialogRef.close({ mode: 'manual' });
  }

  mapValue() {
    this.dialogRef.close();
    this.dialog.open(StepSelectionDialogComponent, {
      width: '600px',
      data: this.data
    });
  }
}
