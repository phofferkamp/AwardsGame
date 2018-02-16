import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

declare const CONFIG: any;

@Injectable()
export class APIService {
  constructor(public http: Http) {
  }

  private get headerOptions() {
    let headers = new Headers({
      'token': CONFIG.API_USERNAME,
    });
    return new RequestOptions({ headers: headers });
  }
    
  private isEmail(text) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(text);
  }

  getCategories(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(CONFIG.API_URL + CONFIG.GAME_ROUTE + '/category', this.headerOptions)
        .map(res => res.json())
        .subscribe(res => resolve(res)
        , (err) => reject(err)
        );
    });
  }

  getUser(loginName: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let apiFunction = this.isEmail(loginName) ? 'email' : 'name';

      this.http.get(CONFIG.API_URL + CONFIG.GAME_ROUTE + '/user/' + apiFunction + '/' + encodeURIComponent(loginName) + '/' + encodeURIComponent(password), this.headerOptions)
        .map(res => res.json())
        .subscribe(res => resolve(res)
        , (err) => reject(err)
        );
    });
  }
  
  checkUser(username: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(CONFIG.API_URL + CONFIG.GAME_ROUTE + '/user/name/' + encodeURIComponent(username), this.headerOptions)
        .map(res => res.json())
        .subscribe(res => resolve(res)
        , (err) => reject(err)
        );
    });
  }
  
  checkEmail(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(CONFIG.API_URL + CONFIG.GAME_ROUTE + '/user/email/' + encodeURIComponent(email), this.headerOptions)
        .map(res => res.json())
        .subscribe(res => resolve(res)
        , (err) => reject(err)
        );
    });
  }
  
  addUser(user: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(CONFIG.API_URL + CONFIG.GAME_ROUTE + '/user', user, this.headerOptions)
        .map(res => res.json())
        .subscribe(res => resolve(res)
        , (err) => reject(err)
        );
    });
  }
  
  resetPasswordRequest(email: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(CONFIG.API_URL + CONFIG.GAME_ROUTE + '/user/email/' + encodeURIComponent(email), null, this.headerOptions)
        .map(res => res.json())
        .subscribe(res => resolve(res)
        , (err) => reject(err)
        );
    });
  }
  
  recaptchaVerify(token: string): Promise<any> {
    let body = {
      response: token
    }

    return new Promise((resolve, reject) => {
      this.http.post(CONFIG.API_URL + '/recaptcha', body, this.headerOptions)
        .map(res => res.json())
        .subscribe(res => resolve(res)
        , (err) => reject(err)
        );
    });
  }
  
  resetPasswordConfirm(hash: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(CONFIG.API_URL + CONFIG.GAME_ROUTE + '/user/hash/' + encodeURIComponent(hash), null, this.headerOptions)
        .map(res => res.json())
        .subscribe(res => resolve(res)
        , (err) => reject(err)
        );
    });
  }
  
  saveUser(id: string, user: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.put(CONFIG.API_URL + CONFIG.GAME_ROUTE + '/user/' + id, user, this.headerOptions)
        .map(res => res.json())
        .subscribe(res => resolve(res)
        , (err) => reject(err)
        );
    });
  }

  savePick(user: any, category: any, pick: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(CONFIG.API_URL + CONFIG.GAME_ROUTE + '/game/' + user.name + '/pick/' + category._id + '/' + pick, null, this.headerOptions)
        .map(res => res.json())
        .subscribe(res => resolve(res)
        , (err) => reject(err)
        );
    });
  }

  getGames(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(CONFIG.API_URL + CONFIG.GAME_ROUTE + '/game', this.headerOptions)
        .map(res => res.json())
        .subscribe(res => resolve(res)
        , (err) => reject(err)
        );
    });
  }

  getGame(user: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(CONFIG.API_URL + CONFIG.GAME_ROUTE + '/game/' + user.name, this.headerOptions)
        .map(res => res.json())
        .subscribe(res => resolve(res)
        , (err) => reject(err)
        );
    });
  }
  
  sendHelp(user: any, help: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(CONFIG.API_URL + CONFIG.GAME_ROUTE + '/help/' + encodeURIComponent(user.email), help, this.headerOptions)
        .map(res => res.json())
        .subscribe(res => resolve(res)
        , (err) => reject(err)
        );
    });
  }
  
  sendFeedback(feedback: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(CONFIG.API_URL + CONFIG.GAME_ROUTE + '/feedback', feedback, this.headerOptions)
        .map(res => res.json())
        .subscribe(res => resolve(res)
        , (err) => reject(err)
        );
    });
  }
  
  getConfig(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(CONFIG.API_URL + CONFIG.GAME_ROUTE + '/config', this.headerOptions)
        .map(res => res.json())
        .subscribe(res => resolve(res)
        , (err) => reject(err)
        );
    });
  }
}