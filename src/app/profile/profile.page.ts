import { Storage } from '@ionic/storage';
import { StringService } from './../string.service';
import { Component, OnInit, HostListener } from '@angular/core';
import { MenuController, AlertController, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../session.service';
import * as onScan from 'onscan.js';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  Profiles: any = [];
  StoreID: any = "";
  ProfileLeft: any = 0;
  Slot: any = 0;
  Alerta: any = "";
  SuperAdmin: any = false;

  constructor(
    public menuCtrl: MenuController,
    public alertCtrl: AlertController,
    public http: HttpClient,
    public stringService: StringService,
    public storage: Storage,
    public router: Router,
    public route: ActivatedRoute,
    public sessionService: SessionService,
    public navCtrl: NavController,
  ) {
    this.menuCtrl.enable(false);
  }

  ngOnInit() {
    setTimeout(() => {
      this.loadProfiles();
    }, 500);
  }

  ionViewWillEnter() {
    setTimeout(() => {
      onScan.attachTo(document, {
        onKeyDetect: function(iKeyCode) {
          this.Keyboard = [112];
          if (this.Keyboard.includes(iKeyCode)) {
            (<HTMLInputElement>document.getElementById('actionkey')).value = iKeyCode;
          }
        }
      });
    }, 100);
  }

  loadProfiles() {
    this.sessionService.Loading('Loading Cashier Profiles...');
    this.http.post(this.stringService.URLString + '/load_profiles', {})
    .subscribe(res => {
      this.sessionService.Dismiss();
      if (res != 0) {
        this.Profiles = res;
        this.storage.set('profiles', this.Profiles);
      }
    }, err => {
      this.sessionService.Dismiss();
      if (err.status == 0) {
        this.sessionService.Alert('We have found that there something wrong on your network, Please check and try again.');
      } else {
        this.sessionService.Alert('Something went wrong, Please try again(err:' + err.status + ')');
      }
    });
  }

  selectProfile(id, name) {
    onScan.detachFrom(document);
    this.router.navigate(['/security', {profile_id: id, name: name}])
  }

  firstCapLet(string) {
    if (string != null) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }

  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(evt: KeyboardEvent) {
    if (this.router.url == '/') {
      let element: HTMLElement = document.getElementsByClassName('alert-button-role-okprofile')[0] as HTMLElement;
      element.click();
    }
  }
}
