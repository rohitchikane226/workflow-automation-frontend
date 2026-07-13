import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment}  from './../../enviroment/enviroment.prod'
@Injectable({ providedIn: 'root' })
export class ConnectionService {

  //private API = 'http://localhost:8081/api';
  private API =`${environment.apiBase}/api`;

  constructor(private http: HttpClient) {}

  createConnection(connectorId: number, payload: any) {
    return this.http.post(`${this.API}/connections/${connectorId}`, payload);
  }

  updateConnection(id: number, payload: any) {
    return this.http.put(`${this.API}/connections/${id}`, payload);
  }

  deleteConnection(id: number) {
    return this.http.delete(`${this.API}/connections/${id}`);
  }

  getConnections(connectorId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/connections/connector/${connectorId}`
    );
  }

  // startOAuth(connectionId: number, redirectUri: string) {
  //   return this.http.get(
  //     `${this.API}/oauth/authorize/${connectionId}?redirect_uri=${redirectUri}`
  //   );
  // }
  startOAuth(
  connectionId: number,
  workflowId: number,
  stepId: number
) {
  const redirectUri = `http://localhost:4200/builder/${workflowId}`;

  return this.http.get(
    `${this.API}/oauth/authorize/${connectionId}`,
    {
      params: {
        workflowId: workflowId.toString(),
        stepId: stepId.toString(),
        redirect_uri: redirectUri
      }
    }
  );
}

  createEmptyConnection(connectorId: number){
    console.log("createEmptyConnection connectorId  ",connectorId)
    return this.http.post(`${this.API}/oauth/create-empty/${connectorId}`,{});
  }
  getStepConnection(workflowId: number, stepId: number) {
    return this.http.get(`${this.API}/workflows/${workflowId}/steps/${stepId}/connection`);
  }

  // Update the connection for a step
  updateStepConnection(workflowId: number, stepId: number, connectionId: number) {
    return this.http.put(`${this.API}/workflows/${workflowId}/steps/${stepId}/connection`, { id: connectionId });
  }

  // Remove connection from a step
  deleteStepConnection(workflowId: number, stepId: number) {
    return this.http.delete(`${this.API}/workflows/${workflowId}/steps/${stepId}/connection`);
  }
  addStepConnection(workflowId: number, stepId: number, connectionId: number) {
    return this.http.post(
      `${this.API}/workflows/${workflowId}/steps/${stepId}/connection`,
      { id: connectionId }
    );
  }
  getAllConnections(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/connections`);
  }
}
