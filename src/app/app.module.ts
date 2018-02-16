import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import 'rxjs/add/operator/toPromise';

import { ModalModule } from 'ngx-bootstrap/modal';

import { ReCaptchaModule } from 'angular2-recaptcha';

import { APIService } from './providers/api-service';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    ModalModule.forRoot(),
    ReCaptchaModule
  ],
  providers: [
    APIService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
