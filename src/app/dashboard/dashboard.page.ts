import { Router } from '@angular/router';
import { StringService } from './../string.service';
import { Component, OnInit, HostListener } from '@angular/core';
import { MenuController, AlertController, ToastController, ModalController, ActionSheetController, LoadingController, Platform } from '@ionic/angular';
import { SessionService } from '../session.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import * as onScan from 'onscan.js';
import { CheckoutdetailsPage } from '../checkoutdetails/checkoutdetails.page';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  Barcode: any = "";
  Cart: any = [];
  Total: any = 0;
  Scan: any = true;
  Inventory: any = [];
  BackupInventory: any = [];
  Search: any = "";
  AlertInputs: any = "";
  SaleToday: any = 0;
  TotalLengthInventory: any = 0;
  InfiniteScroll: any = true;
  indexcart: any = 0;

  constructor(
    public menuCtrl: MenuController,
    public sessionService: SessionService,
    public stringService: StringService,
    public bluetoothSerial: BluetoothSerial,
    public alertCtrl: AlertController,
    public storage: Storage,
    public toastCtrl: ToastController,
    public http: HttpClient,
    public modalCtrl: ModalController,
    public router: Router,
    public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    public platform: Platform,
  ) {
    platform.ready().then(() => {
      (<HTMLElement>document.getElementById('product-list')).style.height = (platform.height() - 111).toString() + "px";
      (<HTMLElement>document.getElementById('cart-list')).style.height = (platform.height() - 137).toString() + "px";
    });  
  }

  ngOnInit() {

  }

  formatPrice(value) {
    let val = (value/1).toFixed(2).replace(',', '.')
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  loadData(event) {
    var limit = this.Inventory.length + 60;
    this.Inventory = this.BackupInventory.slice(0, limit);
    setTimeout(() => {
      event.target.complete();
      if (this.Inventory.length == this.TotalLengthInventory) {
        this.InfiniteScroll = false;
        event.target.disabled = true;
      }
    }, 1000);
  }

  AddZero(number) {
    if (((number).toString()).length == 1) {
      return "0" + number.toString();
    } else {
      return number;
    }
  }

  ionViewWillEnter() {
    this.Cart = [];
    this.Total = 0;
    this.menuCtrl.enable(true);
    this.sessionService.loadProfileSession();
    this.loadInventoryByStore();
    this.Search = "";
    setTimeout(() => {
      onScan.attachTo(document, {
        onScan: function(sCode, iQty) {
            (<HTMLInputElement>document.getElementById('inputtext')).value = sCode;
        },
        onKeyDetect: function(iKeyCode) {
          (<HTMLInputElement>document.getElementById('inputtextaction')).value = iKeyCode;
        }
      });
    }, 100);
  }

  loadInventoryByStore() {
    this.sessionService.Loading('Loading Products...');
    this.http.post(this.stringService.URLString + '/load_inventory_cart', {})
    .subscribe(res => {
      this.sessionService.Dismiss();
      this.BackupInventory = res;
      this.TotalLengthInventory = this.BackupInventory.length;
      this.Inventory = this.BackupInventory.slice(0, 60);;
    }, err => {
      this.sessionService.Dismiss();
      if (err.status == 0) {
        this.sessionService.Alert('We have found that there something wrong on your network, Please check and try again.');
      } else {
        this.sessionService.Alert('Something went wrong, Please try again(err:' + err.status + ')');
      }
    });
  }

  actionKey(e) {
    if (e.detail.value == 46 || e.detail.value == 110) {
      this.clearAll();
      (<HTMLInputElement>document.getElementById('inputtextaction')).value = '';
    }
    if (e.detail.value == 120) {
      this.gotoCheckout();
      (<HTMLInputElement>document.getElementById('inputtextaction')).value = '';
    }
    if (e.detail.value == 123) {
      this.openCashDrawer();
      (<HTMLInputElement>document.getElementById('inputtextaction')).value = '';
    }
  }

  openMenu() {
    this.menuCtrl.open();
  }

  checkFocus() {
    this.Scan = false;
  }

  checkBlur() {
    this.Scan = true;
  }

  addToCart() {
    if (this.router.url == '/dashboard') {
      if (this.Scan == true) {
        if (this.Barcode != "") {
          if ((this.BackupInventory.filter(x => x.barcode == this.Barcode)).length != 0) {
            if ((this.BackupInventory.filter(x => x.barcode == this.Barcode)).length >= 2) {
              this.Scan = false;
              var list = [];
              this.indexcart = 0;
              (this.BackupInventory.filter(x => x.barcode == this.Barcode)).forEach(element => {
                list.push({
                  name: "radio" + this.indexcart++,
                  type: 'radio',
                  label: element.name + " - ₱ " + element.price,
                  value: element.id,
                });
              });
              this.presentListDuplicateProductRadio(list);
            } else {
              if ((this.Cart.filter(x => x.barcode == this.Barcode)).length == 0) {
                let arr = this.Cart;
                arr.reverse().push({
                  id: (this.BackupInventory.filter(x => x.barcode == this.Barcode))[0].id,
                  barcode: (this.BackupInventory.filter(x => x.barcode == this.Barcode))[0].barcode,
                  name: ((this.BackupInventory.filter(x => x.barcode == this.Barcode))[0].name).replace(/[aeiou]/g,''),
                  price: (this.BackupInventory.filter(x => x.barcode == this.Barcode))[0].price,
                  net_weight: (this.BackupInventory.filter(x => x.barcode == this.Barcode))[0].net_weight,
                  ordered: 1,
                  discount: (this.BackupInventory.filter(x => x.barcode == this.Barcode))[0].discount,
                });
                this.Cart = arr.reverse();
              } else {
                this.Cart.find(x => x.barcode == this.Barcode).ordered = parseInt(this.Cart.find(x => x.barcode == this.Barcode).ordered) + 1;
              }
              this.Total = 0;
              this.Cart.forEach(element => {
                if (element.discount != 0) {
                  this.Total += Number((element.price - (element.price * element.discount)) * element.ordered);
                } else {
                  this.Total += Number(element.price * element.ordered);
                }
              });
            }
          } else {
            this.sessionService.Toast('This product is not yet registered.');
          }
          setTimeout(() => {
            this.Barcode = "";
          }, 500);
          
        }
      } else {
        setTimeout(() => {
          this.Barcode = "";
        }, 500);
      }
    }
  }

  async presentListDuplicateProductRadio(list) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-duplicate-product-class',
      inputs: list,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.Scan = true;
          }
        }, {
          text: 'Ok',
          role: 'okdashboard',
          handler: (res) => {
            if (res != null) {
              if ((this.Cart.filter(x => x.id == res)).length == 0) {
                let arr = this.Cart;
                arr.reverse().push({
                  id: (this.BackupInventory.filter(x => x.id == res))[0].id,
                  barcode: (this.BackupInventory.filter(x => x.id == res))[0].barcode,
                  name: ((this.BackupInventory.filter(x => x.id == res))[0].name).replace(/[aeiou]/g,''),
                  price: (this.BackupInventory.filter(x => x.id == res))[0].price,
                  net_weight: (this.BackupInventory.filter(x => x.id == res))[0].net_weight,
                  ordered: 1,
                  discount: (this.BackupInventory.filter(x => x.id == res))[0].discount
                });
                this.Cart = arr.reverse();
              } else {
                this.Cart.find(x => x.id == res).ordered = parseInt(this.Cart.find(x => x.id == res).ordered) + 1;
              }
              this.Total = 0;
              this.Cart.forEach(element => {
                if (element.discount != 0) {
                  this.Total += Number((element.price - (element.price * element.discount)) * element.ordered);
                } else {
                  this.Total += Number(element.price * element.ordered);
                }
              });
              this.Scan = true;
            } else {
              this.presentListDuplicateProductRadio(list);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async bigaddToCart(id, stock) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      message: 'Enter the quantity of the item to be added to cart.',
      inputs: [
        {
          name: 'quantity',
          type: 'number',
          value: 1,
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {

          }
        }, {
          text: 'Submit',
          role: 'okdashboard',
          handler: (res) => {
            if (res.quantity >= 1) {
              if (Number(res.quantity) <= Number(stock)) {
                if ((this.Cart.filter(x => x.id == id)).length == 0) {
                  let arr = this.Cart;
                  arr.reverse().push({
                    id: (this.BackupInventory.filter(x => x.id == id))[0].id,
                    barcode: (this.BackupInventory.filter(x => x.id == id))[0].barcode,
                    name: ((this.BackupInventory.filter(x => x.id == id))[0].name).replace(/[aeiou]/g,''),
                    price: (this.BackupInventory.filter(x => x.id == id))[0].price,
                    netweight: (this.BackupInventory.filter(x => x.id == id))[0].netweight,
                    ordered: res.quantity,
                    discount: (this.BackupInventory.filter(x => x.id == id))[0].discount
                  });
                  this.Cart = arr.reverse();
                } else {
                  this.Cart.find(x => x.id == id).ordered = parseInt(this.Cart.find(x => x.id == id).ordered) + parseInt(res.quantity);
                }
                this.Total = 0;
                this.Cart.forEach(element => {
                  if (element.discount != 0) {
                    this.Total += Number((element.price - (element.price * element.discount)) * element.ordered);
                  } else {
                    this.Total += Number(element.price * element.ordered);
                  }
                });
              } else {
                this.sessionService.Toast('Maximum stocks are ' + stock + '.');
              }
            } else {
              this.sessionService.Toast('0 and Below are incorrect.');
            }         
          }
        }
      ]
    });
    await alert.present().then(() => {
      const firstInput: any = document.querySelector('ion-alert input');
      firstInput.focus();
      return;
    });
  }

  removeItem(index) {
    this.Cart.splice(index, 1);
    this.Total = 0;
    this.Cart.forEach(element => {
      this.Total += Number(element.price * element.ordered);
    });
    this.Scan = true;
  }

  async changeQuantity(id, quantity) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      message: 'Enter the desire quantity to be change.',
      inputs: [
        {
          name: 'quantity',
          type: 'number',
          value: quantity,
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.Scan = true;
            
          }
        }, {
          text: 'Submit',
          role: 'okdashboard',
          handler: (res) => {
            if (res.quantity >= 1) {
              this.Cart.find(x => x.id == id).ordered = res.quantity;
              this.Total = 0;
              this.Cart.forEach(element => {
                this.Total += Number(element.price * element.ordered);
              });
              this.Scan = true;
              
            } else {
              this.changeQuantity(id, quantity);
              this.sessionService.Toast('0 and Below are incorrect.');              
            }            
          }
        }
      ]
    });
    await alert.present().then(() => {
      const firstInput: any = document.querySelector('ion-alert input');
      firstInput.focus();
      return;
    });
  }

  async changePrice(id, price) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      message: 'Enter the custom price to be change.',
      inputs: [
        {
          name: 'price',
          type: 'number',
          value: price,
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.Scan = true;
            
          }
        }, {
          text: 'Submit',
          role: 'okdashboard',
          handler: (res) => {
            if (res.price >= 1) {
              this.Cart.find(x => x.id == id).price = res.price;
              this.Total = 0;
              this.Cart.forEach(element => {
                this.Total += Number(element.price * element.ordered);
              });
              this.Scan = true;
            } else {
              this.Cart.find(x => x.id == id).price = 0;
              this.Total = 0;
              this.Cart.forEach(element => {
                this.Total += Number(element.price * element.ordered);
              });
              this.Scan = true;             
            }            
          }
        }
      ]
    });
    await alert.present().then(() => {
      const firstInput: any = document.querySelector('ion-alert input');
      firstInput.focus();
      return;
    });
  }

  WildTest(wildcard, str) {
    let w = wildcard.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`^${w.replace(/\*/g,'.*').replace(/\?/g,'.')}$`,'i');
    return re.test(str);
  }

  searchProduct() {
    if (this.Search != '') {
      this.InfiniteScroll = false;
      if ((this.BackupInventory.filter(x => this.WildTest('*' + this.Search + '*', x.barcode))).length != 0) {
          this.Inventory = this.BackupInventory.filter(x => this.WildTest('*' + this.Search + '*', x.barcode));
      } else if ((this.BackupInventory.filter(x => this.WildTest('*' + this.Search + '*', x.name))).length != 0) {
        this.Inventory = this.BackupInventory.filter(x => this.WildTest('*' + this.Search + '*', x.name));
      } else {
        this.Inventory = [];
      }               
    } else {
      this.InfiniteScroll = true;
      this.Inventory = this.BackupInventory.slice(0, 60);
    }
  }

  async actionSheet(index, barcode, id, quantity, price) {
    this.Scan = false;
    const actionSheet = await this.actionSheetCtrl.create({
      header: barcode.toUpperCase(),
      cssClass: 'my-custom-class',
      buttons: [
        {
        text: 'Custom Price',
        handler: () => {
          setTimeout(() => {
            this.changePrice(id, price)
          }, 500);
        }
      },
      {
        text: 'Change Quantity',
        handler: () => {
          setTimeout(() => {
            this.changeQuantity(id, quantity);
          }, 500);
        }
      }, {
        text: 'Remove',
        handler: () => {
          this.removeItem(index);
        }
      }, {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          this.Scan = true;
        }
      }]
    });
    await actionSheet.present();
  }

  async gotoCheckout() {
    if (this.Cart.length != 0) {    
      onScan.detachFrom(document);
      const modal = await this.modalCtrl.create({
        component: CheckoutdetailsPage,
        cssClass: 'checkout-custom-class',
        componentProps: {
          'cart': JSON.stringify(this.Cart), 
          'total': this.Total
        }
      });
      await modal.present();
      const { data } = await modal.onWillDismiss();
      if (data == undefined) {
        this.menuCtrl.enable(true);
        setTimeout(() => {
          onScan.attachTo(document, {
            onScan: function(sCode, iQty) {
                (<HTMLInputElement>document.getElementById('inputtext')).value = sCode;
            },
            onKeyDetect: function(iKeyCode) {
              (<HTMLInputElement>document.getElementById('inputtextaction')).value = iKeyCode;
            }
          });
        }, 100);
      } else {
        if (data.status == 'exit') {
          this.menuCtrl.enable(true);
          setTimeout(() => {
            onScan.attachTo(document, {
              onScan: function(sCode, iQty) {
                  (<HTMLInputElement>document.getElementById('inputtext')).value = sCode;
              },
              onKeyDetect: function(iKeyCode) {
                (<HTMLInputElement>document.getElementById('inputtextaction')).value = iKeyCode;
              }
            });
          }, 100);
        } else {
          this.router.navigate(['/success', {'cart': data.status}]);
        }
      }
    } else {
      this.sessionService.Toast('Cart is currently empty!');
    }
  }

  clearAll() {
    if (this.Cart.length != 0) {
      this.Cart = [];
      this.Total = 0;
      this.sessionService.Toast('Cart cleared.');
    } else {
      this.sessionService.Toast('Cart is already empty.');
    }
  }

  openCashDrawer() {
    this.sessionService.Loading('Opening Cash Drawer...');
    setTimeout(() => {
      this.http.get(this.stringService.URLString + '/open_cash_drawer')
      .subscribe(() => {
        this.sessionService.Dismiss();
      }, err => {
        this.sessionService.Dismiss();
      });
    }, 500);
  }

  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(evt: KeyboardEvent) {
    if (this.router.url == '/dashboard') {
      let element: HTMLElement = document.getElementsByClassName('alert-button-role-okdashboard')[0] as HTMLElement;
      element.click();
    }
  }
}
