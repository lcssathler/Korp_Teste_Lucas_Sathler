export interface InvoiceItem {
  productId: string;
  quantity: number;
}

export interface Invoice {
  id: string;
  number: number;
  status: 'Open' | 'Closed';
  items: InvoiceItem[];
}