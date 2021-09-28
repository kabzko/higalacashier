import { AlertController, ToastController, LoadingController, NavController, Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { StringService } from './string.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  LiveDate: any;
  ShiftProfile: any = "";
  ShiftType: any = "";
  ProfileName: any = "";
  StoreName: any = "";
  isLoading: any = false;
  Date: any = "";

  constructor(
    public http: HttpClient,
    public storage: Storage,
    public stringService: StringService,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public platform: Platform,
  ) {

  }

  loadProfileSession() {
    this.storage.get('Profile_name').then((profile_name) => {
      if (profile_name != null) {
        this.ProfileName = profile_name;
      }
    });
  }

  async Alert(text) {
    const alert = await this.alertCtrl.create({
      message: text,
      cssClass: 'my-custom-class',
      buttons: ['OK']
    });
    await alert.present();
  }

  async Toast(text) {
    const toast = await this.toastCtrl.create({
      cssClass: 'toast-custom-class',
      message: text,
      animated: true,
      duration: 1500,
      color: 'dark'
    });
    toast.present();
  }

  async Loading(text) {
    this.isLoading = true;
    return await this.loadingCtrl.create({
      cssClass: 'loading-custom-class',
      spinner: 'lines',
      message: text,
    }).then(res => {
      res.present().then(() => {
        if (!this.isLoading) {
          res.dismiss().then(() => {});
        }
      });
    });
  }

  async Dismiss() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss().then(() => {});
  }
}
