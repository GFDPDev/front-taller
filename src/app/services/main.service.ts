import { Injectable, NgZone } from '@angular/core';
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
import { SseService } from './sse.service';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  private api = environment.apiURL;
  private httpHeaders: HttpHeaders;
  private httpFileHeaders: HttpHeaders;
  private token: string;
  private eventSource!: EventSource;
  constructor(private http: HttpClient, private zone: NgZone, private sseService: SseService) {
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

  getServerEvent(route: string){
    return new Observable((observer)=>{
       this.eventSource = this.sseService.getEventSource(route);
      this.eventSource.onmessage = (event) => {
        this.zone.run(()=>{
          observer.next(event);
        })
      };
      this.eventSource.onerror = (error) => {
        observer.error();
        this.eventSource.close();
      };
    })
  }

  disconnectEventSource(): void {
    this.eventSource.close();
  }

  sendWhatsappMsg(params: any, route: string): Observable<any>{
    return this.http.post<any>(route, { params: params, headers:  new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json'
    }) });
  }
}
