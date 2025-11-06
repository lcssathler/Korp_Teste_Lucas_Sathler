using System.ComponentModel.DataAnnotations;

namespace BillingService.Models;

public class Invoice
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public int Number { get; set; }

    [Required]
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Open;

    [Required]
    [MinLength(1, ErrorMessage = "Invoice must have at least one item")]
    public List<InvoiceItem> Items { get; set; } = new();
}