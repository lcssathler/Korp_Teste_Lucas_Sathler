import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterLink],  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})

export class ProductFormComponent {
  fb: FormBuilder = new FormBuilder();

  productForm = this.fb.group({
    code: ['', Validators.required],
    description: ['', Validators.required],
    balance: [null, [Validators.required, Validators.min(0)]],
  });

  constructor(
    private readonly productService: ProductService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {}

  onSubmit(): void {
    if (this.productForm.valid) {
      this.productService
        .create(this.productForm.value as any)
        .subscribe(() => {
          this.snackBar.open(`${this.productForm.value.description} saved successfully`, 'OK', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: 'success-snack' });
          this.router.navigate(['/products']);
        });
    }
  }
}
