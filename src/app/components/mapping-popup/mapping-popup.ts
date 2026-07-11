import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { WorkflowService } from '../../services/workflow.service';

@Component({
  selector: 'app-mapping-popup',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    FormsModule
  ],
  templateUrl: './mapping-popup.html',
  styleUrls: ['./mapping-popup.scss']
})
export class MappingPopupComponent {

  inputValue: string = "";
  valueChange$ = new Subject<string>();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      stepId: number;
      inputId?: number;
      fieldKey: string;
      stepOrder:number;
      existingValue?: string;
      outputs: any[];
      hasData: boolean;   // ✅ Added so template stops throwing errors
    },
    private dialogRef: MatDialogRef<MappingPopupComponent>,
    private workflowService: WorkflowService
  ) {}

  ngOnInit() {

    // Load existing DB saved value
    if (this.data.existingValue) {
      this.inputValue = this.data.existingValue;
    }

    // Auto-save after typing (debounced)
    this.valueChange$.pipe(debounceTime(500))
      .subscribe((value) => this.saveToDB(value));
  }

  /** 🔹 Triggers when user types */
  onTyping() {
    this.valueChange$.next(this.inputValue); // auto-save
  }

  /** 🔹 User selects output mapping */
  addMapping(output: any) {
    const mapping = `{{step${output.stepOrder}.${output.key}}}`;
    this.inputValue += mapping;
    this.valueChange$.next(this.inputValue); // auto-save
  }
  saveToDB(value: string) {
    const payload = {
      stepKey: this.data.fieldKey,
      value: value
    };

    // UPDATE
    if (this.data.inputId) {
      this.workflowService.updateStepInput(this.data.stepId, this.data.inputId, payload)
        .subscribe();
    }
    // CREATE
    else {
      this.workflowService.saveStepInput(this.data.stepId, payload)
        .subscribe((res: any) => {
          this.data.inputId = res.id;   // next saves become update
        });
    }
  }

  close() {
    this.dialogRef.close(this.inputValue);
  }
}
