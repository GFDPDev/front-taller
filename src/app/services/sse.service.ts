import { Injectable } from '@angular/core';
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