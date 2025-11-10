import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { InvoiceService } from '../../../services/invoice.service';
import { ProductService } from '../../../services/product.service';
import { Invoice } from '../../../models/invoice.model';
import { Product } from '../../../models/product.model';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule, MatProgressSpinner, RouterLink],
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss']
})
export class InvoiceDetailComponent implements OnInit {
  invoice: Invoice | null = null;
  products: Product[] = [];
  loading = true;
  printing = false;

  constructor(private route: ActivatedRoute, private invoiceService: InvoiceService, private productService: ProductService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.invoiceService.getById(id).subscribe(invoice => {
        this.invoice = invoice;
        this.productService.getAll().subscribe(products => {
          this.products = products;
          this.loading = false;
        });
      });
    }
  }

  print(): void {
    if (this.invoice) {
      this.printing = true;
      this.invoiceService.print(this.invoice.id).pipe(
        finalize(() => this.printing = false),
        catchError(err => {
          console.error('Error printing invoice', err);
          return of(null);
        })
      ).subscribe(() => {
        if (this.invoice) {
          this.invoice.status = 'Closed';
        }
      });
    }
  }

  getProductName(productId: string): string {
    const product = this.products.find(p => p.id === productId);
    return product ? product.description : "Can't find product description";
  }
}
