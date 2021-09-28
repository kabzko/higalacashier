import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, MenuController, ModalController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { PrintService } from '../print.service';
import { ReceiptdetailsPage } from '../receiptdetails/receiptdetails.page';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.page.html',
  styleUrls: ['./success.page.scss'],
})
export class SuccessPage implements OnInit {

  Cart: any = [];
  ID: any = null;
  Receipt: any = [];
  Months: any = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  OrderDate: any = null;
  AssignUser: any = null;
  OrderID: any = null;
  Store_name: any = null;
  Cash: any = 0;
  Subtotal: any = 0;
  Total: any = 0;
  Change: any = 0;
  Vatable: any = 0;
  VatPercentage: any = 0;
  Vatamount: any = 0;
  Benefits: any = 0;
  BenefitsPercentage: any = 0;
  ReceiptCustomerName: any = "";
  ReceiptOrderDate: any = "";
  Type: any = "";

  constructor(
    public modalCtrl: ModalController,
    public storage: Storage,
    public printService: PrintService,
    public sessionService: SessionService,
    public alertCtrl: AlertController,
    public menuCtrl: MenuController,
    public route: ActivatedRoute,
    public navCtrl: NavController,
  ) {
    this.menuCtrl.enable(false);
    this.Cart = JSON.parse(this.route.snapshot.paramMap.get('cart'));
  }

  ngOnInit() { 
    this.loadReceipt();
  }

  loadReceipt() {
    this.OrderDate = this.Cart[0].datetime;
    this.AssignUser = this.Cart[0].cashierName;
    this.OrderID = this.Cart[0].orderId;
    this.Cash = this.Cart[0].cash;
    this.ReceiptCustomerName = this.Cart[0].customerName;
    this.Type = this.Cart[0].type;
    this.Cart.forEach(element => {
      if (element.discount != 0) {
        this.Subtotal += Number((element.price - (element.price * element.discounts)) * element.quantity);
      } else {
        this.Subtotal += Number(element.price * element.quantity);
      }
    });
    this.Total = this.Subtotal;
    if (this.Cart[0].benefits == 1) {
      this.Benefits = this.Total / this.Cart[0].benefits;
    } else if (this.Cart[0].benefits == 0) {
      this.Benefits = 0;
    } else {
      this.Benefits = this.Total - (this.Total / (1 + this.Cart[0].benefits));
    }
    if (this.Cart[0].vat == 1) {
      this.Vatable = (this.Total - this.Benefits) / this.Cart[0].vat;
    } else if (this.Cart[0].vat == 0) {
      this.Vatable = 0;
    } else {
      this.Vatable = (this.Total - this.Benefits) / (1 + this.Cart[0].vat);
    }
    this.BenefitsPercentage = Math.floor(this.Cart[0].benefits * 100);
    this.VatPercentage = Math.floor(this.Cart[0].vat * 100);
    this.Vatamount = (this.Total - this.Benefits) - this.Vatable;
    this.Change = this.Cash - (this.Total - this.Benefits);
    this.Cart.forEach(element => {
      this.Receipt.push({
        price: element.price,
        quantity: element.quantity,
        name: element.name, 
        discounts: element.discounts,       
        total: element.price * element.quantity,
      });
    });
  }

  async printToBluetooth() {
    const modal = await this.modalCtrl.create({
      component: ReceiptdetailsPage,
      cssClass: 'my-custom-class',
      componentProps: {
        'receipt': JSON.stringify(this.Cart),
      }
    });
    await modal.present();
  }

  formatPrice(value) {
    let val = (value/1).toFixed(2).replace(',', '.')
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  firstCapLet(string) {
    if (string != null) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }

  popOut() {
    this.navCtrl.navigateBack('/dashboard');
  }
}
