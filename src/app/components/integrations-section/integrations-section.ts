import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConnectorService } from '../../services/connector.service';

@Component({
  selector: 'app-integrations-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './integrations-section.html',
  styleUrls: ['./integrations-section.scss']
})
export class IntegrationsSectionComponent implements OnInit {

  connectors: any[] = [];
  filteredConnectors: any[] = [];

  selectedApps: any[] = [];

  triggers: any[] = [];
  actions: any[] = [];

  selectedTrigger: any = null;
  selectedAction: any = null;

  searchText = '';

  constructor(
    private connectorService: ConnectorService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadConnectors();
  }

  loadConnectors() {

    this.connectorService.getAllConnectors().subscribe({
      next: (res: any) => {

        this.connectors = res;
        this.filteredConnectors = res.slice(0, 20);

      },
      error: (err) => {
        console.error("Failed to load connectors", err);
      }
    });

  }

  searchApps() {

    const filtered = this.connectors.filter(app =>
      app.name.toLowerCase().includes(this.searchText.toLowerCase())
    );

    this.filteredConnectors = filtered.slice(0, 20);

  }

  selectApp(app: any) {

    if (!this.selectedApps.find(a => a.id === app.id)) {
      this.selectedApps.push(app);
    }

    this.loadTriggersActions();

  }

  selectTrigger(trigger: any) {

    this.selectedTrigger = trigger;
    this.checkNavigation();

  }

  selectAction(action: any) {

    this.selectedAction = action;
    this.checkNavigation();

  }

  checkNavigation() {

    if (this.selectedTrigger && this.selectedAction) {

      const workflow = {
        trigger: this.selectedTrigger,
        action: this.selectedAction,
        triggerConnector: this.selectedTrigger?.connectorLogo,
        actionConnector: this.selectedAction?.connectorLogo
      };

      localStorage.setItem("newWorkflow", JSON.stringify(workflow));

      this.router.navigate(['/workflow-preview']);

    }

  }

  loadTriggersActions() {

    this.triggers = [];
    this.actions = [];

    this.selectedApps.forEach(app => {

      /* TRIGGERS */

      this.connectorService
        .getTriggersByConnector(app.id)
        .subscribe((res: any) => {

          const triggers = res.map((t: any) => ({
            ...t,
            connectorLogo: app.logoUrl,
            connectorName: app.name
          }));

          this.triggers = [...this.triggers, ...triggers].slice(0, 10);

        });
      this.connectorService
        .getActionsByConnector(app.id)
        .subscribe((res: any) => {

          const visibleActions = res
            .filter((a: any) => !a.isHidden)
            .map((a: any) => ({
              ...a,
              connectorLogo: app.logoUrl,
              connectorName: app.name
            }));

          this.actions = [...this.actions, ...visibleActions].slice(0, 10);

        });

    });

  }
  removeApp(app: any) {
    this.selectedApps = this.selectedApps.filter(a => a.id !== app.id);
    this.selectedTrigger = null;
    this.selectedAction = null;
    this.loadTriggersActions();
  }
  isSelected(app: any): boolean {
    return this.selectedApps?.some(a => a.id === app.id);
  }
}
