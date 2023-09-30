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
import { environment } from 'src/enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  private api = environment.apiURL;
  private httpHeaders: HttpHeaders;
  private httpFileHeaders: HttpHeaders;
  private token: string;
  constructor(private http: HttpClient) {
    this.token = sessionStorage.getItem('token') ?? 'No token available';

    this.httpHeaders = new HttpHeaders({
        'accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${this.token}`,
      })
      this.httpFileHeaders = new HttpHeaders({
        'accept': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      })
  }

  getRequest(params: any, route: String): Observable<Res> {
    return this.http.get<Res>(this.api + route, { params: params, headers: this.httpHeaders });
  }
  postRequest(params: any, route: String): Observable<Res> {
    return this.http.post<Res>(this.api + route, params, { headers: this.httpHeaders });
  }
  putRequest(params: any, route: String): Observable<Res> {
    return this.http.put<Res>(this.api + route, params, { headers: this.httpHeaders });
  }
  deleteRequest(params: any, route: String): Observable<Res> {
    return this.http.delete<Res>(this.api + route, { params: params, headers: this.httpHeaders });
  }
  uploadFile(params: any, route: String): Observable<Res> {
    return this.http.post<Res>(this.api + route, params, { headers: this.httpFileHeaders });
  }
  getFile(route: String): Observable<Blob> {
    return this.http.get<Blob>(this.api + route,  { responseType: 'blob' as 'json', headers: this.httpFileHeaders },);
  }
}
