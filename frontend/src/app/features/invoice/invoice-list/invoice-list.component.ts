import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { InvoiceService } from '../../../services/invoice.service';
import { Invoice } from '../../../models/invoice.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';


@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, ],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  displayedColumns = ['number', 'status', 'actions'];

  constructor(private readonly invoiceService: InvoiceService, private readonly snackBar: MatSnackBar, private readonly router: Router) {}

  ngOnInit(): void {
    this.invoiceService.getAll()
    .pipe(
      catchError((error) => {
        if (error.status === 0 || error.status >= 500) {
          this.router.navigate(['/error/server-down']);
        }
        return throwError(() => error);
      })
    )
    .subscribe(invoices => this.invoices = invoices);
  }

  cancelInvoice(id: string, status: string, number: number): void {
    if (!confirm(`Cancel invoice ${number}? \nStatus: ${status}`)) return;

    this.invoiceService.cancel(id).subscribe({
      next: () => {
        this.snackBar.open(`Invoice ${number} cancelled successfully`, 'OK', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: 'success-snack' });
        this.ngOnInit();
      },
      error: (err) => {
        this.snackBar.open(`Error cancelling invoice ${number}`, 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: 'error-snack' });
        console.error(err);
      }
    });
  }
}
