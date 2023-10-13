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

export class SseService {
    private api = environment.apiURL;

    getEventSource(route: string): EventSource {
        return new EventSource(this.api + route);
    }
}