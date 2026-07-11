import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar/sidebar';
import { WorkflowBuilderComponent } from '../../components/workflow-builder/workflow-builder';
@Component({
  selector: 'app-workflow-builder-page',
  standalone:true,
  imports:[SidebarComponent,WorkflowBuilderComponent],
  templateUrl: './workflow-builder-page.html',
  styleUrls: ['./workflow-builder-page.scss']
})
export class WorkflowBuilderPageComponent {}
