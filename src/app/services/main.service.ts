import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Res } from '../interfaces/response';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  private api = 'http://localhost:8000';
  private httpHeaders: HttpHeaders;
  private jwt: String | null;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'text/plain'
    })
  }
  constructor(private http: HttpClient) {
    this.jwt = sessionStorage.getItem('token');

    this.httpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.jwt}`,
      })
  }

  getRequest(params: any, route: String): Observable<Res> {
    return this.http.get<Res>(this.api + route, { params: params, headers: this.httpHeaders });
  }
  postRequest(params: any, route: String): Observable<Res> {
    return this.http.post<Res>(this.api + route, params, { headers: this.httpHeaders });
  }
  putRequest(params: any, route: String): Observable<Res> {
    return this.http.put<Res>(this.api + route, { params: params, headers: this.httpHeaders });
  }
  deleteRequest(params: any, route: String): Observable<Res> {
    return this.http.delete<Res>(this.api + route, { params: params, headers: this.httpHeaders });
  }
  requestOne(params:any, model: String): Observable<any>{
    return this.http.post<any>(this.api + "model" + model + '.php', params, this.httpOptions);
  }

  requestMany(params:any, model: String): Observable<any[]>{
    return this.http.post<any[]>(this.api + "model" + model + '.php', params, this.httpOptions);
  }
}
