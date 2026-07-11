import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConnectionService } from '../../services/connection.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-connection-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './connection-modal.html',
  styleUrls: ['./connection-modal.scss']
})
export class ConnectionModalComponent {

  connector: any;
  step: any;
  workflowId: number;

  authFields: any[] = [];
  formValues: any = {};
  loading = false;
  errorMsg = '';
  addingNew = false;

  existingConnections: any[] = [];
  selectedConnectionId: number | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ConnectionModalComponent>,
    private connectionService: ConnectionService,
    private snackBar: MatSnackBar
  ) {
this.dialogRef.backdropClick().subscribe(() => {
      this.dialogRef.close();
    });
    // Receive full data
    this.connector = data.connector;
    console.log("Connector received:", JSON.stringify(data.connector))
    this.step = data.step;

    this.workflowId = data.workflowId;

    this.authFields = this.connector.authFields || [];

    this.authFields.forEach(f => (this.formValues[f.keyName] = ''));

    this.loadExistingConnections();
  }

  // ------------------------------------------------------
  // LOAD EXISTING CONNECTIONS
  // ------------------------------------------------------
  loadExistingConnections() {
    this.connectionService.getConnections(this.connector.id).subscribe({
      next: (res: any[]) => {
        this.existingConnections = res || [];
        this.selectedConnectionId = this.existingConnections.length
          ? this.existingConnections[0].id
          : null;
      },
      error: () => {
        this.existingConnections = [];
        this.selectedConnectionId = null;
      }
    });
  }


  // ------------------------------------------------------
  // USE EXISTING CONNECTION
  // ------------------------------------------------------
  selectExistingConnection() {
    if (!this.selectedConnectionId) return;

    const selectedId = Number(this.selectedConnectionId); // ✅ FIX

    this.loading = true;

    this.connectionService
      .addStepConnection(this.workflowId, this.step.id, selectedId)
      .subscribe({
        next: () => {
          const conn = this.existingConnections.find(
            c => c.id === selectedId
          );

          if (!conn) {
            this.loading = false;
            this.errorMsg = 'Selected connection not found';
            return;
          }

          this.loading = false;

          this.dialogRef.close({
            id: conn.id,
            name: conn.name
          });
        },
        error: () => {
          this.loading = false;
          this.errorMsg = 'Failed to assign connection to step';
        }
      });
  }



  // ------------------------------------------------------
  // OAUTH CONNECTION
  // ------------------------------------------------------
  startOAuth() {
  this.loading = true;

  this.connectionService
    .createEmptyConnection(this.connector.id)
    .subscribe({
      next: (connection: any) => {
        this.connectionService
          .startOAuth(
            connection.id,
            this.workflowId,
            this.step.id
          )
          .subscribe((res: any) => {
            window.location.href = res.redirectUrl; // FULL redirect
          });
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Failed to initiate OAuth';
      }
    });
}



  // ------------------------------------------------------
  // SAVE NEW CONNECTION (API_KEY / NONE)
  // ------------------------------------------------------
  saveConnection() {
    this.loading = true;

    const payload = {
      name: `${this.connector.name} Connection #${Math.floor(Math.random() * 1000)}`,
      authData: Object.keys(this.formValues).map(key => ({
        key: key,
        value: this.formValues[key]
      }))
    };

    this.connectionService.createConnection(this.connector.id, payload).subscribe({
      next: (newConn: any) => {
        this.loading = false;
   
        this.connectionService
          .addStepConnection(this.workflowId, this.step.id, newConn.id)
          .subscribe({
            next: () => this.dialogRef.close({
              id: newConn.id,
              name: newConn.name
            }), // return new connection
            error: () => {
              this.errorMsg = "Connection created but failed to assign to step";
            }
          });
      },
      error: () => {
        this.loading = false;
        this.errorMsg = "Failed to save connection";
      }
    });
  }

  close() {
    alert("called")
    //this.dialogRef.close();
  }
}
