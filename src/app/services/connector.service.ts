import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { environment}  from './../../enviroment/enviroment.prod'
@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
   private baseUrl = 'http://localhost:8081/api';
  //private baseUrl = `${environment.apiBase}/api`;
  constructor(private http: HttpClient) {}
  getAllConnectors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/connectors`);
  }
  getTriggersByConnector(connectorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/connectors/${connectorId}/triggers`);
  }
  // getActionsByConnector(connectorId: number): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.baseUrl}/connectors/${connectorId}/actions`);
  // }
  getActionsByConnector(connectorId: number) {
  // if (!connectorId) {
  //   // console.error('❌ connectorId is null');
  //   return of([]);
  // }
  return this.http.get<any[]>(`${this.baseUrl}/connectors/${connectorId}/actions`);
}

 getTriggerFields(
  triggerId: number,
  workflowId?: number,
  stepId?: number
): Observable<any[]> {

  const params: any = {};

  if (workflowId !== undefined && workflowId !== null) {
    params.workflowId = workflowId;
  }

  if (stepId !== undefined && stepId !== null) {
    params.stepId = stepId;
  }

  return this.http.get<any[]>(
    `${this.baseUrl}/triggers/${triggerId}/fields`,
    { params }
  );
}

  // getActionFields(actionId: number, workflowId?: number): Observable<any[]> {
  //   const params: any = {};
  //   //console.log('workflowId =', workflowId);
  //   if (workflowId !== undefined && workflowId !== null) {
  //     params.workflowId = workflowId;
  //   }
  
  //   return this.http.get<any[]>(
  //     `${this.baseUrl}/actions/${actionId}/fields`,
  //     { params }
  //   );
  // }
  getActionFields(
  actionId: number,
  workflowId: number,
  stepId: number
): Observable<any[]> {

  const params: any = {
    workflowId,
    stepId
  };

  return this.http.get<any[]>(
    `${this.baseUrl}/actions/${actionId}/fields`,
    { params }
  );
}

  // getActionFields(actionId: number): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.baseUrl}/actions/${actionId}/fields`);
  // }
  
  getConnector(connectorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/connectors/${connectorId}`);
  }
}
