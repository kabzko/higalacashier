import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'prefix',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'purchase',
    loadChildren: () => import('./purchase/purchase.module').then( m => m.PurchasePageModule)
  },
  {
    path: 'security',
    loadChildren: () => import('./security/security.module').then( m => m.SecurityPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'receipt',
    loadChildren: () => import('./receipt/receipt.module').then( m => m.ReceiptPageModule)
  },
  {
    path: 'success',
    loadChildren: () => import('./success/success.module').then( m => m.SuccessPageModule)
  },
  {
    path: 'receiptdetails',
    loadChildren: () => import('./receiptdetails/receiptdetails.module').then( m => m.ReceiptdetailsPageModule)
  },
  {
    path: 'checkoutdetails',
    loadChildren: () => import('./checkoutdetails/checkoutdetails.module').then( m => m.CheckoutdetailsPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
