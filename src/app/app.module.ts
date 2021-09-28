import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { IonicStorageModule } from '@ionic/storage';
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AndroidFullScreen } from '@ionic-native/android-full-screen/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { AppAvailability } from '@ionic-native/app-availability/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule, 
    IonicModule.forRoot({
      swipeBackEnabled: false
    }), 
    IonicStorageModule.forRoot(), 
    AppRoutingModule, 
    HttpClientModule, 
    FontAwesomeModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BluetoothSerial,
    InAppBrowser,
    AndroidFullScreen,
    ScreenOrientation,
    AppAvailability,
    File,
    FileOpener,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
    library.addIconPacks(far);
    library.addIconPacks(fab);
  }
}