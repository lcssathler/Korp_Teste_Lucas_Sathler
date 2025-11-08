import { Routes } from '@angular/router';


export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  {
    path: 'products',
    loadChildren: () => import('./features/product/product.routes').then(r => r.PRODUCT_ROUTES)
  },
  {
    path: 'invoices',
    loadChildren: () => import('./features/invoice/invoice.routes').then(r => r.INVOICE_ROUTES)
  }
];
