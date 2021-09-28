import { StringService } from './../string.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuController, NavController, LoadingController, AlertController, ToastController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { SessionService } from '../session.service';
import * as onScan from 'onscan.js';

@Component({
  selector: 'app-security',
  templateUrl: './security.page.html',
  styleUrls: ['./security.page.scss'],
})
export class SecurityPage implements OnInit {

  Count: any = 0;
  Pass: any = "";
  Name: any = "";
  Position: any = "";
  ID: any = "";
  Profile_id: any = "";
  StartShift: any = "";
  step1: any = '';
  step2: any = '';
  step3: any = '';
  step4: any = '';
  Keyboard: any = [];
  KeyPress: any = true;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public menuCtrl: MenuController,
    public navCtrl: NavController,
    public http: HttpClient,
    public stringService: StringService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public storage: Storage,
    public sessionService: SessionService,
    public platform: Platform,
  ) {
    platform.ready().then(() => {
      (<HTMLElement>document.getElementById('security-div')).style.marginTop = (platform.height() - 700).toString() + "px";
    });
    this.menuCtrl.enable(false);
    this.Name = this.route.snapshot.paramMap.get('name');
    this.Position = this.route.snapshot.paramMap.get('position');
    this.ID = this.route.snapshot.paramMap.get('id');
    this.Profile_id = this.route.snapshot.paramMap.get('profile_id');
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    setTimeout(() => {
      onScan.attachTo(document, {
        onKeyDetect: function(iKeyCode, e) {
          this.Keyboard = [8, 13, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];
          if (this.Keyboard.includes(iKeyCode)) {
            (<HTMLInputElement>document.getElementById('passtext')).value = e.key;
          }
        }
      });
    }, 100);
  }

  numberClick(text) {
    this.step1 = document.getElementById('step1');
    this.step2 = document.getElementById('step2');
    this.step3 = document.getElementById('step3');
    this.step4 = document.getElementById('step4');
    this.Count++;
    this.Pass = this.Pass + (text).toString();
    if (this.Count == 1) {
      this.step1.classList.add("active");
    } else if (this.Count == 2) {
      this.step2.classList.add("active");
    } else if (this.Count == 3) {
      this.step3.classList.add("active");
    } else {
      this.step4.classList.add("active");
    }
  }

  async logInProfile() {
    this.KeyPress = false;
    this.sessionService.Loading('Accessing Cashier Profile...');
    this.StartShift = this.sessionService.LiveDate;
    this.http.post(this.stringService.URLString + '/profile_login', {
      id: this.ID,
      profileid: this.Profile_id,
      pin: this.Pass
    })
    .subscribe(res => {
      this.KeyPress = true;
      if (res == 1) {
        this.sessionService.Dismiss();
        this.sessionService.Toast('These credentials do not match our records.');
        this.step1.classList.remove("active");
        this.step2.classList.remove("active");
        this.step3.classList.remove("active");
        this.step4.classList.remove("active");
        this.Count = 0;
        this.Pass = "";
      } else if (res == 2) {
        this.sessionService.Dismiss();
        this.sessionService.Toast('Profile has been locked due to attempt login with wrong credentials, Please inform the owner with this problem.');
        this.step1.classList.remove("active");
        this.step2.classList.remove("active");
        this.step3.classList.remove("active");
        this.step4.classList.remove("active");
        this.Count = 0;
        this.Pass = "";
      } else {    
        onScan.detachFrom(document);
        this.storage.remove('Profile_name');
        this.storage.set('Profile_name', (this.Name).toLowerCase());
        setTimeout(() => {        
          this.sessionService.Dismiss();
          this.router.navigate(['/dashboard']);
          this.Count = 0;
          this.Pass = "";
        }, 1000);
      }
    }, err => {
      this.KeyPress = true;
      this.sessionService.Dismiss();
      if (err.status == 0) {
        this.sessionService.Alert('We have found that there something wrong on your network, Please check and try again.');
      } else {
        this.sessionService.Alert('Something went wrong, Please try again(err:' + err.status + ')');
      }
    });
  }

  eraseCode() {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const step4 = document.getElementById('step4');
    if (this.Count != 0) {
      if (this.Count == 4) {
        step4.classList.remove("active");
      } else if (this.Count == 3) {
        step3.classList.remove("active");
      } else if (this.Count == 2) {
        step2.classList.remove("active");
      } else {
        step1.classList.remove("active");
      }
      this.Count--;
      this.Pass = this.Pass.slice(0, this.Pass.length - 1);
    }
  }

  keyboardInput(e) {
    this.step1 = document.getElementById('step1');
    this.step2 = document.getElementById('step2');
    this.step3 = document.getElementById('step3');
    this.step4 = document.getElementById('step4');
    if (e.detail.value == "") {

    } else if (e.detail.value == "Enter") {
      this.logInProfile();
    } else if (e.detail.value == "Backspace") {
      if (this.Count != 0) {
        if (this.Count == 4) {
          this.step4.classList.remove("active");
        } else if (this.Count == 3) {
          this.step3.classList.remove("active");
        } else if (this.Count == 2) {
          this.step2.classList.remove("active");
        } else if (this.Count == 1) {
          this.step1.classList.remove("active");
        } else {
  
        }
        this.Count--;
        this.Pass = this.Pass.slice(0, this.Pass.length - 1);
      }
      (<HTMLInputElement>document.getElementById('passtext')).value = "";
    } else {
      if (this.Pass.length != 4) {
        this.Count++;
        this.Pass = this.Pass + (e.detail.value).toString();
        if (this.Count == 1) {
          this.step1.classList.add("active");
        } else if (this.Count == 2) {
          this.step2.classList.add("active");
        } else if (this.Count == 3) {
          this.step3.classList.add("active");
        } else if (this.Count == 4) {
          this.step4.classList.add("active");
        } else {
  
        }
      }
      (<HTMLInputElement>document.getElementById('passtext')).value = "";
    }
  }

  popOut() {
    onScan.detachFrom(document);
    this.navCtrl.navigateBack('/');
  }

  firstCapLet(string) {
    if (string != null) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }
}
