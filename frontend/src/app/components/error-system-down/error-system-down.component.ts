import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-system-down',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './error-system-down.component.html',
  styleUrl: './error-system-down.component.scss'
})
export class ErrorSystemDownComponent implements OnInit{
  previousUrl = '';

  constructor(private readonly router: Router, private readonly location: Location) {}

  ngOnInit(): void {
    this.previousUrl = this.location.path();
  }

  retry(): void {
    this.router.navigate([this.previousUrl]);
  }
}
