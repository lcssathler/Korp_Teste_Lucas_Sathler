// import { Component } from '@angular/core';
// import { OnInit } from '@angular/core';
// import { FormBuilder, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatButtonModule } from '@angular/material/button';
// import { InvoiceService } from '../../../services/invoice.service';
// import { ProductService } from '../../../services/product.service';
// import { Product } from '../../../models/product.model';

// @Component({
//   selector: 'app-invoice-form',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
//   templateUrl: './invoice-form.component.html',
//   styleUrls: ['./invoice-form.component.scss']
// })
// export class InvoiceFormComponent implements OnInit {
//   fb: FormBuilder = new FormBuilder();
//   products: Product[] = [];
//   invoiceForm = this.fb.group({
//     items: this.fb.array([])
//   });

//   get items() { return this.invoiceForm.get('items') as FormArray; }

//   constructor(private invoiceService: InvoiceService, private productService: ProductService, private router: Router) {}

//   ngOnInit(): void {
//     this.productService.getAll().subscribe(products => this.products = products);
//     this.addItem();
//   }

//   addItem(): void {
//     this.items.push(this.fb.group({
//       productId: ['', Validators.required],
//       quantity: [1, [Validators.required, Validators.min(1)]]
//     }));
//   }

//   removeItem(index: number): void {
//     this.items.removeAt(index);
//   }

//   onSubmit(): void {
//     if (this.invoiceForm.valid) {
//       this.invoiceService.create(this.items.value).subscribe(invoice => this.router.navigate(['/invoices', invoice.id]));
//     } 
//   }
// }

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { InvoiceService } from '../../../services/invoice.service';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink
],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent implements OnInit {
  products: Product[] = [];
  invoiceForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.invoiceForm = this.fb.group({
      items: this.fb.array([])
    });

    this.loadProducts();
    this.addItem();
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  private createItem(): FormGroup {
    return this.fb.group({
      productId: ['', Validators.required],
      quantity: [null, [Validators.required, Validators.min(1)]]
    });
  }

  private loadProducts(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    const invoiceData = this.invoiceForm.value;

    this.invoiceService.create(invoiceData.items).subscribe({
      next: (invoice) => {
        this.router.navigate(['/invoices', invoice.id]);
      },
      error: (err) => {
        console.error('Erro ao criar invoice:', err);
      }
    });
  }
}
