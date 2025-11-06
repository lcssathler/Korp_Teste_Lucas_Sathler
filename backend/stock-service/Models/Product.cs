using System.ComponentModel.DataAnnotations;

namespace StockService.Models;

public class Product
{
    public Product(string code, string description, int balance)
    {
        ArgumentNullException.ThrowIfNull(code, nameof(code));
        ArgumentNullException.ThrowIfNull(description, nameof(description));
        ArgumentOutOfRangeException.ThrowIfNegative(balance, nameof(balance));

        Id = Guid.NewGuid();
        Code = code;
        Description = description;
        Balance = balance;
    }

    public Guid Id { get; set; }
    
    [Required(ErrorMessage = "Code can't be null")]
    public string Code { get; set; }
    
    [Required(ErrorMessage = "Description can't be null")]
    public string Description { get; set; }
    
    [Range(0, int.MaxValue, ErrorMessage = "Balance must be greater than or equal to 0")]
    public int Balance { get; set; }
}