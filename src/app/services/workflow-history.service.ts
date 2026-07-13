import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment}  from './../../enviroment/enviroment.prod'

@Injectable({
  providedIn: 'root'
})
export class WorkflowHistoryService {

   //private apiUrl = "http://localhost:8081/api/history";
private apiUrl = `${environment.apiBase}/api/history`;
  constructor(private http: HttpClient) {}

  getWorkflowHistory(workflowId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/workflow/${workflowId}`);
  }

}