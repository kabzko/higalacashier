import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReceiptdetailsPage } from './receiptdetails.page';

const routes: Routes = [
  {
    path: '',
    component: ReceiptdetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReceiptdetailsPageRoutingModule {}
