import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice, InvoiceItem } from '../models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly apiUrl = 'http://localhost:5001/api/invoice';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  getById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  create(items: InvoiceItem[]): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, { items });
  }

  print(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/print`, {});
  }

  cancel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getSummary(id: string): Observable<{ summary: string }> {
    return this.http.get<{ summary: string }>(`${this.apiUrl}/${id}/summary`);
  }
}
