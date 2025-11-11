import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators, ReactiveFormsModule, ValidationErrors, AbstractControl } from '@angular/forms';
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
    private readonly invoiceService: InvoiceService,
    private readonly productService: ProductService,
    private readonly router: Router
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
    const group = this.fb.group({
      productId: ['', Validators.required],
      quantity: [null, [Validators.required, Validators.min(1), this.stockValidator.bind(this)]]
    });

    group.get('productId')?.valueChanges.subscribe(() => group.get('quantity')?.updateValueAndValidity());
    group.get('quantity')?.valueChanges.subscribe(() => group.get('quantity')?.updateValueAndValidity());

    return group;
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

  stockValidator(control: AbstractControl): ValidationErrors | null {
    const quantity = control.value as number;
    const productId = control.parent?.get('productId')?.value as string;
    const product = this.products.find(p => p.id === productId);
    if (product && quantity > product.balance) {
      return { insufficientStock: { max: product.balance } };
    }
    return null;
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
        console.error('Error creating invoice:', err);
      }
    });
  }
}
