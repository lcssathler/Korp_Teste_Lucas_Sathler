using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BillingService.Data;
using BillingService.Models;
using System.Net.Http.Json;
using Microsoft.OpenApi.Expressions;

namespace BillingService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoiceController : ControllerBase
{
    private readonly BillingDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;

    public InvoiceController(BillingDbContext context, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices()
    {
        return await _context.Invoices.Include(i => i.Items).OrderBy(i => i.Number).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Invoice>> GetInvoice(Guid id)
    {
        var invoice = await _context.Invoices.Include(i => i.Items).FirstOrDefaultAsync(i => i.Id == id);
        if (invoice == null) return NotFound();
        return invoice;
    }

    [HttpPost]
    public async Task<ActionResult<Invoice>> CreateInvoice(Invoice invoice)
    {
        invoice.Number = (_context.Invoices.Max(i => (int?)i.Number) ?? 0) + 1;
        if (invoice.Items == null || !invoice.Items.Any())
        {
            return BadRequest("Invoice must have at least one item");
        }
        Console.WriteLine(invoice.Items.ToList().Count);
        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoice);
    }

    [HttpPost("{id}/print")]
    public async Task<IActionResult> PrintInvoice(Guid id)
    {
        var invoice = await _context.Invoices.FindAsync(id);
        if (invoice == null) return NotFound();
        await _context.Entry(invoice).Collection(i => i.Items).LoadAsync();
        if (invoice.Status != InvoiceStatus.Open) return BadRequest("Invoice is not open");

        var client = _httpClientFactory.CreateClient("StockClient");
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            foreach (var item in invoice.Items)
            {
                var response = await client.PutAsJsonAsync($"api/products/{item.ProductId}/update-balance", item.Quantity);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    return StatusCode((int)response.StatusCode, error);
                }
            }

            invoice.Status = InvoiceStatus.Closed;
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, "Error printing invoice.");
        }
    }
}