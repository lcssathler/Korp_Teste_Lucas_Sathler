using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockService.Models;
using StockService.Data;
namespace StockService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly StockDbContext _context;

    public ProductsController(StockDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        return await _context.Products.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();
        return product;
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    [HttpPut("{id}/update-balance")]
    public async Task<IActionResult> UpdateBalance(Guid id, [FromBody] int subtractQuantity)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();
        if (product.Balance < subtractQuantity) return BadRequest("Insufficient balance");

        product.Balance -= subtractQuantity;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}