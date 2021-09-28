import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CheckoutdetailsPageRoutingModule } from './checkoutdetails-routing.module';

import { CheckoutdetailsPage } from './checkoutdetails.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CheckoutdetailsPageRoutingModule
  ],
  declarations: [CheckoutdetailsPage]
})
export class CheckoutdetailsPageModule {}
