import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { WorkflowHistoryComponent } from '../../components/workflow-history.component/workflow-history.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
//import { ConnectionModalComponent } from '../../components/connection-modal/connection-modal';
import { ConnectionsComponent } from '../connections/connections';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConnectionService } from '../../services/connection.service'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppPopupComponent } from '../app-popup/app-popup';
import { DropdownOptionsPipe } from '../../pipes/dropdown-options-pipe';
import { MappingPopupComponent } from '../../components/mapping-popup/mapping-popup'
import { StepSelectionDialogComponent } from '../step-selection-dialog/step-selection-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConnectionModalComponent } from '../../components/connection-modal/connection-modal'
import {
  MatExpansionModule
} from '@angular/material/expansion';
import { MapOrValueDialogComponent } from '../map-or-value-dialog/map-or-value-dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { WorkflowService } from '../../services/workflow.service';
import { ConnectorService } from '../../services/connector.service';
import { MatDialogModule } from '@angular/material/dialog';
import { ElementRef, QueryList, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-workflow-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIconModule,
    DropdownOptionsPipe,
    MatMenuModule,
    MatSlideToggleModule
  ],
  templateUrl: './workflow-builder.html',
  styleUrls: ['./workflow-builder.scss'],
})
export class WorkflowBuilderComponent implements OnInit {
  workflowId!: number;
  workflow: any = {};
  connectors: any[] = [];
  steps: any[] = [];
  //add on 6-12-2025
  connections: any[] = [];
  selectedConnection: number | null = null;
  selectedConnector: any = null;
  dropdownLoaders: { [key: string]: boolean } = {};
  saveMessage = '';
  showSaveAlert = false;
  private saveAlertTimer: any = null;


  //added end
  @ViewChildren('menuTrigger') menuRefs!: QueryList<ElementRef>;
  isLoading = true;

  // for mapping
  availableOutputs: any[] = [];
  currentMappingField: any = null;
  currentMappingStep: any = null;

  constructor(
    private route: ActivatedRoute,
    private workflowService: WorkflowService,
    private connectorService: ConnectorService,
    private dialog: MatDialog,
    private connectionService: ConnectionService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {

    const idStr = this.route.snapshot.paramMap.get('id');
    this.workflowId = idStr ? Number(idStr) : NaN;

    const selection = localStorage.getItem("builderSelection");

    if (selection) {

      const state = JSON.parse(selection);

      this.loadForNewWorkflowWithSelection(state);

      localStorage.removeItem("builderSelection");

    }
    else {

      this.loadWorkflowAndPopulate();

    }

  }
  openHistory() {

    this.router.navigate(
      ['/workflows', this.workflow.id, 'history'],
      {
        state: { steps: this.steps }
      }
    );

  }
  openMapOrValueDialog(step: any, field: any) {
    this.dialog.open(StepSelectionDialogComponent, {
      width: '400px',
      position: {
        right: '16'
      },
      panelClass: 'right-side-dialog',
      data: {
        step,
        field,
        previousSteps: this.steps.slice(0, this.steps.indexOf(step))
      }
    });
  }
  onConnectionSelected(connection: any, step: any) {
    step.connectionId = connection.id;
    step.connectionName = connection.name;
    step.connected = true;

    step.showConnections = false;
  }

  onFieldClick(step: any, field: any): void {
    // If value already manually entered → do nothing
    if (step.config[field.id] && !this.isMappedValue(step.config[field.id])) {
      return;
    }


    // Open mapping popup directly
    this.openOutputPopup(step);

    // Track current field for mapping
    this.currentMappingField = field;
    this.currentMappingStep = step;
  }


  private loadForNewWorkflow(): void {
    this.connectorService.getAllConnectors().subscribe({
      next: (conns) => {
        this.connectors = conns || [];
        this.steps = [this.createTriggerStep()];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading connectors (new workflow):', err);
        this.steps = [this.createTriggerStep()];
        this.isLoading = false;
      },
    });
  }

  private loadWorkflowAndPopulate(): void {
    this.isLoading = true;

    this.workflowService.getWorkflowById(this.workflowId).subscribe({
      next: (wf: any) => {
        this.workflow = wf || {};

        this.connectorService.getAllConnectors().subscribe({
          next: (conns: any[]) => {
            const conditionConnector = {
              id: 'condition',
              name: 'Condition',
              logoUrl: 'assets/condition-icon.png', // optional icon
              isCondition: true
            };

            this.connectors = [conditionConnector, ...(conns || [])];


            this.steps = [];

            if (wf?.steps?.length) {
              wf.steps.forEach((backendStep: any) =>
                this.buildStepFromBackend(backendStep)
              );
            } else {
              this.steps = [this.createTriggerStep()];
            }

            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.loadForNewWorkflow();
      }
    });
  }



  openOutputPopup(step: any): void {
    if (!step?.id) {
      alert('Please save the step before viewing outputs.');
      return;
    }
    this.workflowService.getStepOutputs(step.id).subscribe({
      next: (outputs) => {

        const latestMap = new Map<string, any>();
        (outputs || []).forEach((o: any) => latestMap.set(o.key, o));

        const latestOutputs = Array.from(latestMap.values()).map((o: any) => ({
          key: o.key,
          label: o.key,
          value: o.value,
          type: o.type || 'Text'
        }));

        if (step.type === 'trigger') {
          step.inlineOutputs = latestOutputs;
          step.inlineHasData = latestOutputs.length > 0;
          step.showInlineOutputs = true;
        }
        else {
          this.dialog.open(MappingPopupComponent, {
            width: '600px',
            data: {
              stepOrder: step.stepOrder,
              outputs: latestOutputs,
              hasData: latestOutputs.length > 0,
            },
          });
        }
      }
    });
  }
  // private loadFieldsForStep(step: any, hasData: boolean): void {
  //   let fields$: Observable<any[]>;

  //   if (step.type === 'TRIGGER' || step.triggerId) {
  //     fields$ = this.connectorService.getTriggerFields(step.triggerId);
  //   } else if (step.type === 'ACTION' || step.actionId) {
  //     fields$ = this.connectorService.getActionFields(step.actionId);
  //   } else {
  //     console.error('Invalid step type for loading fields');
  //     return;
  //   }

  //   fields$.subscribe({
  //     next: (fields) => {
  //       const mapped = fields.map((f: any) => ({
  //         key: f.key || f.name,
  //         label: f.label || f.key,
  //         value: '',
  //       }));

  //       this.dialog.open(MappingPopupComponent, {
  //         width: '600px',
  //         data: {
  //           stepOrder: step.stepOrder,
  //           outputs: mapped,
  //           hasData: hasData,
  //         },
  //       });
  //     },
  //     error: (err) => {
  //       console.error('Error fetching trigger/action fields:', err);
  //       alert('Failed to load fields.');
  //     },
  //   });
  // }




  // openOutputPopup(step: any): void {
  //   if (!step?.id) {
  //     alert('Please save the step before viewing outputs.');
  //     return;
  //   }

  //   // First, get stored outputs if any
  //   this.workflowService.getStepOutputs(step.id).subscribe({
  //     next: (outputs) => {
  //       let processedOutputs: any[] = [];

  //       if (Array.isArray(outputs) && outputs.length > 0) {
  //         // Use latest data if available
  //         const latestMap = new Map<string, any>();
  //         outputs.forEach((o) => latestMap.set(o.key, o));
  //         processedOutputs = Array.from(latestMap.values());
  //       } else {
  //         // No test data yet → fallback to step’s default output fields
  //         processedOutputs = step.outputFields?.map((f: any) => ({
  //           key: f.key || f.name,
  //           label: f.label || f.key,
  //           value: '', // No value yet
  //         })) || [];
  //       }

  //       // Open popup with either actual data or structure
  //       const dialogRef = this.dialog.open(MappingPopupComponent, {
  //         width: '600px',
  //         data: {
  //           stepOrder: step.stepOrder,
  //           outputs: processedOutputs,
  //           hasData: outputs?.length > 0,
  //         },
  //       });

  //       dialogRef.afterClosed().subscribe((selectedOutput) => {
  //         if (selectedOutput) {
  //           console.log('User selected output:', selectedOutput);
  //         }
  //       });
  //     },
  //     error: (err) => {
  //       console.error('❌ Error fetching step outputs:', err);

  //       // On error, still open popup with structure (not data)
  //       const structureOutputs = step.outputFields?.map((f: any) => ({
  //         key: f.key || f.name,
  //         label: f.label || f.key,
  //         value: '',
  //       })) || [];

  //       this.dialog.open(MappingPopupComponent, {
  //         width: '600px',
  //         data: {
  //           stepOrder: step.stepOrder,
  //           outputs: structureOutputs,
  //           hasData: false,
  //         },
  //       });
  //     },
  //   });
  // }

  //latest
  // openOutputPopup(step: any): void {
  //   if (!step?.id) {
  //     alert('Please save the step before viewing outputs.');
  //     return;
  //   }

  //   this.workflowService.getStepOutputs(step.id).subscribe({
  //     next: (outputs) => {
  //       const dialogRef = this.dialog.open(MappingPopupComponent, {
  //         width: '600px',
  //         data: {
  //           stepOrder: step.stepOrder,
  //           outputs: outputs || [],
  //         },
  //       });

  //       dialogRef.afterClosed().subscribe((selectedOutput) => {
  //         if (selectedOutput) {
  //           console.log('User selected output:', selectedOutput);
  //         }
  //       });
  //     },
  //     error: (err) => {
  //       console.error('Error fetching step outputs:', err);
  //       alert('❌ Failed to load step outputs');
  //     },
  //   });
  // }

  //second
  // openOutputPopup(step: any): void {
  //   if (!this.workflow || !this.workflow.steps) {
  //     alert('Workflow data not loaded yet.');
  //     return;
  //   }

  //   const dialogRef = this.dialog.open(MappingPopupComponent, {
  //     width: '600px',
  //     data: {
  //       workflow: this.workflow,  
  //       currentStep: step         
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe((selectedOutput) => {
  //     if (selectedOutput && this.currentMappingField && this.currentMappingStep) {
  //       // ✅ Apply the selected mapping to the field config
  //       this.currentMappingStep.config[this.currentMappingField.id] = selectedOutput;
  //     }
  //   });
  // }



  // private buildStepFromBackend(backendStep: any): void {
  //   const isTrigger = !!backendStep.trigger;
  //   const step: any = {
  //     id: backendStep.id,
  //     stepOrder: backendStep.stepOrder,
  //     type: isTrigger ? 'trigger' : 'action',
  //     connectorId: isTrigger
  //       ? backendStep.trigger?.connector?.id ?? null
  //       : backendStep.action?.connector?.id ?? null,
  //     connectorName: isTrigger
  //       ? backendStep.trigger?.connector?.name ?? ''
  //       : backendStep.action?.connector?.name ?? '',
  //     triggerId: backendStep.trigger?.id ?? null,
  //     actionId: backendStep.action?.id ?? null,
  //     availableTriggers: [],
  //     availableActions: [],
  //     fields: [],
  //     outputs: [],
  //     config: {},
  //     expanded: backendStep.stepOrder === 1,
  //   };

  //   if (isTrigger) {
  //     this.connectorService
  //       .getTriggersByConnector(step.connectorId)
  //       .subscribe((trigs) => {
  //         step.availableTriggers = trigs || [];
  //         if (step.triggerId) {
  //           this.connectorService
  //             .getTriggerFields(step.triggerId)
  //             .subscribe((fields) => {
  //               step.fields = fields || [];
  //             });
  //         }
  //       });
  //   } else {
  //     this.connectorService
  //       .getActionsByConnector(step.connectorId)
  //       .subscribe((acts) => {
  //         step.availableActions = acts || [];
  //         if (step.actionId) {
  //           this.connectorService
  //             .getActionFields(step.actionId)
  //             .subscribe((fields) => {
  //               step.fields = fields || [];
  //             });
  //         }
  //       });
  //   }

  //   this.workflowService.getStepOutputs(backendStep.id).subscribe({
  //     next: (outs) => (step.outputs = outs || []),
  //     error: () => (step.outputs = []),
  //   });

  //   this.steps.push(step);
  // }

  private loadFieldsForStep(step: any, hasData: boolean): void {
    let fields$: Observable<any[]>;
    if (step.type === 'trigger' || step.triggerId) {
      fields$ = this.connectorService.getTriggerFields(step.triggerId,
        this.workflowId,
        step.id);
    } else if (step.type === 'action' || step.actionId) {

      fields$ = this.connectorService.getActionFields(
        step.actionId,
        this.workflowId,
        step.id
      );
    } else {
      console.error('Invalid step type for loading fields');
      return;
    }

    fields$.subscribe({
      next: (fields) => {
        const outputFields = fields.filter((f: any) => f.fieldType === 'output');
        const mapped = outputFields.map((f: any) => ({
          key: f.key || f.name,
          label: f.label || f.key,
          value: '',
        }));
        if (mapped.length === 0) {
          alert('No output fields available for this step.');
          return;
        }

        this.dialog.open(MappingPopupComponent, {
          width: '700px',
          maxHeight: '90vh',
          panelClass: 'custom-dialog-container',
          data: {
            stepOrder: step.stepOrder,
            outputs: mapped,
            hasData: hasData,
          },
        });
      },
      error: (err) => {
        console.error('Error fetching trigger/action fields:', err);
        alert('Failed to load output fields');
      },
    });
  }


private buildStepFromBackend(backendStep: any): void {

  // 🔥 Detect step type from DB
  const isTrigger = !!backendStep.trigger_id || !!backendStep.trigger;
  const isAction = !!backendStep.action_id || !!backendStep.action;
  const isCondition = backendStep.stepType === 'condition' || backendStep.step_type === 'condition';

  // 🔥 Connector (only for trigger/action)
  const connector = isTrigger
    ? backendStep.trigger?.connector
    : backendStep.action?.connector;

  const step: any = {
    id: backendStep.id,
    stepOrder: backendStep.stepOrder || backendStep.step_order,

    // ✅ TYPE FIX
    type: isCondition ? 'condition' : (isTrigger ? 'trigger' : 'action'),

    connectorId: connector?.id ?? null,
    connectorName: connector?.name ?? '',

    showInlineOutputs: false,
    inlineOutputs: [],

    triggerId: backendStep.trigger?.id ?? backendStep.trigger_id ?? null,
    actionId: backendStep.action?.id ?? backendStep.action_id ?? null,

    availableTriggers: [],
    availableActions: [],

    staticFields: [],
    dynamicFields: [],
    fields: [],
    outputs: [],
    config: {},
    testing: false,

    expanded: (backendStep.stepOrder || backendStep.step_order) === 1,

    // ✅ Connection
    connectionId: backendStep.connectionId ?? backendStep.connection_id ?? null,
    connectionName: backendStep.connectionName ?? null,
    connected: !!(backendStep.connectionId || backendStep.connection_id),

    connections: [],

    // ✅ CONDITION SUPPORT
    trueStepId: backendStep.trueStepId || backendStep.true_step_id,
    falseStepId: backendStep.falseStepId || backendStep.false_step_id,
    trueStep: null,
    falseStep: null,
    conditionJson: backendStep.conditionJson || backendStep.condition_json
  };

  step.selectedConnector = connector || null;

  // =========================================================
  // 🔥 CONDITION STEP LOGIC (MAIN PART)
  // =========================================================
  if (isCondition) {

    step.fields = [
      {
        id: 'left',
        label: 'Field',
        fieldType: 'input'
      },
      {
        id: 'operator',
        label: 'Operator',
        fieldType: 'input',
        options: [
          { label: 'Equals', value: '==' },
          { label: 'Not Equals', value: '!=' },
          { label: 'Greater Than', value: '>' },
          { label: 'Less Than', value: '<' }
        ]
      },
      {
        id: 'right',
        label: 'Value',
        fieldType: 'input'
      }
    ];

    // ✅ Parse saved condition JSON
    if (step.conditionJson) {
      try {
        const parsed = JSON.parse(step.conditionJson);
        step.config = {
          left: parsed.left,
          operator: parsed.operator,
          right: parsed.right
        };
      } catch (e) {
        console.error('Invalid condition JSON', e);
      }
    }

    this.steps.push(step);
    return; // ⛔ stop further execution
  }

  // =========================================================
  // 🔥 NORMAL TRIGGER / ACTION FLOW
  // =========================================================

  // ✅ Load connections
  if (step.connectorId) {
    this.connectionService.getConnections(step.connectorId).subscribe({
      next: (res: any) => step.connections = res || [],
      error: () => step.connections = []
    });
  }

  // ✅ Load triggers/actions
  const listApi = isTrigger
    ? this.connectorService.getTriggersByConnector(step.connectorId)
    : this.connectorService.getActionsByConnector(step.connectorId);

  listApi.subscribe(items => {
    if (isTrigger) step.availableTriggers = items || [];
    else step.availableActions = items || [];

    const selectedId = isTrigger ? step.triggerId : step.actionId;

    if (!selectedId) return;
    if (!step.connectionId) return;

    const loadFields$ = isTrigger
      ? this.connectorService.getTriggerFields(selectedId, this.workflowId, step.id)
      : this.connectorService.getActionFields(selectedId, this.workflowId, step.id);

    loadFields$.subscribe(fields => {
      step.staticFields = fields || [];
      step.dynamicFields = [];

      this.loadDynamicInputFields(step);
    });
  });

  // ✅ Load outputs
  this.workflowService.getStepOutputs(step.id).subscribe({
    next: outs => step.outputs = outs || [],
    error: () => step.outputs = []
  });

  this.steps.push(step);
}



  createTriggerStep(): any {
    return {
      type: 'trigger',
      connectorId: '',
      triggerId: '',
      availableTriggers: [],
      showInlineOutputs: false,
      inlineOutputs: [],
      fields: [],
      config: {},
      expanded: true,
    };
  }

  createActionStep(): any {
    return {
      type: 'action',
      connectorId: '',
      actionId: '',
      availableActions: [],
      fields: [],
      config: {},
      expanded: false,
    };
  }
  onLogoError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/default-app-icon.png';
  }

  onConnectorChange(step: any): void {
    if (!step.connectorId) return;
    if (step.type === 'trigger') {
      this.connectorService.getTriggersByConnector(step.connectorId).subscribe({
        next: (res) => (step.availableTriggers = res || []),
      });
    } else {
      this.connectorService.getActionsByConnector(step.connectorId).subscribe({
        next: (res) => (step.availableActions = res || []),
      });
    }
    this.connectionService.getConnections(step.connectorId)
      .subscribe({
        next: (res: any) => {
          step.connections = res;      // ⭐ Load connections into step
        },
        error: () => {
          step.connections = [];
        }
      });
  }
  toggleAppList(step: any) {
    step.showAppList = !step.showAppList;
  }
  public isDynamicDropdown(field: any): boolean {
    // ✅ No alert, just return the boolean
    return field?.fieldDataType === 'dynamic_dropdown';
  }

  // Better: compute once when fields are loaded
  private markDynamicDropdowns(step: any) {
    if (!step.fields) return;
    step.fields.forEach((f: any) => {
      f.isDynamicDropdown = f.fieldDataType === 'dynamic_dropdown';
    });
  }

  selectConnector(step: any, connector: any) {
    if (connector.isCondition) {
      this.convertToConditionStep(step);
      return;
    }
    step.selectedConnector = connector;
    step.connectorId = connector.id;
    step.connectorName = connector.name;
    step.connectionId = null;
    step.connectionName = null;
    step.connected = false;

    step.staticFields = [];
    step.dynamicFields = [];
    step.fields = [];
    step.config = {};

    step.showAppList = false;

    this.onConnectorChange(step);
  }

  compareDropdownValues = (o1: any, o2: any): boolean => {
    // Compare by both label + value
    if (!o1 || !o2) return false;

    return o1 === o2; // for string value, works fine
  };

  // onLogoError(event: Event) {
  //   (event.target as HTMLImageElement).src = 'assets/default-app-icon.png';
  // }


  onTriggerSelect(step: any): void {
    if (!step.triggerId) return;
    // this.connectorService.getTriggerFields(step.triggerId, this.workflowId,
    //   step.id).subscribe({
    //     next: (fields) => (step.fields = fields || []),
    //   });
    step.staticFields = [];
    step.dynamicFields = [];
    step.fields = [];
    this.saveStep(step); // ✅ auto-save trigger selection
    if (step.connectionId) {
      this.loadFieldsAfterConnection(step);
    }
  }


  onActionSelect(step: any): void {
    if (!step.actionId) return;

    // ❌ DO NOT load fields here
    step.staticFields = [];
    step.dynamicFields = [];
    step.fields = [];

    this.saveStep(step);
    if (step.connectionId) {
      this.loadFieldsAfterConnection(step);
    }
  }

  getInputFields(step: any): any[] {
    return step.fields?.filter((f: any) => f.fieldType === 'input') || [];
  }

  getAvailableOutputs(currentStepIndex: number): any[] {
    let outputs: any[] = [];
    for (let j = 0; j < currentStepIndex - 1; j++) {
      if (this.steps[j].outputFields) {
        outputs.push(
          ...this.steps[j].outputFields.map((o: any) => ({
            ...o,
            fromStep: j + 1,
          }))
        );
      }
    }
    return outputs;
  }

  prepareMapping(step: any, field: any): void {
    this.currentMappingField = field;
    this.currentMappingStep = step;

    // 🔹 Refresh outputs from previous steps before mapping
    const previousSteps = this.steps.filter(s => s.stepOrder < step.stepOrder);

    const requests = previousSteps.map(prev =>
      this.workflowService.getStepOutputs(prev.id)
    );

    Promise.all(requests.map(req => req.toPromise()))
      .then(allOutputs => {
        const combined: any[] = [];

        allOutputs.forEach((outs, idx) => {
          const fromStep = previousSteps[idx];
          if (outs) {
            const latestMap = new Map<string, any>();
            outs.forEach((o: any) => latestMap.set(o.key, o));
            Array.from(latestMap.values()).forEach(v =>
              combined.push({ ...v, fromStep: fromStep.stepOrder })
            );
          }
        });

        this.availableOutputs = combined;
      })
      .catch(err => {
        console.error('Error refreshing step outputs:', err);
        this.availableOutputs = [];
      });
  }
  testStep(step: any) {
    if (step.type === 'trigger') {

      step.testing = true;

      this.workflowService.testTriggerStep(step.id)
        .subscribe({
          next: () => {

            step.testing = false;

            // 🔥 Call existing method to load fresh output
            this.openOutputPopup(step);

          },
          error: (err) => {
            step.testing = false;
            console.error('Trigger test failed', err);
          }
        });

    } else {

      //this.testActionStep(step);

    }
  }

  addStep(): void {
    const newStep = this.createActionStep();
    newStep.stepOrder = this.steps.length + 1;
    this.steps.push(newStep);
  }
  isMappedValue(value: string): boolean {
    return value?.includes('{{');
  }
  parseDropdownOptions(options: string): { label: string; value: string }[] {
    console.log("options   ", options)
    if (!options || typeof options !== 'string') return [];

    return options
      .split(',')
      .map(pair => {
        const [key, label] = pair.split('|');
        return {
          value: key?.trim(),
          label: label?.trim()
        };
      })
      .filter(o => o.value && o.label);
  }

  // getDisplayValue(value: string): string {
  //   if (!this.isMappedValue(value)) return value;
  //   const match = value.match(/step(\d+)\.(.+?)}}/);
  //   if (match) {
  //     return `${match[1]}. ${match[2]}`;
  //   }
  //   return value;
  // }
  openAppPopup(step: any) {
    const dialogRef = this.dialog.open(AppPopupComponent, {
      width: '600px',
      data: { connectors: this.connectors },
    });

    dialogRef.afterClosed().subscribe((selectedApp) => {
      if (selectedApp) {
        this.selectConnector(step, selectedApp);
      }
    });
  }

  getMappedSource(value: string): string {
    const match = value.match(/\{\{(\d+)\.(.*?)\}\}/);
    return match ? `Step ${match[1]} → ${match[2]}` : '';
  }
  onInputChange(event: any, step: any, field: any) {
    const display = event.target.value;

    step.config[field.id] = this.getActualValue(display);
  }
  // onSelectChange(value: any, step: any, field: any): void {
  //   step.config[field.id] = value;
  // }
  //   onSelectChange(event: any, step: any, field: any): void {
  //   if (!step.config) step.config = {};
  //   step.config[field.id] = event.value;   // ✅ correct
  // }
  onDropdownChange(value: any, step: any, field: any): void {
    step.config[field.id] = value;

    const loaderKey = `${step.id}_${field.key}`;
    this.dropdownLoaders[loaderKey] = true;

    const payload = {
      stepKey: field.key,
      value: value
    };

    this.workflowService.saveOrUpdateStepInput(step.id, payload)
      .subscribe(() => {

        if (field.refresh === 1 || field.refresh === true) {

          // clear dependent values
          this.clearDependentDynamicValues(step, field.key);

          // refresh dropdowns
          this.refreshDependentDropdowns(step, field.key, loaderKey);

        } else {
          this.dropdownLoaders[loaderKey] = false;
        }
      });
  }

  mapOutput(step: any, field: any, output: any) {

    const token = `{{step${output.fromStep}.${output.key}}}`;

    const input = document.activeElement as HTMLInputElement;
    let current = step.config[field.id] || '';

    if (input && (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA')) {

      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;

      const newValue =
        current.substring(0, start) +
        token +
        current.substring(end);

      step.config[field.id] = newValue;

      setTimeout(() => {
        input.selectionStart = input.selectionEnd = start + token.length;
      });

    } else {
      step.config[field.id] = current + token;
    }
  }
  splitValues(value: string): string[] {
    if (!value) return [];

    return value
      .split(/\n|,/g)   // 👈 supports Enter + comma
      .map(v => v.trim())
      .filter(v => v.length > 0);
  }

  /** Shows user-friendly label like "Step 1: email" */
  getDisplayValue(value: string): string {
    if (!value) return '';

    return value.replace(
      /\{\{step(\d+)\.([^}]+)\}\}/g,
      (_, step, key) => `Step ${step}: ${key}`
    );
  }

  /** Converts display value back to actual mapping string before saving */
  getActualValue(value: string): string {
    if (!value) return '';

    return value.replace(/Step (\d+): ([^\n]+)/g,
      (_, step, key) => `{{step${step}.${key}}}`
    );
  }

  /** When saving workflow, always store actual mapping format */
 saveWorkflow(): void {

  const payload = {
    ...this.workflow,
    steps: this.steps.map((s: any, i: number) => {

      const base: any = {
        id: s.id || null,
        stepOrder: i + 1,
        stepType: s.type,

        triggerId: s.type === 'trigger' ? s.triggerId : null,
        actionId: s.type === 'action' ? s.actionId : null,
        connectionId: s.connectionId || null
      };

      // ✅ CONDITION
      if (s.type === 'condition') {
        base.conditionJson = JSON.stringify({
          left: s.config?.left,
          operator: s.config?.operator,
          right: s.config?.right
        });

        base.trueStepId = s.trueStep?.id || null;
        base.falseStepId = s.falseStep?.id || null;
      }

      return base;
    })
  };

  this.workflowService.updateWorkflow(this.workflowId, payload).subscribe();
}

onConditionChange(step: any) {
  if (step.type !== 'condition') return;
  this.saveStep(step);
}
  mapSingleStep(step: any) {
    return {
      id: step.id || null,
      actionId: step.actionId,
      config: this.cleanConfigValues(step.config)
    };
  }
  openConnectionModal(step: any) {
    alert("step id"+step.id)
    const dialogRef = this.dialog.open(ConnectionModalComponent, {
      width: '450px',
      disableClose: false,
      panelClass: 'connection-panel',
      data: {
        workflowId: this.workflowId,
        stepId: step.id,
        step: step,
        connector: step.selectedConnector || step.connector
      }
    })

    dialogRef.afterClosed().subscribe((selectedConnection) => {


      if (selectedConnection) {
        // update step UI after modal selection
        step.connectionId = selectedConnection.id;
        
        step.connectionName = selectedConnection.name;
        step.connected = true;
      }
    });
  }
  //  openConnectionModal(step: any) {
  //   const dialogRef = this.dialog.open(ConnectionModalComponent, {
  //     width: '450px',
  //     data: {
  //       workflowId: this.workflowId,
  //       stepId: step.id,
  //       step: step,
  //       connector: step.selectedConnector || step.connector
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe((selectedConnection: any) => {
  //     if (selectedConnection) {
  //       // Add/update connection immutably
  //       const exists = step.connections?.some((c: any) => c.id === selectedConnection.id);
  //       step.connections = exists 
  //         ? step.connections.map((c:any) => c.id === selectedConnection.id ? selectedConnection : c)
  //         : [...(step.connections || []), selectedConnection];

  //       // Update step’s active connection
  //       step.connectionId = selectedConnection.id;
  //       step.connectionName = selectedConnection.name;
  //       step.connected = true;

  //       // 🔥 Force Angular to detect changes
  //       this.cdr.detectChanges();
  //     }
  //   });
  // }




  /** Helper to ensure we store internal mapping syntax in config */
  private cleanConfigValues(config: any): any {
    const cleaned: any = {};
    for (const key in config) {
      cleaned[key] = this.getActualValue(config[key]);
    }
    return cleaned;
  }
  //new code added for mapping
  loadConnections(connectorId: number) {
    this.connectionService.getConnections(connectorId).subscribe((res: any) => {
      this.connections = res;
    });
  }
  loadConnectionsForStep(step: any) {
    this.connectionService.getConnections(step.connectorId)
      .subscribe((res: any) => {
        step.connections = res;
      });
  }

  onToggleWorkflow(active: boolean) {

    const request = active
      ? this.workflowService.activateWorkflow(this.workflow.id)
      : this.workflowService.deactivateWorkflow(this.workflow.id);

    request.subscribe({
      next: () => {

        this.workflow.active = active;

        this.snackBar.open(
          active ? 'Workflow Activated Successfully'
            : 'Workflow Deactivated Successfully',
          'Close',
          {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          }
        );

      },
      error: () => {

        this.snackBar.open(
          'Failed to update workflow status',
          'Close',
          {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );

      }
    });
  }
  onConnectorSelected(step: any, connector: any) {
    step.connectorId = connector.id;
    step.connector = connector;

    // Load dropdown connections
    this.loadConnectionsForStep(step);
  }

  openConnectionSidebar(step: any) {

    if (!step.connectorId) {
      alert("Please select connector first");
      return;
    }

    // 🔥 ALWAYS LOAD FULL CONNECTOR
    this.connectorService.getConnector(step.connectorId)
      .subscribe((connector: any) => {

        const dialogRef = this.dialog.open(ConnectionModalComponent, {
          width: '350px',
          position: { right: '0' },
          disableClose: true,
          panelClass: 'right-sidebar',
          data: {
            connector: connector,   // ✅ FULL CONNECTOR
            workflowId: this.workflowId,
            step: step
          }
        });

        dialogRef.afterClosed().subscribe((selectedConnection: any) => {

          if (!selectedConnection) return;

          // const isConnectionChanged =
          //   step.connectionId && step.connectionId !== selectedConnection.id;
          const isConnectionChanged =
            !step.connectionId || step.connectionId !== selectedConnection.id;

          step.connectionId = selectedConnection.id;
          step.connectionName = selectedConnection.name;
          step.connected = true;

          if (isConnectionChanged) {
            this.resetStepFields(step);
          }

          this.loadFieldsAfterConnection(step);

        });

      });
  }
  private resetStepFields(step: any): void {
    step.config = {};
    step.staticFields = [];
    step.dynamicFields = [];
    step.fields = [];
    step.outputs = [];

    // clear dropdown loaders
    Object.keys(this.dropdownLoaders)
      .filter(k => k.startsWith(step.id + '_'))
      .forEach(k => delete this.dropdownLoaders[k]);
  }
  private loadFieldsAfterConnection(step: any): void {
    if (!step.connectionId) return;

    const loadStatic$ =
      step.type === 'trigger'
        ? this.connectorService.getTriggerFields(step.triggerId, this.workflowId,
          step.id)
        : this.connectorService.getActionFields(
          step.actionId,
          this.workflowId,
          step.id
        )

    loadStatic$.subscribe(fields => {
      step.staticFields = fields || [];
      step.dynamicFields = [];

      // 🔥 load dynamic fields AFTER static
      this.loadDynamicInputFields(step);

      // 🔁 restore saved inputs (optional)
      this.workflowService.getStepInputs(step.id).subscribe(inputs => {
        if (!Array.isArray(inputs)) return;

        inputs.forEach(inp => {
          const field = step.fields.find(
            (f: any) => f.key === inp.stepKey || f.id === inp.fieldId
          );
          if (field) {
            step.config[field.id] = inp.value;
            field.inputId = inp.id;
          }
        });
      });
    });
  }


private saveStep(step: any): void {
  if (!this.workflowId) return;

  const payload: any = {
    stepOrder: step.type === 'trigger' ? 1 : step.stepOrder,
    triggerId: step.type === 'trigger' ? step.triggerId : null,
    actionId: step.type === 'action' ? step.actionId : null,

  
    stepType: step.type.toUpperCase()
  };

  // ✅ CONDITION SUPPORT
  if (step.type === 'condition') {
    payload.conditionJson = JSON.stringify({
      left: step.config.left,
      operator: step.config.operator,
      right: step.config.right
    });

    payload.trueStepId = step.trueStep?.id || null;
    payload.falseStepId = step.falseStep?.id || null;
  }

  this.workflowService.addWorkflowStep(this.workflowId, payload)
    .subscribe({
      next: (res) => {
        if (!step.id && res?.id) step.id = res.id;
      },
      error: (err) => {
        console.error('Error saving step:', err);
      }
    });
}
  private refreshDependentDropdowns(
    step: any,
    changedFieldKey: string,
    loaderKey: string
  ): void {

    const refreshCall$ =
      step.type === 'trigger'
        ? this.workflowService.refreshTriggerDropdowns(step.id, changedFieldKey)
        : this.workflowService.refreshActionDropdowns(step.id, changedFieldKey);

    refreshCall$.subscribe({
      next: () => {

        const reloadFields$ =
          step.type === 'trigger'
            ? this.connectorService.getTriggerFields(
              step.triggerId,
              this.workflowId,
              step.id
            )
            : this.connectorService.getActionFields(
              step.actionId,
              this.workflowId,
              step.id
            );

        reloadFields$.subscribe(fields => {

          step.staticFields = fields || [];

          // rebuild dynamic fields
          this.loadDynamicInputFields(step, changedFieldKey);

          // stop loader AFTER rebuild starts
          this.dropdownLoaders[loaderKey] = false;

          // cleanup skip flags
          setTimeout(() => {
            this.getInputFields(step)
              .forEach((f: any) => delete f._skipRestore);
          });
        });
      },

      error: () => {
        this.dropdownLoaders[loaderKey] = false;
      }
    });
  }

  isDropdownLoading(step: any, field: any): boolean {
    return !!this.dropdownLoaders[`${step.id}_${field.key}`];
  }

  loadDynamicInputFields(step: any, changedFieldKey?: string): void {
    if (!step?.id) {
      step.dynamicFields = [];
      this.rebuildStepFields(step);
      return;
    }

    this.workflowService.getDynamicInputFields(step.id, changedFieldKey).subscribe({
      next: (fields: any[]) => {
        step.dynamicFields = (fields || []).map(f => ({
          id: f.fieldId || f.key,
          key: f.key,
          label: f.label || f.name || f.key,
          fieldType: 'input',
          fieldDataType: f.fieldDataType || 'string',
          refresh: !!f.refresh
        }));

        this.rebuildStepFields(step);

        // Re-apply saved inputs if any
        this.workflowService.getStepInputs(step.id).subscribe(inputs => {
          if (Array.isArray(inputs)) {
            inputs.forEach((inp: any) => {
              const field = step.fields.find((f: any) => f.id === inp.fieldId || f.key === inp.stepKey);
              if (field) {
                step.config[field.id] = inp.value;
                field.inputId = inp.id;
              }
            });
          }
        });
      },
      error: () => {
        step.dynamicFields = [];
        this.rebuildStepFields(step);
      }
    });
  }



  rebuildStepFields(step: any): void {
    step.fields = [
      ...(step.staticFields || []),
      ...(step.dynamicFields || [])
    ];
  }

  private clearDependentDynamicValues(step: any, changedFieldKey: string) {
    const fields = this.getInputFields(step);
    const changedIndex = fields.findIndex(f => f.key === changedFieldKey);

    if (changedIndex === -1) return;
    for (let i = changedIndex + 1; i < fields.length; i++) {
      const f = fields[i];
      step.config[f.id] = null;
      if (this.isDynamicDropdown(f)) {
        f.options = [];
      }
      f._skipRestore = true;
      delete f.inputId;
    }
  }
  saveStepInput(step: any, field: any, value: any) {
    const payload: any = {
      stepKey: field.key,   
      value: value
    };
    if (field.inputId) {
      payload.id = field.inputId;
    }

    this.workflowService
      .saveStepInput(step.id, payload)
      .subscribe((res: any) => {
        field.inputId = res.id;
        this.showSavedSnackbar();
      });
  }
  private showSavedSnackbar() {
    this.snackBar.open('✔ changes Saved', 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });

  }




  private blurTimers: Record<string, any> = {};
  onFieldFocus(step: any, field: any) {
    field._originalValue = step.config[field.id];
  }
  onFieldBlur(step: any, field: any) {
    const key = `${step.id}_${field.id}`;
    const newValue = step.config[field.id];
    const oldValue = field._originalValue;
    if (newValue === undefined || newValue === null || newValue === '') return;
    if (newValue === oldValue) return;
    clearTimeout(this.blurTimers[key]);
    this.blurTimers[key] = setTimeout(() => {
      this.saveStepInput(step, field, newValue);
    }, 600);
  }
  private loadForNewWorkflowWithSelection(state: any): void {

    this.connectorService.getAllConnectors().subscribe(conns => {

      const conditionConnector = {
        id: 'condition',
        name: 'Condition',
        logoUrl: 'https://cdn-icons-png.flaticon.com/512/2164/2164571.png',
        isCondition: true
      };
      this.connectors = [conditionConnector, ...(conns || [])];

      const triggerStepPayload = {

        triggerId: state.trigger.id,
        stepOrder: 1
      };

      this.workflowService
        .addWorkflowStep(this.workflowId, triggerStepPayload)
        .subscribe((triggerStep: any) => {

          const actionStepPayload = {
            actionId: state.action.id,
            stepOrder: 2
          };

          this.workflowService
            .addWorkflowStep(this.workflowId, actionStepPayload)
            .subscribe(() => {
              this.loadWorkflowAndPopulate();

            });

        });

    });
  }
 convertToConditionStep(step: any) {

  step.type = 'condition';

  step.connectorId = null;
  step.connectorName = 'Condition';

  step.selectedConnector = {
    name: 'Condition',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/2164/2164571.png'
  };

  step.connectionId = null;
  step.connectionName = null;
  step.connected = false;

  // ✅ Condition fields
  step.fields = [
    {
      id: 'left',
      label: 'Field',
      fieldType: 'input'
    },
    {
      id: 'operator',
      label: 'Operator',
      fieldType: 'input',
      options: [
        { label: 'Equals', value: '==' },
        { label: 'Not Equals', value: '!=' },
        { label: 'Greater Than', value: '>' },
        { label: 'Less Than', value: '<' }
      ]
    },
    {
      id: 'right',
      label: 'Value',
      fieldType: 'input'
    }
  ];

  // ✅ IMPORTANT: reset config
  step.config = {
    left: '',
    operator: '',
    right: ''
  };

  // ✅ Branch links (IMPORTANT for DB)
  step.trueStep = null;
  step.falseStep = null;

  // ✅ Mark explicitly (for backend)
  step.stepType = 'condition';
  this.saveStep(step);
}

 addBranchStep(parentStep: any, branch: 'true' | 'false') {

  const newStep = this.createActionStep();

  newStep.stepOrder = this.steps.length + 1;
  newStep.parentConditionId = parentStep.id;
  newStep.branchType = branch;

  if (branch === 'true') {
    parentStep.trueStep = newStep;
  } else {
    parentStep.falseStep = newStep;
  }

  this.steps.push(newStep);

  // ✅ save immediately
  this.saveStep(newStep);
}

}