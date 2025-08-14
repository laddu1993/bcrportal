import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  private isMainLoadingSubject = new BehaviorSubject<boolean>(false);
  isMainLoading$ = this.isMainLoadingSubject.asObservable();

  show(): void {
    this.isLoadingSubject.next(true);
  }

  hide(): void {
    this.isLoadingSubject.next(false);
  }

  // showMain(): void {
  //   this.isMainLoadingSubject.next(true);
  // }

  // hideMain(): void {
  //   this.isMainLoadingSubject.next(false);
  // }

  constructor() { }
}
