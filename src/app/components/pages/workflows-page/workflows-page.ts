import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkflowService } from '../../../services/workflow.service';

@Component({
  selector: 'app-workflow-preview',
  templateUrl: './workflows-page.html',
  styleUrls: ['./workflows-page.scss']
})
export class WorkflowPreviewComponent implements OnInit {

  workflow: any;

  constructor(
    private router: Router,
    private workflowService: WorkflowService
  ) { }

  ngOnInit() {

    
    const data = localStorage.getItem("newWorkflow");

    if (data) {
      this.workflow = JSON.parse(data);
    }

  }

  createWorkflow() {
    const triggerName = this.workflow?.trigger?.name || 'Trigger';
  const actionName = this.workflow?.action?.name || 'Action';

  const triggerConnector = this.workflow?.triggerConnector || '';
  const actionConnector = this.workflow?.actionConnector || '';

  const dynamicName = `When ${triggerName} in ${triggerConnector}, ${actionName} in ${actionConnector}`;

    const payload = {
      name: "Untitled workflow"
    };

    this.workflowService.createWorkflow(payload)
      .subscribe((workflow: any) => {

        const workflowId = workflow.id;

        const selection = {
          trigger: this.workflow.trigger,
          action: this.workflow.action,
          connector: this.workflow.connector,
          fromPreview: true
        };

        localStorage.setItem("builderSelection", JSON.stringify(selection));

        this.router.navigate(['/builder', workflowId]);

      });

  }
}