import { Routes } from '@angular/router';
import { INVOICE_ROUTES } from './features/invoice/invoice.routes';
import { PRODUCT_ROUTES } from './features/product/product.routes';


export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', children: PRODUCT_ROUTES },
  { path: 'invoices', children: INVOICE_ROUTES }
];