import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  private baseUrl = 'http://localhost:8080/api/workflows';

  constructor(private http: HttpClient) { }

  getAllWorkflows(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getWorkflowById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/builder/${id}`);
  }
  createWorkflow(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  updateWorkflow(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  /** 🔹 Steps APIs */
  // getWorkflowSteps(workflowId: number): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.baseUrl}/${workflowId}/steps`);
  // }

  // addWorkflowStep(workflowId: number, step: any): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/${workflowId}/steps`, step);
  // }

  // updateWorkflowStep(workflowId: number, stepId: number, step: any): Observable<any> {
  //   return this.http.put(`${this.baseUrl}/${workflowId}/steps/${stepId}`, step);
  // }

  // deleteWorkflowStep(workflowId: number, stepId: number): Observable<any> {
  //   return this.http.delete(`${this.baseUrl}/${workflowId}/steps/${stepId}`);
  // }
  // steps logic
  getWorkflowSteps(workflowId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${workflowId}/steps`);
  }

  addWorkflowStep(workflowId: number, step: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${workflowId}/steps`, step);
  }

  updateWorkflowStep(workflowId: number, stepId: number, step: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${workflowId}/steps/${stepId}`, step);
  }

  deleteWorkflowStep(workflowId: number, stepId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${workflowId}/steps/${stepId}`);
  }

  getStepsByWorkflowId(workflowId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/workflows/${workflowId}/steps`);
  }
  getStepOutputs(stepId: number) {
    return this.http.get<any[]>(`http://localhost:8080/api/workflow-steps/${stepId}/outputs`);
  }

  saveStepInput(stepId: number, input: any) {

    const newBody: any = {};

    Object.keys(input).forEach(key => {
      const val = input[key];
      if (val !== null && val !== undefined && val !== '') {
        newBody[key] = val;
      }
    });
    return this.http.post(
      `http://localhost:8080/api/workflow-steps/${stepId}/inputs`,
      newBody
    );
  }


  updateStepInput(stepId: number, inputId: number, input: any) {
    console.log("inputId,", inputId);
    return this.http.put(`http://localhost:8080/api/workflow-steps/${stepId}/inputs/${inputId}`, input);
  }

  getStepInputs(stepId: number) {
    return this.http.get<any[]>(`http://localhost:8080/api/workflow-steps/${stepId}/inputs`);
  }
  // getStepOutputs(stepId: number): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.baseUrl}/workflow-steps/${stepId}/outputs`);
  // }
  addStepInput(stepId: number, input: any) {
    return this.http.post<any>(`http://localhost:8080/api/workflow-steps/${stepId}/inputs`, input);
  }
  saveOrUpdateStepInput(stepId: number, input: any): Observable<any> {
    if (input.id) {
      // UPDATE existing input
      return this.http.put(
        `http://localhost:8080/api/workflow-steps/${stepId}/inputs/${input.id}`,
        input
      );
    }

    // INSERT new input
    return this.http.post(
      `http://localhost:8080/api/workflow-steps/${stepId}/inputs`,
      input
    );
  }
  /**
 * 🔁 Refresh dependent dynamic dropdown fields
 */
refreshDependentDropdowns(
  stepId: number,
  changedFieldKey: string
): Observable<any[]> {

  return this.http.post<any[]>(
    'http://localhost:8080/api/actions/refresh-dependent-dropdowns',
    {
      stepId,
      fieldKey: changedFieldKey
    }
  );
}
refreshTriggerDropdowns(stepId: number, fieldKey: string) {
  return this.http.post(`http://localhost:8080/api/triggers/refresh-dependent-dropdowns`, {
    stepId,
    fieldKey: fieldKey
  });
}

refreshActionDropdowns(stepId: number, fieldKey: string) {
  return this.http.post(`http://localhost:8080/api/actions/refresh-dependent-dropdowns`, {
    stepId,
    fieldKey: fieldKey
  });
}


testTriggerStep(stepId: number){
  return this.http.post(
    `http://localhost:8080/api/workflows/steps/${stepId}/test-trigger`,
    {}
  );
}
getDynamicInputFields(stepId: number, changedFieldKey?: string) {
  const params = changedFieldKey
    ? { params: { changedFieldKey } }
    : {};

  return this.http.post<any[]>(
    `http://localhost:8080/api/actions/steps/${stepId}/refresh-dynamic-fields`,
    {},
    params
  );
}

activateWorkflow(workflowId: number) {
  return this.http.put(
    `${this.baseUrl}/${workflowId}/activate`,
    {},
    { responseType: 'text' } 
  );
}

deactivateWorkflow(workflowId: number) {
  return this.http.put(
    `${this.baseUrl}/${workflowId}/deactivate`,
    {},
    { responseType: 'text' }   
  );
}

}
