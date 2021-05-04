/* eslint-disable no-underscore-dangle */
export class User {
  constructor(public id: string, public email: string, private _token: string, private expiresDate: Date)
  {}

  get token() {
    if (!this.expiresDate || this.expiresDate < new Date()){
      return null;
    }
    return this._token;
  }
}
