import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';

import { ConnectionService } from '../../services/connection.service';
import { ConnectorService } from '../../services/connector.service';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SidebarComponent } from '../sidebar/sidebar/sidebar';

@Component({
  selector: 'app-connections',
  standalone: true,
  templateUrl: './connections.html',
  styleUrls: ['./connections.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatPaginatorModule,
    SidebarComponent
  ]
})
export class ConnectionsComponent implements OnInit {

  /* ================= INPUT / OUTPUT ================= */

  @Input() connectorId!: number;          // optional filter
  @Output() addConnection = new EventEmitter<void>();
  @Output() select = new EventEmitter<any>();

  /* ================= STATE ================= */

  connections: any[] = [];        // full list
  pagedConnections: any[] = [];   // paginated list

  loading = false;

  pageSize = 16;   // 4 cards × 4 rows
  pageIndex = 0;

  connectorsMap: { [key: number]: any } = {};

  /* ================= CONSTRUCTOR ================= */

  constructor(
    private connectionService: ConnectionService,
    private connectorService: ConnectorService,
    private snack: MatSnackBar
  ) {}

  /* ================= INIT ================= */

  ngOnInit() {
    this.loadConnections();
  }

  /* ================= LOAD CONNECTIONS ================= */

  loadConnections() {
    this.loading = true;

    const api$ = this.connectorId
      ? this.connectionService.getConnections(this.connectorId)
      : this.connectionService.getAllConnections();

    api$.subscribe({
      next: (res: any) => {
        this.connections = res || [];
        this.loadConnectors();
      },
      error: () => {
        this.loading = false;
        this.snack.open('Failed to load connections', 'OK', { duration: 2000 });
      }
    });
  }

  /* ================= LOAD CONNECTORS BY ID ================= */

  private loadConnectors() {

    // Unique connector IDs
    const connectorIds = [
      ...new Set(this.connections.map(c => c.connectorId))
    ];

    // API calls only for uncached connectors
    const requests = connectorIds
      .filter(id => !this.connectorsMap[id])
      .map(id => this.connectorService.getConnector(id));

    // No new calls needed
    if (requests.length === 0) {
      this.attachConnectorData();
      return;
    }

    forkJoin(requests).subscribe({
      next: (connectors: any[]) => {
        connectors.forEach(conn => {
          this.connectorsMap[conn.id] = conn;
        });

        this.attachConnectorData();
      },
      error: () => {
        this.loading = false;
        this.snack.open('Failed to load app logos', 'OK', { duration: 2000 });
      }
    });
  }

  /* ================= ATTACH CONNECTOR DATA ================= */

  private attachConnectorData() {
    this.connections.forEach(c => {
      c.connector = this.connectorsMap[c.connectorId];
    });

    this.pageIndex = 0;
    this.setPageData();
    this.loading = false;
  }

  /* ================= PAGINATION ================= */

  setPageData() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedConnections = this.connections.slice(start, end);
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.setPageData();
  }

  /* ================= UI ACTIONS ================= */

  openAddConnection() {
    this.addConnection.emit();
  }

  selectConnection(connection: any) {
    this.select.emit(connection);
  }

  /* ================= CONNECTION ACTIONS ================= */

  retest(connection: any) {
    alert('Retest connection');
  }

  reconnect(connection: any) {
    alert('Reconnect connection');
  }

  delete(connection: any) {
    if (!confirm('Delete this connection?')) return;

    this.connectionService.deleteConnection(connection.id).subscribe({
      next: () => {
        this.snack.open('Connection deleted', 'OK', { duration: 2000 });
        this.loadConnections();
      },
      error: () => {
        this.snack.open('Delete failed', 'OK', { duration: 2000 });
      }
    });
  }
}
