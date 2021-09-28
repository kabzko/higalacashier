import { SessionService } from './session.service';
import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  constructor(
    public btSerial: BluetoothSerial,
    public sessionService: SessionService,
  ) {

  }

  enableBluetooth(){
    return this.btSerial.enable();
  }

  searchBluetooth(){
    return this.btSerial.list();
  }

  connectBluetooth(address){
    return this.btSerial.connect(address);
  }

  printData(data){
    return this.btSerial.write(data);
  }

  disconnectBluetooth(){
    return this.btSerial.disconnect();
  }
}
