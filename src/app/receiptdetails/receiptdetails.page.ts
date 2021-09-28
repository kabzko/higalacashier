import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { AlertController, MenuController, ModalController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { PrintService } from '../print.service';
import { SessionService } from '../session.service';
import { StringService } from '../string.service';

@Component({
  selector: 'app-receiptdetails',
  templateUrl: './receiptdetails.page.html',
  styleUrls: ['./receiptdetails.page.scss'],
})
export class ReceiptdetailsPage implements OnInit {

  @Input('receipt') receipt: any;
  StoreName: any = "";
  StoreAddress: any = "";
  StoreContact: any = "";
  StoreFax: any = "";
  StoreVat: any = "";
  ReceiptPTUNo: any = "";
  ReceiptPTUDateIssued: any = "";
  ReceiptPTUValidUntil: any = "";
  BluetoothList: any = [];
  Receipt: any = [];
  Cart: any = [];
  Months: any = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  OrderDate: any = "";
  AssignUser: any = "";
  AssignUserType: any = "";
  OrderID: any = "";
  Store_name: any = "";
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
  ReceiptOrderDate: any = "";
  StoreInputsDetails: any = [];
  ActualTotal: any = 0;
  Customer_cart: any = [];

  constructor(
    public modalCtrl: ModalController,
    public printService: PrintService,
    public sessionService: SessionService,
    public alertCtrl: AlertController,
    public storage: Storage,
    public platform: Platform,
    public http: HttpClient,
    public stringService: StringService,
    public menuCtrl: MenuController,
  ) {
    this.menuCtrl.enable(false);
  }

  ngOnInit() {  
    this.Receipt = JSON.parse(this.receipt);
    this.loadReceiptDetail();
    this.storage.get('store_receipt_details').then(detail => {
      if (detail != null) {
        this.StoreName = detail[0].storename;
        this.StoreAddress = detail[0].storeaddress;
        this.StoreContact = detail[0].storecontact;
        this.StoreFax = detail[0].storefax;
        this.StoreVat = detail[0].storevat;
        this.ReceiptPTUNo = detail[0].storeptuno;
        this.ReceiptPTUDateIssued = detail[0].storeptuissued;
        this.ReceiptPTUValidUntil = detail[0].storeptuvalid;
      }
    });
  }

  loadReceiptDetail() {
    this.OrderDate = this.Months[new Date(this.Receipt[0].created_at).getMonth()] + ' ' + new Date(this.Receipt[0].created_at).getDate() + ', ' + new Date(this.Receipt[0].created_at).getFullYear() + ' ' + new Date(this.Receipt[0].created_at).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    if ((new Date(this.Receipt[0].created_at).getMonth() + 1) <= 9) {
      if ((new Date(this.Receipt[0].created_at).getDate()) <= 9) {
        this.ReceiptOrderDate = new Date(this.Receipt[0].created_at).getFullYear() + '-' + ("0" + (new Date(this.Receipt[0].created_at).getMonth() + 1)) + '-' + ("0" + new Date(this.Receipt[0].created_at).getDate()) + ' ' + new Date(this.Receipt[0].created_at).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
      } else {
        this.ReceiptOrderDate = new Date(this.Receipt[0].created_at).getFullYear() + '-' + ("0" + (new Date(this.Receipt[0].created_at).getMonth() + 1)) + '-' + new Date(this.Receipt[0].created_at).getDate() + ' ' + new Date(this.Receipt[0].created_at).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
      }
    } else {
      if ((new Date(this.Receipt[0].created_at).getDate()) <= 9) {
        this.ReceiptOrderDate = new Date(this.Receipt[0].created_at).getFullYear() + '-' + (new Date(this.Receipt[0].created_at).getMonth() + 1) + '-' + ("0" + new Date(this.Receipt[0].created_at).getDate()) + ' ' + new Date(this.Receipt[0].created_at).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
      } else {
        this.ReceiptOrderDate = new Date(this.Receipt[0].created_at).getFullYear() + '-' + (new Date(this.Receipt[0].created_at).getMonth() + 1) + '-' + new Date(this.Receipt[0].created_at).getDate() + ' ' + new Date(this.Receipt[0].created_at).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
      }
    }
    this.AssignUser = this.Receipt[0].cashierName;
    this.OrderID = this.Receipt[0].orderId;
    this.Cash = this.Receipt[0].cash;
    this.ReceiptCustomerName = this.Receipt[0].customerName;
    var discounttotal = 0;
    for (let index = 0; index < this.Receipt.length; index++) {
      if (this.Receipt[index].discount != 0) {
        this.Subtotal += Number((this.Receipt[index].price - (this.Receipt[index].price * this.Receipt[index].discounts)) * this.Receipt[index].quantity);
        discounttotal += Number(this.Receipt[index].price * this.Receipt[index].quantity);
      } else {
        this.Subtotal += Number(this.Receipt[index].price * this.Receipt[index].quantity);
        discounttotal = 0;
      }
    }
    this.Total = this.Subtotal;
    if (this.Receipt[0].benefits == 1) {
      this.Benefits = this.Total / this.Receipt[0].benefits;
    } else if (this.Receipt[0].benefits == 0) {
      this.Benefits = 0;
    } else {
      this.Benefits = this.Total - (this.Total / (1 + this.Receipt[0].benefits));
    }
    if (this.Receipt[0].vat == 1) {
      this.Vatable = (this.Total - this.Benefits) / this.Receipt[0].vat;
    } else if (this.Receipt[0].vat == 0) {
      this.Vatable = 0;
    } else {
      this.Vatable = (this.Total - this.Benefits) / (1 + this.Receipt[0].vat);
    }
    if (discounttotal != 0) {
      this.ActualTotal = discounttotal - this.Subtotal;
    } else {
      this.ActualTotal = 0;
    }
    this.BenefitsPercentage = Math.floor(this.Receipt[0].benefits * 100);
    this.VatPercentage = Math.floor(this.Receipt[0].vat * 100);
    this.Vatamount = (this.Total - this.Benefits) - this.Vatable;
    this.Change = this.Cash - (this.Total - this.Benefits);
    for (let index = 0; index < this.Receipt['length']; index++) {
      this.Cart.push({
        price: this.Receipt[index].price,
        quantity: this.Receipt[index].quantity,
        product_name: this.Receipt[index].name,
        product_barcode: this.Receipt[index].barcode,
        product_net_weight: this.Receipt[index].netWeight,      
        total: this.Receipt[index].price * this.Receipt[index].quantity,
        discounts: this.Receipt[index].discounts,
      });
    }
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

  async printAlertRadio() {
    if (this.StoreName != "") {
      if (this.StoreAddress != "") {
        this.storage.remove('store_receipt_details');
        this.StoreInputsDetails.push({
          storename: this.StoreName,
          storeaddress: this.StoreAddress,
          storecontact: this.StoreContact,
          storefax: this.StoreFax,
          storevat: this.StoreVat,
          storeptuno: this.ReceiptPTUNo,
          storeptuissued: this.ReceiptPTUDateIssued,
          storeptuvalid: this.ReceiptPTUValidUntil,
        });
        this.storage.set('store_receipt_details', this.StoreInputsDetails);
        this.Customer_cart = [];
          var ActualTotal = (this.formatPrice(this.ActualTotal)).toString();
          var ActualTotalspaces = "";
          for (let index = 0; index < (18 - ActualTotal.length); index++) {
            ActualTotalspaces = ActualTotalspaces + " ";
          }
          var Benefits = (this.formatPrice(this.Benefits)).toString();
          var BenefitsTotalspaces = "";
          for (let index = 0; index < (15 - Benefits.length); index++) {
            BenefitsTotalspaces = BenefitsTotalspaces + " ";
          }
          var Total = (this.formatPrice(this.Subtotal - this.Benefits)).toString();
          var Totalspaces = "";
          for (let index = 0; index < (27 - Total.length); index++) {
            Totalspaces = Totalspaces + " ";
          }
          var Cash = (this.formatPrice(this.Cash)).toString();
          var Cashspaces = "";
          for (let index = 0; index < (28 - Cash.length); index++) {
            Cashspaces = Cashspaces + " ";
          }
          var Change = (this.formatPrice(this.Change)).toString();
          var Changespaces = "";
          for (let index = 0; index < (26 - Change.length); index++) {
            Changespaces = Changespaces + " ";
          }
          var Vatable = (this.formatPrice(this.Vatable)).toString();
          var Vatablespaces = "";
          for (let index = 0; index < (19 - Vatable.length); index++) {
            Vatablespaces = Vatablespaces + " ";
          }
          var Vatamount = (this.formatPrice(this.Vatamount)).toString();
          var Vatamountspaces = "";
          for (let index = 0; index < (22 - Vatamount.length); index++) {
            Vatamountspaces = Vatamountspaces + " ";
          }
          var Vatexemptsales = (this.formatPrice(0)).toString();
          var Vatexemptsalesspaces = "";
          for (let index = 0; index < (16 - Vatexemptsales.length); index++) {
            Vatexemptsalesspaces = Vatexemptsalesspaces + " ";
          }
          var Zeroratedsales = (this.formatPrice(0)).toString();
          var Zeroratedsalesspaces = "";
          for (let index = 0; index < (16 - Zeroratedsales.length); index++) {
            Zeroratedsalesspaces = Zeroratedsalesspaces + " ";
          }
          let customername = "";
          if (this.ReceiptCustomerName != "" && this.ReceiptCustomerName != null) {
            customername = "CUSTOMER: " + this.firstCapLet(this.ReceiptCustomerName);
          } else {
            customername = "CUSTOMER: ______________________";
          }
          for (let index = 0; index < this.Cart.length; index++) {
            var actualprice;
            if (this.Cart[index].discounts != 0) {
              actualprice = (this.formatPrice(this.Cart[index].price - (this.Cart[index].price * this.Cart[index].discounts))).toString();
            }  else {
              actualprice = (this.formatPrice(this.Cart[index].price)).toString();
            }
            var actualpricespaces = "        @";
            for (let index = 0; index < 10 - actualprice.length; index++) {
              actualpricespaces = actualpricespaces + " ";
            }
            var totalprice;
            if (this.Cart[index].discounts != 0) {
              totalprice = (this.formatPrice((this.Cart[index].price - (this.Cart[index].price * this.Cart[index].discounts)) * this.Cart[index].quantity)).toString();
            }  else {
              totalprice = (this.formatPrice(this.Cart[index].total)).toString();
            }
            var totalpricespaces = "";
            for (let index = 0; index < 13 - totalprice.length; index++) {
              totalpricespaces = totalpricespaces + " ";
            }
            this.Customer_cart.push({
              text1: ((this.Cart[index].quantity) + "x").toString() + "     " + ((this.Cart[index].product_name).toString()).substr(0, 25) + "\x0a",
              text2: actualpricespaces + actualprice + totalpricespaces + totalprice + "\x0a",
            });
          }
          this.sessionService.Loading('Printing Receipt...');
          this.http.post(this.stringService.URLString + '/print_receipt', {
            'store_name': this.firstCapLet(this.StoreName).replace(/ /g, '\x0a'),
            'store_address': this.StoreAddress.toUpperCase(),
            'store_contact': "TEL/CP #: " + this.StoreContact,
            'store_fax': "FAX #: " + this.StoreFax,
            'store_vat': "VAT REG TIN : " + this.StoreVat,
            'cart': JSON.stringify(this.Customer_cart),
            'total_discount': "TOTAL DISCOUNT" + ActualTotalspaces + ActualTotal,
            'benefits_discount': "BENEFITS DISCOUNT" + BenefitsTotalspaces + Benefits,
            'total': "TOTAL" + Totalspaces + Total,
            'cash': "Cash" + Cashspaces + Cash,
            'change': "CHANGE" + Changespaces + Change,
            'vatsales': "VATable Sales" + Vatablespaces + Vatable,
            'vatamount': "VAT Amount" + Vatamountspaces + Vatamount,
            'vatexempt': "VAT Exempt Sales" + Vatexemptsalesspaces + Vatexemptsales,
            'zero': "Zero Rated Sales" + Zeroratedsalesspaces + Zeroratedsales,
            'customer_name': customername,
            'customer_tin': "TIN     : ______________________",
            'customer_address': "ADDRESS : ______________________",
            'customer_address style': "B STYLE : ______________________",
            'customer_pwdid': "PWD/SC ID NO. : ________________",
            'customer_signs': "SIGNATURE: _____________________",
            'receipt_date': "DATE/TIME: " + this.ReceiptOrderDate,
            'receipt_si': "SI NO.   : " + this.OrderID.toUpperCase(),
            'receipt_cashier': "CASHIER  : " + this.firstCapLet(this.AssignUser),
            'cashier_sign': "CHECKOUT : _____________________",
            'receipt_ptu': this.ReceiptPTUNo,
            'receipt_ptudate': "DATE ISSUED : " + this.ReceiptPTUDateIssued,
            'receipt_valid': "VALID UNTIL : " + this.ReceiptPTUValidUntil
          })
          .subscribe(res => {
            this.sessionService.Dismiss();
            this.modalCtrl.dismiss();
          }, err => {
            this.sessionService.Dismiss();
            if (err.status == 0) {
              this.sessionService.Alert('We have found that there something wrong on your network, Please check and try again.');
            } else {
              this.sessionService.Alert(err.error.message + '(err:' + err.status + ')');
            }
          });
      } else {
        this.sessionService.Toast('Printing receipt required store address.');
      }
    } else {
      this.sessionService.Toast('Printing receipt required store name.');
    }
  }

  popOut() {
    this.modalCtrl.dismiss();
  }
}
