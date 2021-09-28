import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReceiptdetailsPageRoutingModule } from './receiptdetails-routing.module';

import { ReceiptdetailsPage } from './receiptdetails.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReceiptdetailsPageRoutingModule
  ],
  declarations: [ReceiptdetailsPage]
})
export class ReceiptdetailsPageModule {}
