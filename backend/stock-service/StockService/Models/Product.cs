using System.ComponentModel.DataAnnotations;

namespace StockService.Models;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required(ErrorMessage = "Code can't be null")]
    public string Code { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description can't be null")]
    public string Description { get; set; } = string.Empty;

    [Range(0, int.MaxValue, ErrorMessage = "Balance must be non-negative'")]
    public int Balance { get; set; }
}