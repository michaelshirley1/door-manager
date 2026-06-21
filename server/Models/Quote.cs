namespace BusinessApi.Models
{
    public class Quote
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string QuoteNumber { get; set; } = string.Empty;
        public string Status { get; set; } = "Draft";
        // Draft | Sent | Accepted | Order | Declined | Expired | Dispatched | Delivered | Invoice | Paid

        public int? JobId { get; set; }
        public string? JobNumber { get; set; }

        public string? SiteAddress { get; set; }
        public string? SiteDescription { get; set; }

        public decimal? Subtotal { get; set; }
        public decimal? TaxRate { get; set; }
        public decimal? TaxAmount { get; set; }
        public decimal? Total { get; set; }
        public decimal? TotalAmount { get; set; }
        public decimal? AmountPaid { get; set; }
        public DateOnly? ValidUntil { get; set; }
        public string? DueDate { get; set; }
        public string? IssuedAt { get; set; }
        public string? PaidAt { get; set; }
        public string? Notes { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Customer Customer { get; set; } = null!;
        public PurchaseOrder? PurchaseOrder { get; set; }
        public ICollection<OrderItem> Items { get; set; } = [];
    }
}
