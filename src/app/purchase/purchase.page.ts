import { SessionService } from './../session.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { StringService } from './../string.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import * as onScan from 'onscan.js';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.page.html',
  styleUrls: ['./purchase.page.scss'],
})
export class PurchasePage implements OnInit {

  Receipt: any = [];
  BackUpReceipt: any = [];
  Months: any = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  Day: any = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  Search: any = "";
  Searching: any = "false";
  GroupReceipt: any = [];
  Limit: any = 5;
  DateToday: any = this.Day[new Date().getDay()] + ', ' + this.Months[new Date().getMonth()] + ' ' + new Date().getDate() + ', ' + new Date().getFullYear();
  index: any = 0;

  constructor(
    public menuCtrl: MenuController,
    public http: HttpClient,
    public stringService: StringService,
    public storage: Storage,
    public navCtrl: NavController,
    public router: Router,
    public sessionService: SessionService,
  ) {
    this.menuCtrl.enable(true);
  }

  ngOnInit() {
    this.loadAttendanceByStore();
  }

  loadAttendanceByStore() {
    this.sessionService.Loading('Loading Receipts...');
    this.http.post(this.stringService.URLString + '/load_attendance_by_store', {})
    .subscribe(res => {
      this.sessionService.Dismiss()
      this.index = 0;
      this.BackUpReceipt = res;
      this.BackUpReceipt.forEach(element => {
        this.index++;
        if (this.GroupReceipt.filter(x => x.date == element.date).length == 0) {
          if (this.index == 0) {
            this.GroupReceipt.push({
              id: this.index,
              date: element.date,
              expanded: false,
            });
          } else {
            this.GroupReceipt.push({
              id: this.index,
              date: element.date,
              expanded: true,
            });
          }
        }
      });
      this.Receipt = this.BackUpReceipt;
    }, err => {
      this.sessionService.Dismiss()
      if (err.status == 0) {
        this.sessionService.Alert('We have found that there something wrong on your network, Please check and try again.');
      } else {
        this.sessionService.Alert('Something went wrong, Please try again(err:' + err.status + ')');
      }
    });
  }

  formatPrice(value) {
    let val = (value/1).toFixed(2).replace(',', '.')
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  ionViewWillEnter() {
    onScan.detachFrom(document);
    this.menuCtrl.enable(true);
  }

  openMenu() {
    this.menuCtrl.open();
  }

  refreshReceipt() {
    this.sessionService.Loading('Refreshing Receipts...');
    this.http.post(this.stringService.URLString + '/load_attendance_by_store', {})
    .subscribe(res => {
      this.sessionService.Dismiss();
      this.Receipt = [];
      this.BackUpReceipt = [];
      this.GroupReceipt = [];
      this.index = 0;
      this.BackUpReceipt = res;
      this.BackUpReceipt.forEach(element => {
        this.index++;
        if (this.GroupReceipt.filter(x => x.date == element.date).length == 0) {
          if (this.index == 0) {
            this.GroupReceipt.push({
              id: this.index,
              date: element.date,
              expanded: false,
            });
          } else {
            this.GroupReceipt.push({
              id: this.index,
              date: element.date,
              expanded: true,
            });
          }
        }
      });
      this.Receipt = this.BackUpReceipt;
    }, err => {
      this.sessionService.Dismiss();
      if (err.status == 0) {
        this.sessionService.Alert('We have found that there something wrong on your network, Please check and try again.');
      } else {
        this.sessionService.Alert('Something went wrong, Please try again(err:' + err.status + ')');
      }
    }); 
  }

  WildTest(wildcard, str) {
    let w = wildcard.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`^${w.replace(/\*/g,'.*').replace(/\?/g,'.')}$`,'i');
    return re.test(str);
  }

  moreFilterReceiptByDate(date) {
    this.Limit = (this.filterReceiptByDate(date)).length + 5;
  }

  filterReceiptByDate(date) { 
    return (this.Receipt.filter(x => x.date == date)).slice(0, this.Limit);
  }

  filterMoreButton(date) {
    if ((this.Receipt.filter(x => x.date == date)).length == ((this.Receipt.filter(x => x.date == date)).slice(0, this.Limit)).length) {
      return false;
    } else {
      return true;
    }
  }

  searchPurchase() {
    if (this.Search != '') {
      if ((this.BackUpReceipt.filter(x => this.WildTest('*' + this.Search + '*', x.order_id))).length != 0) {
        this.Searching = "true";
        this.Receipt = this.BackUpReceipt.filter(x => this.WildTest('*' + this.Search + '*', x.order_id));
      } else {
        this.Searching = "true";
        this.Receipt = [];
      }                
    } else {
      this.Searching = "false";
      this.Receipt = this.BackUpReceipt;
    }
  }

  expandItem(id) {
    if (this.GroupReceipt.find(x => x.expanded == false) == undefined) {
      this.GroupReceipt.find(x => x.id == id).expanded = false;
    } else {
      if (this.GroupReceipt.find(x => x.id == id).expanded == false) {
        this.GroupReceipt.find(x => x.id == id).expanded = true;
      } else {
        this.GroupReceipt.find(x => x.expanded == false).expanded = true;
        this.GroupReceipt.find(x => x.id == id).expanded = false;
        this.Limit = 5;
      }
    }
  }

  AddZero(number) {
    if (((number).toString()).length == 1) {
      return "0" + number.toString();
    } else {
      return number;
    }
  }

  viewReceipt(id) {
    this.router.navigate(['/receipt', {id: id, page: 'purchase'}]);
  } 
}
