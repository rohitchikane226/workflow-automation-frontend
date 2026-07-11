import { Routes } from '@angular/router';
import { HomePageComponent } from './components/pages/home-page/home-page';
import { DashboardPageComponent } from './components/pages/dashboard-page/dashboard-page';
import { WorkflowBuilderPageComponent } from './pages/workflow-builder-page/workflow-builder-page';
import { WorkflowBuilderComponent } from './components/workflow-builder/workflow-builder';
import { ConnectionsComponent } from './components/connections/connections';
import { WorkflowHistoryComponent } from './components/workflow-history.component/workflow-history.component';
import { WorkflowPreviewComponent } from './components/pages/workflows-page/workflows-page';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  {path:'', component:HomePageComponent},
  { path: 'dashboard', component: DashboardPageComponent,canActivate: [AuthGuard] },
  { path: 'builder/:id', component: WorkflowBuilderPageComponent,canActivate: [AuthGuard] },
  { path: "connections", component: ConnectionsComponent,canActivate: [AuthGuard] },
  {
  path: 'workflows/:workflowId/history',
  component: WorkflowHistoryComponent,canActivate: [AuthGuard]
},
{
  path: 'auth',
  loadComponent: () =>
    import('./components/auth.component/auth.component').then(m => m.AuthComponent)
},
{ path:'workflow-preview', component:WorkflowPreviewComponent  },
  { path: '**', redirectTo: '' },
];
