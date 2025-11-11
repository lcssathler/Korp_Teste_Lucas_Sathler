import { Routes } from '@angular/router';
import { INVOICE_ROUTES } from './features/invoice/invoice.routes';
import { PRODUCT_ROUTES } from './features/product/product.routes';
import { ErrorSystemDownComponent } from './components/error-system-down/error-system-down.component';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', children: PRODUCT_ROUTES },
  { path: 'invoices', children: INVOICE_ROUTES },
  { path: 'error/server-down', component: ErrorSystemDownComponent },
];
