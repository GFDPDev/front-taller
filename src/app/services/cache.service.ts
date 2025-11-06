import { Injectable } from '@angular/core';
import { Observable, Subject, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache: { [key: string]: Observable<any> } = {};
  private invalidationSubjects: { [key: string]: Subject<void> } = {};

  get(key: string): Observable<any> | null {
    return this.cache[key] || null;
  }

  set(key: string, value: Observable<any>, maxAge: number = 5 * 60 * 1000): void {
    // Crear un Subject para la invalidación si no existe
    if (!this.invalidationSubjects[key]) {
      this.invalidationSubjects[key] = new Subject<void>();
    }

    // Almacenar el observable con shareReplay
    this.cache[key] = value.pipe(
      shareReplay(1)
    );

    // Configurar la invalidación automática después de maxAge
    setTimeout(() => {
      this.invalidate(key);
    }, maxAge);
  }

  invalidate(key: string): void {
    if (this.invalidationSubjects[key]) {
      this.invalidationSubjects[key].next();
      delete this.cache[key];
      delete this.invalidationSubjects[key];
    }
  }

  clear(): void {
    Object.keys(this.invalidationSubjects).forEach(key => {
      this.invalidate(key);
    });
    this.cache = {};
  }
}