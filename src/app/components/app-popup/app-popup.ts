import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-popup',
  templateUrl: './app-popup.html',
  imports:[MatDialogModule,CommonModule,MatIconModule],
  styleUrls: ['./app-popup.scss']
})
export class AppPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<AppPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  selectApp(connector: any) {
    this.dialogRef.close(connector);
  }

  onLogoError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/default-app-icon.png';
  }
}
