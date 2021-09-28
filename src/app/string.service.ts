import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StringService {

  URLString: any = null;

  constructor() {
    this.URLString = 'http://localhost:8844';
  }
}
