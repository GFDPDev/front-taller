import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { CacheService } from './cache.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Res } from '../interfaces/response';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly CLIENTS_CACHE_KEY = 'active_clients';
  private readonly USERS_CACHE_KEY = 'active_users';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor(
    private mainService: MainService,
    private cacheService: CacheService
  ) {}

  getActiveClients(): Observable<Res> {
    const cached = this.cacheService.get(this.CLIENTS_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const request = this.mainService.getRequest({}, '/client/get_active_clients')
      .pipe(
        tap(() => {
          // Programar la siguiente invalidación
          setTimeout(() => this.invalidateClientsCache(), this.CACHE_DURATION);
        })
      );

    this.cacheService.set(this.CLIENTS_CACHE_KEY, request, this.CACHE_DURATION);
    return request;
  }

  getActiveUsers(): Observable<Res> {
    const cached = this.cacheService.get(this.USERS_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const request = this.mainService.getRequest({}, '/user/get_active_users')
      .pipe(
        tap(() => {
          setTimeout(() => this.invalidateUsersCache(), this.CACHE_DURATION);
        })
      );

    this.cacheService.set(this.USERS_CACHE_KEY, request, this.CACHE_DURATION);
    return request;
  }

  invalidateClientsCache(): void {
    this.cacheService.invalidate(this.CLIENTS_CACHE_KEY);
  }

  invalidateUsersCache(): void {
    this.cacheService.invalidate(this.USERS_CACHE_KEY);
  }
}