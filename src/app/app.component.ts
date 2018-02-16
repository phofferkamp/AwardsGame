import { Component, ViewChild } from '@angular/core';
import {Subject} from 'rxjs/Subject';
import "rxjs/add/operator/debounceTime";

import { ModalDirective } from 'ngx-bootstrap/modal';
import { PopoverDirective } from 'ngx-bootstrap/popover';

import { APIService } from './providers/api-service';
import * as io from "socket.io-client";

declare const CONFIG: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private usernameSubject: Subject<string> = new Subject();
  private emailSubject: Subject<string> = new Subject();

  @ViewChild('loginModal') public loginModal: ModalDirective;
  @ViewChild('loginForm') public loginForm: any;
  @ViewChild('createAccountModal') public createAccountModal: ModalDirective;
  @ViewChild('createUsernameValidation') public createUsernameValidation: any;
  @ViewChild('createEmailValidation') public createEmailValidation: any;
  @ViewChild('captchaRef') public captchaRef: any;
  @ViewChild('forgotModal') public forgotModal: ModalDirective;
  @ViewChild('forgotCaptchaRef') public forgotCaptchaRef: any;
  @ViewChild('forgotSubmittedModal') public forgotSubmittedModal: ModalDirective;
  @ViewChild('forgotConfirmedModal') public forgotConfirmedModal: ModalDirective;
  @ViewChild('changePasswordModal') public changePasswordModal: ModalDirective;
  @ViewChild('passwordChangedModal') public passwordChangedModal: ModalDirective;
  @ViewChild('errorModal') public errorModal: ModalDirective;
  @ViewChild('helpModal') public helpModal: ModalDirective;
  @ViewChild('helpCaptchaRef') public helpCaptchaRef: any;
  @ViewChild('helpConfirmedModal') public helpConfirmedModal: ModalDirective;
  @ViewChild('feedbackModal') public feedbackModal: ModalDirective;
  @ViewChild('feedbackCaptchaRef') public feedbackCaptchaRef: any;
  @ViewChild('feedbackConfirmedModal') public feedbackConfirmedModal: ModalDirective;
  @ViewChild('leaderboardModal') public leaderboardModal: ModalDirective;

  config = {
    gameMode: "",
    gameStart: null
  };

  loading = 0;
  
  nextModal: any;
  
  siteKey = CONFIG.RECAPTCHA_KEY;
  
  loginName: string;
  loginPassword: string;
  
  createUsername: string;
  createEmail: string;
  createPassword: string;
  confirmPassword: string;
  usernameExists = false;
  emailExists = false;
  
  createUserSubmitted = false;
  
  invalidCreateUser = false;
  
  forgotEmail: string;
  forgotSubmitted = false;
  invalidForgot = false;
  
  invalidLogin = false;
  
  passwordChangeTo: string;
  confirmPasswordChangeTo: string;
  
  changePasswordSubmitted = false;
  
  helpSubmitted = false;
  helpText: string;
  invalidHelp = false;
  
  feedbackSubmitted = false;
  feedbackText: string;
  invalidFeedback = false;
  
  countdown: string;
  
  user: any;
  categories: any;
  picks: any;
  
  savedFooter = 0;
  saveErrorFooter = 0;
  
  total: number;
  
  games: any;
  highScore: number;
  
  timeZones = [
    { zone: "PT", offset: -8 },
    { zone: "MT", offset: -7 },
    { zone: "CT", offset: -6 },
    { zone: "ET", offset: -5 }
  ];
  gameStart: string;

  constructor(private apiService: APIService) {}
  
  ngOnInit() {
    this.usernameSubject.debounceTime(500).subscribe(username => {
      this.handleUsername(username);
    });
    
    this.emailSubject.debounceTime(500).subscribe(email => {
      this.handleEmail(email);
    });
  
    this.user = {};
    this.categories = [];
  }
  
  hideModal(modal, nextModal) {
    this.nextModal = nextModal;
    modal.hide();
  }
    
  onModalHide() {
    if (this.nextModal) {
      this.nextModal.show();
    }
    
    this.nextModal = null;
  }
  
  ngAfterViewInit() {
    let query = document.location.hash.substring(1);
    
    document.location.hash = '';

    let params = {};
    let parts = query.split(/&/);
    for (let part of parts) {
      let t = part.split(/=/);
      params[decodeURIComponent(t[0])] = decodeURIComponent(t[1]);
    }

    let passwordResetHash = params['r'];
    
    if(passwordResetHash) {
      this.apiService.resetPasswordConfirm(passwordResetHash)
        .catch(() => {});
      this.forgotConfirmedModal.show();
    } else {
      this.showLogin();
    }
  }
  
  showLogin() {
    this.loginModal.show();
  }

  login() {
    if (this.loginForm.valid) {
      this.apiService.getUser(this.loginName, this.loginPassword)
        .then(user => {
          this.invalidLogin = false;
          
          this.user = user;
          
          let socketIoPort = location.protocol === 'http:' ? CONFIG.SOCKETIO_PORT_HTTP : CONFIG.SOCKETIO_PORT_HTTPS;
          let socket = io(CONFIG.API_URL + ':' + socketIoPort);
          socket.on('gg-update', function () {
            this.getConfig();
          }.bind(this));

          this.loginModal.hide();
          
          this.getConfig();
        })
      .catch(error => {
        this.invalidLogin = true;
      });
    }
  }

  usernameChange(username) {
    this.usernameExists = false;
    this.usernameSubject.next(username);
  }
  
  handleUsername(username) {
    if (this.createUsernameValidation.valid) {
      this.apiService.checkUser(username)
        .then(user => {
          this.usernameExists = user ? true : false;
        });
    }
  }
  
  emailChange(email) {
    this.emailExists = false;
    this.emailSubject.next(email);
  }
  
  handleEmail(email) {
    if (this.createEmailValidation.valid) {
      this.apiService.checkEmail(email)
        .then(user => {
          this.emailExists = user ? true : false;
        });
    }
  }

  createAccount(token) {
    this.createUserSubmitted = true;

    let newUser = {
      name: this.createUsername,
      password: this.createPassword,
      email: this.createEmail.toLowerCase()
    };

    this.apiService.recaptchaVerify(token)
      .then(response => {
        this.captchaRef.reset();
    
        if (response.success) {
          this.apiService.addUser(newUser)
            .then(user => {
              if (user) {
                this.invalidCreateUser = false;
                
                this.user = user;
                
                this.createAccountModal.hide();
                
                this.getConfig();
              } else {
                this.invalidCreateUser = true;
                
              }
            });
        } else {
          this.invalidCreateUser = true;

          this.createUserSubmitted = false;
        }
      });
  }
  
  submitForgot(token) {
    this.forgotSubmitted = true;
    
    this.apiService.recaptchaVerify(token)
      .then(response => {
        this.forgotCaptchaRef.reset();
          
        this.forgotSubmitted = false;
          
        if (response.success) {
          this.forgotModal.hide();
          
          this.invalidForgot = false;
          
          this.forgotSubmittedModal.show();
          
          this.apiService.resetPasswordRequest(this.forgotEmail)
            .catch(() => {});
        } else {
          this.invalidForgot = true;
        }
      });
  }
  
  submitHelp(token) {
    this.helpSubmitted = true;
    
    this.apiService.recaptchaVerify(token)
      .then(response => {
        this.helpCaptchaRef.reset();
              
        if (response.success) {
    
          let help = { "helpText": this.helpText };
      
          this.apiService.sendHelp(this.user, help)
            .then(() => {
              this.helpModal.hide();
              
              this.invalidHelp = this.helpSubmitted = false;
              
              this.helpText = "";
              
              this.helpConfirmedModal.show();
            });
        } else {
          this.invalidHelp = true;

          this.helpSubmitted = false;
        }
      });
  }
  
  submitFeedback(token) {
    this.feedbackSubmitted = true;
    
    this.apiService.recaptchaVerify(token)
      .then(response => {
        this.feedbackCaptchaRef.reset();
              
        if (response.success) {
          let feedback = {
            name: this.user.name,
            email: this.user.email,
            date: new Date(),
            app: "gg",
            feedback: this.feedbackText
          };
          
          this.apiService.sendFeedback(feedback)
            .then(() => {
              this.feedbackModal.hide();
              
              this.invalidFeedback = this.feedbackSubmitted = false;
              
              this.feedbackText = "";
              
              this.feedbackConfirmedModal.show();
            });
        } else {
          this.invalidFeedback = true;

          this.helpSubmitted = false;
        }
      });
  }
  
  changePassword() {
    this.changePasswordSubmitted = true;
    
    this.user.password = this.passwordChangeTo;
    
    let user = {
      password: this.user.password
    };
    
    this.apiService.saveUser(this.user._id, user)
      .then(() => {
        this.changePasswordModal.hide();
        
        this.changePasswordSubmitted = false;
    
        this.passwordChangeTo = this.confirmPasswordChangeTo = "";
        
        this.passwordChangedModal.show();
      });
  }

  getConfig() {
    this.loading++;
    this.apiService.getConfig()
      .then(config => {
        this.config = config;
        
        if (config.gameStart) {
          let gameStartDate = new Date(config.gameStart);
          let timeZone = this.timeZones.find(timeZone => {
            return timeZone.offset === - gameStartDate.getTimezoneOffset() / 60;
          });
          this.gameStart = gameStartDate.toDateString() + " at " + gameStartDate.toLocaleTimeString() + " " + timeZone.zone;
        }
        
        this.apiService.getCategories()
          .then(categories => {
            this.categories = categories;
            
            this.loading++;
            this.apiService.getGame(this.user)
              .then(game => {
                if (game) {
                  this.picks = game.picks;

                  for (let category of this.categories) {
                    category.nomineeSelected = this.picks[category._id];
                  }
                  
                  this.loading--;
                } else {
                  this.loading--;
                }
              });

            if (this.config.gameMode === "during" || this.config.gameMode === "after") {
              this.total = 0;
              
              for (let category of this.categories) {
                if (category.winner > -1) {
                  this.total++;
                }
              }
              
              this.apiService.getGames()
                .then(games => {
                  this.highScore = 0;
                  
                  this.games = games.sort((a, b) => {
                    if (a.score == undefined) {
                      a.score = 0;
                    }
                    if (b.score == undefined) {
                      b.score = 0;
                    }
                    
                    if (a.score > this.highScore) {
                      this.highScore = a.score;
                    }
                    if (b.score > this.highScore) {
                      this.highScore = b.score;
                    }
          
                    return b.score - a.score;
                  });
                });
            } else {
              this.updateCountdown();
              
              setInterval(() => this.updateCountdown(), 1000);
            }
            
            this.loading--;
          })
          .catch(error => {
            this.invalidLogin = true;
            
            this.loading--;
          });
      });
  }
  
  updateCountdown() {
    let distance = new Date(this.config.gameStart).getTime() - new Date().getTime();

    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    this.countdown = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
  }

  save(category, nomineeIndex) {
    if (this.config.gameMode === "before") {
    
    this.loading++;
    
    this.apiService.savePick(this.user, category, nomineeIndex)
      .then(game => {
        this.loading--;
        
        this.savedFooter++;
        
        category.nomineeSelected = nomineeIndex;
        this.picks = game.picks;
        
        setTimeout(() => {  
            this.savedFooter--;
          }, 2000);
      })
      .catch(error => {
        this.loading--;
        
        if (error.status == 403) {
          this.errorModal.show();
        } else {
          this.saveErrorFooter++;
          
          setTimeout(() => {  
            this.saveErrorFooter--;
          }, 2000);
        }
      });
    }
  }
  
  reloadPage() {
    location.reload();
  }

  logOut() {
    this.user = {};
    this.categories = [];
    this.showLogin();
  }
}
