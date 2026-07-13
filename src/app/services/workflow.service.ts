import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment}  from './../../enviroment/enviroment.prod'

@Injectable({ providedIn: 'root' })
export class WorkflowService {
   //private baseUrl = 'http://localhost:8081/api/workflows';
private baseUrl = `${environment.apiBase}/api/workflows`;
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
     var url=this.baseUrl
     var newUrl=url.replace("/api/workflows","")
    return this.http.get<any[]>(`${newUrl}/api/workflow-steps/${stepId}/outputs`);
  }

  saveStepInput(stepId: number, input: any) {
 var url=this.baseUrl
     var newUrl=url.replace("/api/workflows","")
    const newBody: any = {};

    Object.keys(input).forEach(key => {
      const val = input[key];
      if (val !== null && val !== undefined && val !== '') {
        newBody[key] = val;
      }
    });
    return this.http.post(
      `${newUrl}/api/workflow-steps/${stepId}/inputs`,
      newBody
    );
  }


  updateStepInput(stepId: number, inputId: number, input: any) {
     var url=this.baseUrl
     var newUrl=url.replace("/api/workflows","")
    console.log("inputId,", inputId);
    return this.http.put(`${newUrl}/api/workflow-steps/${stepId}/inputs/${inputId}`, input);
  }

  getStepInputs(stepId: number) {
     var url=this.baseUrl
     var newUrl=url.replace("/api/workflows","")
    return this.http.get<any[]>(`${newUrl}/api/workflow-steps/${stepId}/inputs`);
  }
  // getStepOutputs(stepId: number): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.baseUrl}/workflow-steps/${stepId}/outputs`);
  // }
  addStepInput(stepId: number, input: any) {
     var url=this.baseUrl
     var newUrl=url.replace("/api/workflows","")
    return this.http.post<any>(`${newUrl}/api/workflow-steps/${stepId}/inputs`, input);
  }
  saveOrUpdateStepInput(stepId: number, input: any): Observable<any> {
      var url=this.baseUrl
     var newUrl=url.replace("/api/workflows","")
    if (input.id) {
      // UPDATE existing input
    
      return this.http.put(
        `${newUrl}/api/workflow-steps/${stepId}/inputs/${input.id}`,
        input
      );
    }

    // INSERT new input
    return this.http.post(
      `${newUrl}/api/workflow-steps/${stepId}/inputs`,
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
  var url=this.baseUrl
     var newUrl=url.replace("/api/workflows","")
  return this.http.post<any[]>(
    `${newUrl}/api/actions/refresh-dependent-dropdowns`,
    {
      stepId,
      fieldKey: changedFieldKey
    }
  );
}
refreshTriggerDropdowns(stepId: number, fieldKey: string) {
   var url=this.baseUrl
     var newUrl=url.replace("/api/workflows","")
  return this.http.post(`${newUrl}/api/triggers/refresh-dependent-dropdowns`, {
    stepId,
    fieldKey: fieldKey
  });
}

refreshActionDropdowns(stepId: number, fieldKey: string) {
     var url=this.baseUrl
     var newUrl=url.replace("/api/workflows","")
  return this.http.post(`${newUrl}/api/actions/refresh-dependent-dropdowns`, {
    stepId,
    fieldKey: fieldKey
  });
}


testTriggerStep(stepId: number){
  return this.http.post(
    `${this.baseUrl}/steps/${stepId}/test-trigger`,
    {}
  );
}
getDynamicInputFields(stepId: number, changedFieldKey?: string) {
  const params = changedFieldKey
    ? { params: { changedFieldKey } }
    : {};
   var url=this.baseUrl
     var newUrl=url.replace("/api/workflows","")
  return this.http.post<any[]>(
    `${newUrl}/api/actions/steps/${stepId}/refresh-dynamic-fields`,
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
