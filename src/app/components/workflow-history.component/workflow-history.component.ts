import { Component, Input, OnInit } from '@angular/core';
import { WorkflowHistoryService } from '../../services/workflow-history.service';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { WorkflowService } from '../../services/workflow.service';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from '../sidebar/sidebar/sidebar';

@Component({
  selector: 'app-workflow-history',
  templateUrl: './workflow-history.component.html',
  imports: [CommonModule,MatPaginatorModule,MatIconModule,SidebarComponent],
  styleUrls: ['./workflow-history.component.scss']
})
export class WorkflowHistoryComponent implements OnInit {

  @Input() workflowId!: number;
 steps: any[] = [];

  history: any[] = [];

  pagedHistory: any[] = [];

  page = 1;
  pageSize = 10;

  expandedRunId: number | null = null;

  constructor(private historyService: WorkflowHistoryService,private route: ActivatedRoute,private workflowService:WorkflowService) {}

 ngOnInit(): void {

  this.workflowId = Number(
    this.route.snapshot.paramMap.get('workflowId')
  );

  const nav = history.state;

  if (nav && nav.steps) {
    this.steps = nav.steps;
    //console.log("this.steps ",JSON.stringify(this.steps))
  }

  this.loadHistory();

}

  loadHistory() {
    this.historyService.getWorkflowHistory(this.workflowId)
      .subscribe(data => {
        this.history = data;
        this.updatePage();
      });
  }

  updatePage() {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.pagedHistory = this.history.slice(start, end);
  }
loadSteps() {

  this.workflowService.getWorkflowSteps(this.workflowId)
    .subscribe(steps => {

      this.steps = steps;
      console.log("Hosyr steps",JSON.stringify(this.steps ));

      this.loadHistory();

    });

}
  nextPage() {
    this.page++;
    this.updatePage();
  }

  prevPage() {
    this.page--;
    this.updatePage();
  }

  toggle(runId: number) {
    this.expandedRunId = this.expandedRunId === runId ? null : runId;
  }
  getStepName(stepId: number): string {

  const step = this.steps?.find(s => s.id === stepId);

  if (!step) return 'Unknown';

  if (step.connectorName) {
    return step.connectorName;
  }

  return 'Unknown';
}

}