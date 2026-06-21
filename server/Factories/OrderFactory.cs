using BusinessApi.Models;

namespace BusinessApi.Factories
{
    public interface IOrderFactory
    {
        IEnumerable<PurchaseOrder> GetAll();
        PurchaseOrder? GetById(int id);
        PurchaseOrder Create(PurchaseOrder order);
        PurchaseOrder? Update(int id, PurchaseOrder order);
        bool Delete(int id);
    }

    public class OrderFactory : IOrderFactory
    {
        private static int _nextId = 4;

        private static readonly List<PurchaseOrder> _orders =
        [
            new PurchaseOrder
            {
                Id = 1,
                CustomerId = 1,
                QuoteId = 1,
                PoNumber = "PO-2025-001",
                Status = "Confirmed",
                SiteAddress = "15 Industry Rd, Auckland",
                OrderDate = new DateOnly(2025, 2, 1),
                ExpectedDelivery = new DateOnly(2025, 3, 1),
                TotalAmount = 5500.00m,
                Notes = "Deliver to site office.",
                CreatedAt = new DateTime(2025, 2, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 2, 1, 0, 0, 0, DateTimeKind.Utc),
            },
            new PurchaseOrder
            {
                Id = 2,
                CustomerId = 2,
                QuoteId = 2,
                PoNumber = "PO-2025-002",
                Status = "InProduction",
                SiteAddress = "42 Commerce St, Wellington",
                OrderDate = new DateOnly(2025, 4, 10),
                ExpectedDelivery = new DateOnly(2025, 5, 15),
                TotalAmount = 2200.00m,
                Notes = null,
                CreatedAt = new DateTime(2025, 4, 10, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 4, 10, 0, 0, 0, DateTimeKind.Utc),
            },
            new PurchaseOrder
            {
                Id = 3,
                CustomerId = 3,
                QuoteId = 3,
                PoNumber = "PO-2025-003",
                Status = "Delivered",
                SiteAddress = "88 Builder Ave, Christchurch",
                OrderDate = new DateOnly(2025, 7, 5),
                ExpectedDelivery = new DateOnly(2025, 8, 1),
                TotalAmount = 8800.00m,
                Notes = "All items delivered and signed off.",
                CreatedAt = new DateTime(2025, 7, 5, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 7, 5, 0, 0, 0, DateTimeKind.Utc),
            },
        ];

        public IEnumerable<PurchaseOrder> GetAll() => _orders;

        public PurchaseOrder? GetById(int id) =>
            _orders.FirstOrDefault(o => o.Id == id);

        public PurchaseOrder Create(PurchaseOrder order)
        {
            order.Id = _nextId++;
            order.CreatedAt = DateTime.UtcNow;
            order.UpdatedAt = DateTime.UtcNow;
            _orders.Add(order);
            return order;
        }

        public PurchaseOrder? Update(int id, PurchaseOrder order)
        {
            var existing = _orders.FirstOrDefault(o => o.Id == id);
            if (existing is null) return null;

            existing.PoNumber = order.PoNumber;
            existing.Status = order.Status;
            existing.SiteAddress = order.SiteAddress;
            existing.SiteDescription = order.SiteDescription;
            existing.ExpectedDelivery = order.ExpectedDelivery;
            existing.TotalAmount = order.TotalAmount;
            existing.Notes = order.Notes;
            existing.UpdatedAt = DateTime.UtcNow;
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _orders.FirstOrDefault(o => o.Id == id);
            if (existing is null) return false;
            _orders.Remove(existing);
            return true;
        }
    }
}
