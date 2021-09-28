import { Component } from '@angular/core';

import { Platform, NavController, MenuController, LoadingController } from '@ionic/angular';

import { Storage } from '@ionic/storage';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from './session.service';
import { HttpClient } from '@angular/common/http';
import { AndroidFullScreen } from '@ionic-native/android-full-screen/ngx';
import { StringService } from './string.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { AppAvailability } from '@ionic-native/app-availability/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  Hidden: any = false;
  EndShift: any = null;

  constructor(
    private platform: Platform,
    public storage: Storage,
    public router: Router,
    public route: ActivatedRoute,
    public sessionService: SessionService,
    public http: HttpClient,
    public stringService: StringService,
    public androidFullScreen: AndroidFullScreen,
    public iab: InAppBrowser,
    public screenOrientation: ScreenOrientation,
    public navCtrl: NavController,
    public appAvailability: AppAvailability,
    public menuCtrl: MenuController,
    public loadingCtrl: LoadingController,
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    // const loading = await this.loadingCtrl.create({
    //   cssClass: 'startup-loading-class',
    //   spinner: 'lines',
    //   message: 'Preparing Higala POS, Please wait...',
    // });
    // await loading.present();
    // this.platform.ready().then(() => {
    //   this.storage.get('users').then((session) => {
      // this.router.navigate(['/profile']);
    //       setTimeout(() => {
    //         loading.dismiss();
            this.Hidden = true;
    //       }, 500);
    //   });
    // });
  }

  gotoPage(text) {
    this.menuCtrl.close();
    this.router.navigate(['/' + text]);
  }

  async endShift() { 
    this.sessionService.Loading('Signing Out...');
    setTimeout(() => {          
      this.sessionService.Dismiss();
      this.storage.remove('Profile_name');           
      this.storage.remove('Store_name');      
      this.storage.remove('inventory'); 
      this.storage.remove('attendance'); 
      this.storage.remove('reciept'); 
      this.storage.remove('profiles');       
      setTimeout(() => {
        this.menuCtrl.enable(false);
        this.navCtrl.navigateBack('/');
      }, 500);
    }, 1500);
  }

  firstCapLet(string) {
    if (string != null) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }
}
