using Microsoft.EntityFrameworkCore;
using BillingService.Models;

namespace BillingService.Data;

public class BillingDbContext(DbContextOptions<BillingDbContext> options) : DbContext(options)
{   
    public DbSet<Invoice> Invoices { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Invoice>().HasKey(i => i.Id);

        modelBuilder.Entity<InvoiceItem>().HasKey(ii => ii.Id);
        modelBuilder.Entity<Invoice>()
            .HasMany(i => i.Items)
            .WithOne()
            .HasForeignKey("InvoiceId")
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Invoice>().Property(i => i.Status).HasConversion<string>();
    }
}