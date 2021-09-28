import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckoutdetailsPage } from './checkoutdetails.page';

const routes: Routes = [
  {
    path: '',
    component: CheckoutdetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckoutdetailsPageRoutingModule {}
