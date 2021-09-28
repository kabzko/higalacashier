import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchasePageRoutingModule } from './purchase-routing.module';

import { PurchasePage } from './purchase.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PurchasePageRoutingModule,
    FontAwesomeModule
  ],
  declarations: [PurchasePage]
})
export class PurchasePageModule {}
