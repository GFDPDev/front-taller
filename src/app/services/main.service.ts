import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  private api = 'http://192.168.50.200:8080/api-taller-2/';
  //private api = 'http://localhost/api-taller-2/';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'text/plain'
    })
  };
  constructor(private http: HttpClient) {

  }

  requestOne(params:any, model: String): Observable<any>{
    return this.http.post<any>(this.api + "model" + model + '.php', params, this.httpOptions);
  }

  requestMany(params:any, model: String): Observable<any[]>{
    return this.http.post<any[]>(this.api + "model" + model + '.php', params, this.httpOptions);
  }
}
