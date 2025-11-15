import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loading$ = new BehaviorSubject<boolean>(false);

  setLoading(state: boolean) {
    this.loading$.next(state);
  }

  get loadingState$() {
    return this.loading$.asObservable();
  }
}
