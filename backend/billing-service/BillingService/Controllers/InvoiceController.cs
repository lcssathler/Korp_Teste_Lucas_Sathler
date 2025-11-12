using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BillingService.Data;
using BillingService.Models;
using System.Text.Json;

namespace BillingService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoiceController : ControllerBase
{
    private readonly BillingDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _groqApiKey;
    

    public InvoiceController(BillingDbContext context, IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _groqApiKey = configuration["GroqApiKey"];
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

    [HttpGet("{id}/summary")]
    public async Task<ActionResult<string>> GenerateSummary(Guid id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
            return NotFound("Invoice not found.");

        string prompt = $@"
You are an assistant that summarizes invoices in a clear and friendly way.
Generate a short English summary for invoice #{invoice.Number}.

Details:
- Status: {invoice.Status}
- Total items: {invoice.Items.Count}
- Quantities: {string.Join(", ", invoice.Items.Select(i => $"{i.Quantity} units"))}

The summary should be in one single paragraph, professional but with a natural tone.
Avoid technical data or IDs. Summarize as if you’re describing the invoice to a colleague.
End with a brief remark about the invoice’s current status (for example, whether it’s open or closed).";

        using var client = new HttpClient();
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_groqApiKey}");

        var requestBody = new
        {
            model = "meta-llama/llama-4-scout-17b-16e-instruct",
            messages = new[]
            {
            new { role = "user", content = prompt }
        }
        };

        var response = await client.PostAsJsonAsync("https://api.groq.com/openai/v1/chat/completions", requestBody);
        var body = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            return BadRequest($"Error generating summary: {response.StatusCode}\n\n{body}");

        using var doc = System.Text.Json.JsonDocument.Parse(body);
        string? summary = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        return Ok(new { summary = summary ?? "Summary unavailable." });
    }


    [HttpPost]
    public async Task<ActionResult<Invoice>> CreateInvoice(Invoice invoice)
    {
        var client = _httpClientFactory.CreateClient("StockClient");

        foreach (var item in invoice.Items)
        {
            var response = await client.GetAsync($"api/products/{item.ProductId}/check-balance?quantity={item.Quantity}");
            if (!response.IsSuccessStatusCode)
            {
                return BadRequest(await response.Content.ReadAsStringAsync());
            }
        }

        invoice.Number = (_context.Invoices.Max(i => (int?)i.Number) ?? 0) + 1;
        invoice.Status = InvoiceStatus.Open;
        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoice);
    }

    [HttpPost("{id}/print")]
    public async Task<IActionResult> PrintInvoice(Guid id)
    {
        Invoice? invoice = await _context.Invoices.FindAsync(id);
        if (invoice == null) return NotFound();
        await _context.Entry(invoice).Collection(i => i.Items).LoadAsync();
        if (invoice.Status != InvoiceStatus.Open) return BadRequest("Invoice is not open");

        HttpClient? client = _httpClientFactory.CreateClient("StockClient");
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            await Task.Delay(3000);
            foreach (var item in invoice.Items)
            {
                HttpResponseMessage? response = await client.PutAsJsonAsync($"api/products/{item.ProductId}/update-balance", item.Quantity);

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
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpDelete("{id}")]    
    public async Task<IActionResult> CancelInvoice(Guid id)
    {
        var invoice = await _context.Invoices.Include(i => i.Items).FirstOrDefaultAsync(i => i.Id == id);
        if (invoice == null) return NotFound();

        var client = _httpClientFactory.CreateClient("StockClient");

        if (invoice.Status == InvoiceStatus.Closed)
        {
            foreach (var item in invoice.Items)
            {
                HttpResponseMessage? response = await client.PutAsJsonAsync($"api/products/{item.ProductId}/add-balance", item.Quantity);
                response.EnsureSuccessStatusCode();
            }
        }
        _context.Invoices.Remove(invoice);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}