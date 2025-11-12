import { MatCardModule } from '@angular/material/card';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule, MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { InvoiceService } from '../../../services/invoice.service';
import { ProductService } from '../../../services/product.service';
import { Invoice } from '../../../models/invoice.model';
import { Product } from '../../../models/product.model';
import { of, catchError, finalize } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from "@angular/material/icon";
@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule, MatProgressSpinner, RouterLink, MatCardModule, MatIcon],
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss']
})
export class InvoiceDetailComponent implements OnInit {
  invoice: Invoice | null = null;
  products: Product[] = [];
  loading = true;
  loadingSummary = false;
  printing = false;
  errorMsg = '';
  resume: { summary: string} = {
    summary: ''
  };
  error = '';

  constructor(private readonly route: ActivatedRoute, private readonly invoiceService: InvoiceService, private readonly productService: ProductService, private readonly snackBar: MatSnackBar) {}

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
    if (this.invoice?.status !== 'Open') return;

    this.printing = true;
    this.errorMsg = '';

    this.invoiceService.print(this.invoice.id).pipe(
      finalize(() => this.printing = false),
      catchError(err => {
        const msg = err.error?.toString() || 'Error print invoice';
        this.errorMsg = msg;
        this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: 'error-snack' });
        return of(null);
      })
    ).subscribe(result => {
      if (!this.errorMsg) {
        this.invoice!.status = 'Closed';
        this.snackBar.open('Invoice printed', 'OK', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: 'success-snack' });
        this.generateSummary();
        this.productService.getAll().subscribe();
      }
    });
  }

  generateSummary(): void {
    this.loadingSummary = true;
    this.invoiceService.getSummary(this.invoice!.id).subscribe({
      next: (res) => {
        console.log(`Summary recived from backend: ${res}`)
        this.resume = res;
        this.loadingSummary = false;
        console.log(`Resume: ${this.resume.summary}`)
      },
      error: (err) => {
        this.error = 'Error loading summary';
        this.loading = false;
        console.log(`Resume error: ${err}`);
      }
    });
  }

  getProductName(id: string): string {
    const p = this.products.find(x => x.id === id);
    return p ? `${p.code} – ${p.description}` : '-';
  }
}
