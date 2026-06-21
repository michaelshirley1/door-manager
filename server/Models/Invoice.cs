namespace BusinessApi.Models
{
    public class Invoice
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public string JobNumber { get; set; } = string.Empty;
        public string InvoiceNumber { get; set; } = string.Empty;
        public string Status { get; set; } = "Draft";
        // Draft | Sent | Paid | Overdue | Void

        public decimal Subtotal { get; set; } = 0;
        public decimal TaxRate { get; set; } = 0.15m;
        public decimal TaxAmount { get; set; } = 0;
        public decimal Total { get; set; } = 0;
        public decimal AmountPaid { get; set; } = 0;
        public DateOnly? DueDate { get; set; }
        public string? Notes { get; set; }
        public DateTime? IssuedAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Job Job { get; set; } = null!;
    }
}
