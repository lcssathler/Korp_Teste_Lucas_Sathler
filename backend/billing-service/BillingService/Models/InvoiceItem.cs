using System.ComponentModel.DataAnnotations;

namespace BillingService.Models;

public class InvoiceItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required(ErrorMessage = "ProductId is required")]
    public Guid ProductId { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0")]
    public int Quantity { get; set; }
}