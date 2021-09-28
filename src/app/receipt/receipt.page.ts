import { SessionService } from './../session.service';
import { ActivatedRoute } from '@angular/router';
import { StringService } from './../string.service';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController, MenuController, ModalController, NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { PrintService } from '../print.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { Storage } from '@ionic/storage';
import { ReceiptdetailsPage } from '../receiptdetails/receiptdetails.page';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.page.html',
  styleUrls: ['./receipt.page.scss'],
})
export class ReceiptPage implements OnInit {

  ID: any = "";
  Page: any = "";
  Receipt: any = [];
  Months: any = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  OrderDate: any = "";
  AssignUser: any = "";
  AssignUserType: any = "";
  OrderID: any = "";
  Cash: any = 0;
  Subtotal: any = 0;
  Total: any = 0;
  Change: any = 0;
  VatPercentage: any = 0;
  Vatable: any = 0;
  Vatamount: any = 0;
  Benefits: any = 0;
  BenefitsPercentage: any = 0;
  ReceiptCustomerName: any = "";
  ToPrintReceipt: any = [];
  arr: any = [];
  Type: any = "";

  constructor(
    public navCtrl: NavController,
    public http: HttpClient,
    public stringService: StringService,
    public route: ActivatedRoute,
    public sessionService: SessionService,
    public printService: PrintService,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public btSerial: BluetoothSerial,
    public storage: Storage,
    public modalCtrl: ModalController,
    public menuCtrl: MenuController,
  ) {
    this.menuCtrl.enable(false);
    this.ID = this.route.snapshot.paramMap.get('id');
    this.Page = this.route.snapshot.paramMap.get('page');
  }

  ngOnInit() {
    this.loadReceipt();
  }

  formatPrice(value) {
    let val = (value/1).toFixed(2).replace(',', '.')
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  popOut() {
    this.menuCtrl.enable(true);
    if (this.Page == 'records') {
      this.navCtrl.navigateBack('/salesinvoice');
    } else if (this.Page == 'storecredit') {
      this.navCtrl.navigateBack('/storecredit');
    } else {
      this.navCtrl.navigateBack('/purchase');
    }
  }

  async printToBluetooth() {
    const modal = await this.modalCtrl.create({
      component: ReceiptdetailsPage,
      cssClass: 'my-custom-class',
      componentProps: {
        'receipt': JSON.stringify(this.ToPrintReceipt),
      }
    });
    await modal.present();
  }

  loadReceipt() {
    this.sessionService.Loading('Loading Receipt...');
    this.http.post(this.stringService.URLString + '/load_selected_receipt', {
      order_id: this.ID
    })
    .subscribe(res => {
      this.ToPrintReceipt = res;
      this.sessionService.Dismiss();
      this.OrderDate = res[0].datetime;
      this.AssignUser = res[0].cashierName;
      this.Type = res[0].type;
      this.OrderID = res[0].orderId;
      this.Cash = res[0].cash;
      this.ReceiptCustomerName = res[0].customerName;
      this.arr = res;
      this.arr.forEach(element => {
        if (element.discount != 0) {
          this.Subtotal += Number((element.price - (element.price * element.discounts)) * element.quantity);
        } else {
          this.Subtotal += Number(element.price * element.quantity);
        }
      });
      this.Total = this.Subtotal;
      if (res[0].benefits == 1) {
        this.Benefits = this.Total / res[0].benefits;
      } else if (res[0].benefits == 0) {
        this.Benefits = 0;
      } else {
        this.Benefits = this.Total - (this.Total / (1 + res[0].benefits));
      }
      if (res[0].vat == 1) {
        this.Vatable = (this.Total - this.Benefits) / res[0].vat;
      } else if (res[0].vat == 0) {
        this.Vatable = 0;
      } else {
        this.Vatable = (this.Total - this.Benefits) / (1 + res[0].vat);
      }
      this.BenefitsPercentage = Math.floor(res[0].benefits * 100);
      this.VatPercentage = Math.floor(res[0].vat * 100);
      this.Vatamount = (this.Total - this.Benefits) - this.Vatable;
      this.Change = this.Cash - (this.Total - this.Benefits);
      this.arr.forEach(element => {
        this.Receipt.push({
          price: element.price,
          quantity: element.quantity,
          name: element.name,  
          total: element.price * element.quantity,
          discounts: element.discounts,
        });
      });
    }, err => {
      this.sessionService.Dismiss();
      if (err.status == 0) {
        this.sessionService.Alert('We have found that there something wrong on your network, Please check and try again.');
      } else {
        this.sessionService.Alert('Something went wrong, Please try again(err:' + err.status + ')');
      }
    });
  }

  firstCapLet(string) {
    if (string != null) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }
}
