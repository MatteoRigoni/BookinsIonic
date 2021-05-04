/* eslint-disable @typescript-eslint/semi */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable object-shorthand */
/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from './user.model';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _user = new BehaviorSubject<User>(null);

  get userLoggedIn() {
    return this._user.asObservable().pipe(
      take(1),
      map((user) => {
        console.log(user);
        if (user) {
          return !!user.token;
        } else {
          return false;
        }
      })
    );
  }

  constructor(private httpClient: HttpClient) {}

  getUserId() {
    return this._user.asObservable().pipe(
      take(1),
      map((user) => {
        if (user) {
          return user.id;
        } else {
          return null;
        }
      })
    );
  }

  login(email: string, password: string) {
    return this.httpClient.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseApiKey}`,
      { email: email, password: password, returnSecureToken: true }
    ).pipe(tap(userData => {
      this.setUserData(userData);
    }))
  }

  logout() {
    this._user.next(null);
  }

  signup(email: string, password: string) {
    return this.httpClient.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseApiKey}`,
      { email: email, password: password, returnSecureToken: true }
    ).pipe(tap(userData => {
      this.setUserData(userData);
    }))
  }

  private setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(new Date().getTime() + (+userData.expiresIn * 1000));
    this._user.next(new User(userData.localId, userData.email, userData.idToken, expirationTime));
  }
}
