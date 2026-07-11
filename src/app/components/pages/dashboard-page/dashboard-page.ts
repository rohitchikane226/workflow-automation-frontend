import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { SidebarComponent } from '../../sidebar/sidebar/sidebar';
import { CreateWorkflowDialogComponent } from '../../workflows/create-workflow-dialog/create-workflow-dialog';
import { WorkflowService } from '../../../services/workflow.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    SidebarComponent,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    RouterModule,
    MatMenuModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './dashboard-page.html',
  styleUrls: ['./dashboard-page.scss']
})
export class DashboardPageComponent implements OnInit {
  workflows: any[] = [];
  totalWorkflows = 0;
  activeWorkflows = 0;
  inactiveWorkflows = 0;
  username: string | null = '';
  displayedColumns: string[] = ['name', 'status', 'action'];

  constructor(
    private dialog: MatDialog,
    private workflowService: WorkflowService,
    private router: Router
  ) {}

  ngOnInit(): void { this.loadWorkflows(); 
    this.username = localStorage.getItem('email');
  }

  loadWorkflows(): void {
    this.workflowService.getAllWorkflows().subscribe({
      next: (data) => {
        this.workflows = data || [];
        this.totalWorkflows = this.workflows.length;
        this.activeWorkflows = this.workflows.filter(w => w.active).length;
        this.inactiveWorkflows = this.workflows.filter(w => !w.active).length;
      },
      error: (err) => console.error('Error loading workflows:', err)
    });
  }


  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateWorkflowDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.workflowService.createWorkflow({ name: result }).subscribe(workflow => {
         console.log("workflow id is ,",workflow.id)
          this.router.navigate(['/builder', workflow.id]);
           // this.router.navigateByUrl(`/builder/${workflow.id}`).then(success => {
           //   console.log('Navigation success:', success);
          // });
        });
      }
    });
  }
  logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  this.router.navigate(['/login']);
}

goToSettings() {
  this.router.navigate(['/settings']);
}

  goToBuilder(id: number) { this.router.navigate(['/builder', id]); }
}
