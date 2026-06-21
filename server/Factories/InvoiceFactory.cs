using BusinessApi.Models;

namespace BusinessApi.Factories
{
    public interface IInvoiceFactory
    {
        IEnumerable<Invoice> GetAll();
        Invoice? GetById(int id);
        Invoice Create(Invoice invoice);
        Invoice? Update(int id, Invoice invoice);
        bool Delete(int id);
    }

    public class InvoiceFactory : IInvoiceFactory
    {
        private static int _nextId = 4;

        private static readonly List<Invoice> _invoices =
        [
            new Invoice
            {
                Id = 1,
                JobId = 1,
                JobNumber = "JOB-001",
                InvoiceNumber = "INV-001",
                Status = "Sent",
                Subtotal = 4782.61m,
                TaxRate = 0.15m,
                TaxAmount = 717.39m,
                Total = 5500.00m,
                AmountPaid = 0,
                DueDate = new DateOnly(2026, 5, 28),
                IssuedAt = new DateTime(2026, 4, 28, 0, 0, 0, DateTimeKind.Utc),
                Notes = "Payment due within 30 days.",
                CreatedAt = new DateTime(2026, 4, 28, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 4, 28, 0, 0, 0, DateTimeKind.Utc),
            },
            new Invoice
            {
                Id = 2,
                JobId = 2,
                JobNumber = "JOB-002",
                InvoiceNumber = "INV-002",
                Status = "Draft",
                Subtotal = 1913.04m,
                TaxRate = 0.15m,
                TaxAmount = 286.96m,
                Total = 2200.00m,
                AmountPaid = 0,
                DueDate = new DateOnly(2026, 6, 10),
                Notes = null,
                CreatedAt = new DateTime(2026, 4, 15, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 4, 15, 0, 0, 0, DateTimeKind.Utc),
            },
            new Invoice
            {
                Id = 3,
                JobId = 3,
                JobNumber = "JOB-003",
                InvoiceNumber = "INV-003",
                Status = "Paid",
                Subtotal = 7652.17m,
                TaxRate = 0.15m,
                TaxAmount = 1147.83m,
                Total = 8800.00m,
                AmountPaid = 8800.00m,
                DueDate = new DateOnly(2026, 4, 22),
                IssuedAt = new DateTime(2026, 4, 16, 0, 0, 0, DateTimeKind.Utc),
                PaidAt = new DateTime(2026, 4, 20, 0, 0, 0, DateTimeKind.Utc),
                Notes = "Paid in full.",
                CreatedAt = new DateTime(2026, 4, 16, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 4, 20, 0, 0, 0, DateTimeKind.Utc),
            },
        ];

        public IEnumerable<Invoice> GetAll() => _invoices;

        public Invoice? GetById(int id) =>
            _invoices.FirstOrDefault(i => i.Id == id);

        public Invoice Create(Invoice invoice)
        {
            invoice.Id = _nextId++;
            invoice.CreatedAt = DateTime.UtcNow;
            invoice.UpdatedAt = DateTime.UtcNow;
            _invoices.Add(invoice);
            return invoice;
        }

        public Invoice? Update(int id, Invoice invoice)
        {
            var existing = _invoices.FirstOrDefault(i => i.Id == id);
            if (existing is null) return null;

            existing.JobId = invoice.JobId;
            existing.JobNumber = invoice.JobNumber;
            existing.InvoiceNumber = invoice.InvoiceNumber;
            existing.Status = invoice.Status;
            existing.Subtotal = invoice.Subtotal;
            existing.TaxRate = invoice.TaxRate;
            existing.TaxAmount = invoice.TaxAmount;
            existing.Total = invoice.Total;
            existing.AmountPaid = invoice.AmountPaid;
            existing.DueDate = invoice.DueDate;
            existing.IssuedAt = invoice.IssuedAt;
            existing.PaidAt = invoice.PaidAt;
            existing.Notes = invoice.Notes;
            existing.UpdatedAt = DateTime.UtcNow;
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _invoices.FirstOrDefault(i => i.Id == id);
            if (existing is null) return false;
            _invoices.Remove(existing);
            return true;
        }
    }
}
