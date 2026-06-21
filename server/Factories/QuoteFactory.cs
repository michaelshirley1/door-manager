using BusinessApi.Models;

namespace BusinessApi.Factories
{
    public interface IQuoteFactory
    {
        IEnumerable<Quote> GetAll();
        Quote? GetById(int id);
        Quote Create(Quote quote);
        Quote? Update(int id, Quote quote);
        bool Delete(int id);
    }

    public class QuoteFactory : IQuoteFactory
    {
        private static int _nextId = 4;

        private static readonly List<Quote> _quotes =
        [
            new Quote
            {
                Id = 1,
                QuoteNumber = "QTE-001",
                CustomerId = 1,
                CustomerName = "John Smith",
                Status = "Sent",
                SiteAddress = "15 Industry Rd, Auckland",
                SiteDescription = "Interior door replacement — levels 1 and 2.",
                TotalAmount = 5500.00m,
                ValidUntil = new DateOnly(2026, 5, 31),
                CreatedBy = "Tom Baker",
                Notes = "Price includes supply and install.",
                CreatedAt = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc),
            },
            new Quote
            {
                Id = 2,
                QuoteNumber = "QTE-002",
                CustomerId = 2,
                CustomerName = "Sarah Johnson",
                Status = "Draft",
                SiteAddress = "42 Commerce St, Wellington",
                SiteDescription = "Fire door installation — stairwells.",
                TotalAmount = 2200.00m,
                ValidUntil = new DateOnly(2026, 6, 15),
                CreatedBy = "Dave Wilson",
                Notes = null,
                CreatedAt = new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc),
            },
            new Quote
            {
                Id = 3,
                QuoteNumber = "QTE-003",
                CustomerId = 3,
                CustomerName = "Mike Williams",
                Status = "Accepted",
                SiteAddress = "88 Builder Ave, Christchurch",
                SiteDescription = "Full door package for new commercial build.",
                TotalAmount = 8800.00m,
                ValidUntil = new DateOnly(2026, 4, 30),
                CreatedBy = "Tom Baker",
                Notes = "Accepted by client on 2026-03-05.",
                CreatedAt = new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 3, 5, 0, 0, 0, DateTimeKind.Utc),
            },
        ];

        public IEnumerable<Quote> GetAll() => _quotes;

        public Quote? GetById(int id) =>
            _quotes.FirstOrDefault(q => q.Id == id);

        public Quote Create(Quote quote)
        {
            quote.Id = _nextId++;
            quote.CreatedAt = DateTime.UtcNow;
            quote.UpdatedAt = DateTime.UtcNow;
            _quotes.Add(quote);
            return quote;
        }

        public Quote? Update(int id, Quote quote)
        {
            var existing = _quotes.FirstOrDefault(q => q.Id == id);
            if (existing is null) return null;

            existing.QuoteNumber = quote.QuoteNumber;
            existing.CustomerId = quote.CustomerId;
            existing.CustomerName = quote.CustomerName;
            existing.Status = quote.Status;
            existing.JobId = quote.JobId;
            existing.JobNumber = quote.JobNumber;
            existing.SiteAddress = quote.SiteAddress;
            existing.SiteDescription = quote.SiteDescription;
            existing.Subtotal = quote.Subtotal;
            existing.TaxRate = quote.TaxRate;
            existing.TaxAmount = quote.TaxAmount;
            existing.Total = quote.Total;
            existing.TotalAmount = quote.TotalAmount;
            existing.AmountPaid = quote.AmountPaid;
            existing.ValidUntil = quote.ValidUntil;
            existing.DueDate = quote.DueDate;
            existing.IssuedAt = quote.IssuedAt;
            existing.PaidAt = quote.PaidAt;
            existing.CreatedBy = quote.CreatedBy;
            existing.Notes = quote.Notes;
            existing.UpdatedAt = DateTime.UtcNow;
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _quotes.FirstOrDefault(q => q.Id == id);
            if (existing is null) return false;
            _quotes.Remove(existing);
            return true;
        }
    }
}
