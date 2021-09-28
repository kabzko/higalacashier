import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, HostListener, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, IonInput, MenuController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { SessionService } from '../session.service';
import { StringService } from '../string.service';

@Component({
  selector: 'app-checkoutdetails',
  templateUrl: './checkoutdetails.page.html',
  styleUrls: ['./checkoutdetails.page.scss'],
})
export class CheckoutdetailsPage implements OnInit {

  @ViewChild('inputCash') ionInput: IonInput;
  @Input('cart') cart: any;
  @Input('total') total: any;
  Total: any = 0;
  Cart: any = [];
  CustomerName: any = "";
  CustomerCash: any = "";
  CustomerBenefits: any = 0;
  FeeInput: any = [];
  SegmentStatus: any = "Cash";
  CustomerNameList: any = [];
  BackupCustomerNameList: any = [];
  HiddenCustomer: any = true;

  constructor(
    public sessionService: SessionService,
    public stringService: StringService,
    public http: HttpClient,
    public storage: Storage,
    public modalCtrl: ModalController,
    public menuCtrl: MenuController,
    public route: ActivatedRoute,
    public navCtrl: NavController,
    public router: Router,
  ) {
    this.menuCtrl.enable(false);
  }

  ngOnInit() {
    setTimeout(() => {
      this.ionInput.setFocus();
    }, 750);
    this.listofCustomername();
    this.Cart = this.cart;
    this.Total = this.total;
    this.storage.get('checkout_fee').then(fee => {
      if (fee != null) {
        this.CustomerBenefits = fee[0].benefit;
      }
    });
  }

  async selectStatus(text) {
    this.SegmentStatus = text.detail.value;
  }

  listofCustomername() {
    this.http.post(this.stringService.URLString + '/customers_name', {})
    .subscribe(res => {
      this.BackupCustomerNameList = res;
      this.CustomerNameList = this.BackupCustomerNameList;
    }, err => {
      this.sessionService.Dismiss();
      if (err.status == 0) {
        this.sessionService.Alert('We have found that there something wrong on your network, Please check and try again.');
      } else {
        this.sessionService.Alert('Something went wrong, Please try again(err:' + err.status + ')');
      }
    });
  }

  checkFocus() {
    if (this.CustomerNameList.length != 0) {
      this.HiddenCustomer = false;
    }
  }

  checkBlur() {
    setTimeout(() => {
      this.HiddenCustomer = true;
    }, 250);
  }

  selectSimilarCustomer() {
    if (this.CustomerName != '') {
      console.log(this.CustomerName);
      if ((this.BackupCustomerNameList.filter(x => this.WildTest('*' + this.CustomerName + '*', x.customerName))).length != 0) {
        this.CustomerNameList = this.BackupCustomerNameList.filter(x => this.WildTest('*' + this.CustomerName + '*', x.customerName));
      } else {
        this.HiddenCustomer = true;
        this.CustomerNameList = [];
      }                
    } else {
      if (this.CustomerNameList.length != 0) {
        this.HiddenCustomer = false;
      }
      this.CustomerNameList = this.BackupCustomerNameList;
    }
  }

  firstCapLet(string) {
    if (string != null) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }

  WildTest(wildcard, str) {
    let w = wildcard.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`^${w.replace(/\*/g,'.*').replace(/\?/g,'.')}$`,'i');
    return re.test(str);
  }

  async checkOut() {
    if (this.CustomerCash == '') {
      this.CustomerCash = 0;
    }
    if (this.CustomerCash != '') {
      if (this.CustomerCash >= this.Total.toFixed(2)) {
        if (this.CustomerBenefits == '') {
          this.CustomerBenefits = 0;
        }
        if (this.CustomerBenefits >= 0 && this.CustomerBenefits <= 100) {
          if (((this.CustomerBenefits).toString()).indexOf('.') == -1) {
            this.storage.remove('checkout_fee');
            this.FeeInput.push({
              benefit: this.CustomerBenefits,
            });
            this.storage.set('checkout_fee', this.FeeInput);
            this.sessionService.Loading('Checking Out...');
            this.http.post(this.stringService.URLString + '/checkout_purchase', {
              cart: this.Cart,
              profile_name: this.sessionService.ProfileName,
              cash: this.CustomerCash,
              name: this.CustomerName.toLowerCase(),
              benefit: this.CustomerBenefits,
              total: this.Total.toFixed(2),
              type: 'cash',
              status: ''
            })
            .subscribe(res => {
              this.sessionService.Dismiss();
              this.modalCtrl.dismiss({
                status: JSON.stringify(res),
              });
            }, err => {
              this.sessionService.Dismiss();
              if (err.status == 0) {
                this.sessionService.Alert('We have found that there something wrong on your network, Please check and try again.');
              } else {
                this.sessionService.Alert('Something went wrong, Please try again(err:' + err.status + ')');
              }
            });
          } else {
            this.sessionService.Toast('Discount Benefits must be a whole number.');
          }
        } else {
          this.sessionService.Toast('Must be 0 to 100 percent.');
        }
      } else {
        this.sessionService.Toast('Bill is to small.');
      }
    } else {
      this.sessionService.Toast('Bill is empty.');
    }
  }

  selectSuppleName(text) {
    this.CustomerName = this.firstCapLet(text);
  }

  async storecredit() {
    if (this.CustomerName != '') {
      this.sessionService.Loading('Checking Out...');
      this.http.post(this.stringService.URLString + '/checkout_purchase', {
        cart: this.Cart,
        profile_name: this.sessionService.ProfileName,
        cash: this.Total.toFixed(2),
        name: this.CustomerName,
        benefit: 0,
        total: this.Total.toFixed(2),
        type: 'storecredit',
        status: 'unpaid'
      })
      .subscribe(res => {
        this.sessionService.Dismiss();
        this.modalCtrl.dismiss({
          status: JSON.stringify(res),
        });
      }, err => {
        this.sessionService.Dismiss();
        if (err.status == 0) {
          this.sessionService.Alert('We have found that there something wrong on your network, Please check and try again.');
        } else {
          this.sessionService.Alert('Something went wrong, Please try again(err:' + err.status + ')');
        }
      });
    } else {
      this.sessionService.Toast('Store credit requires customer name.');
    }
  }

  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(evt: KeyboardEvent) {
    let element: HTMLElement = document.getElementsByClassName('checkout-btn')[0] as HTMLElement;
    element.click();
  }

  popOut() {
    this.menuCtrl.enable(true);
    this.modalCtrl.dismiss({
      status: 'exit',
    });
  }
}
