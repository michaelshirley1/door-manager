using BusinessApi.Models;

namespace BusinessApi.Factories
{
    public interface ICustomerFactory
    {
        IEnumerable<Customer> GetAll();
        Customer? GetById(int id);
        Customer Create(Customer customer);
        Customer? Update(int id, Customer customer);
        bool Delete(int id);
    }

    public class CustomerFactory : ICustomerFactory
    {
        private static int _nextId = 4;

        private static readonly List<Customer> _customers =
        [
            new Customer
            {
                Id = 1,
                Name = "John Smith",
                CompanyName = "Smith Building Co",
                Email = "john@smithbuilding.com",
                Phone = "021 123 4567",
                Address = "15 Industry Rd, Auckland",
                Notes = "Preferred customer — always pays on time.",
                CreatedAt = new DateTime(2025, 1, 10, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 1, 10, 0, 0, 0, DateTimeKind.Utc),
            },
            new Customer
            {
                Id = 2,
                Name = "Sarah Johnson",
                CompanyName = "Johnson Renovations",
                Email = "sarah@johnsonreno.com",
                Phone = "021 987 6543",
                Address = "42 Commerce St, Wellington",
                Notes = "Residential renovation specialist.",
                CreatedAt = new DateTime(2025, 3, 5, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 3, 5, 0, 0, 0, DateTimeKind.Utc),
            },
            new Customer
            {
                Id = 3,
                Name = "Mike Williams",
                CompanyName = "Williams Construction",
                Email = "mike@williamsconstruction.com",
                Phone = "027 456 7890",
                Address = "88 Builder Ave, Christchurch",
                Notes = "Large commercial builds.",
                CreatedAt = new DateTime(2025, 6, 20, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 6, 20, 0, 0, 0, DateTimeKind.Utc),
            },
        ];

        public IEnumerable<Customer> GetAll() => _customers;

        public Customer? GetById(int id) =>
            _customers.FirstOrDefault(c => c.Id == id);

        public Customer Create(Customer customer)
        {
            customer.Id = _nextId++;
            customer.CreatedAt = DateTime.UtcNow;
            customer.UpdatedAt = DateTime.UtcNow;
            _customers.Add(customer);
            return customer;
        }

        public Customer? Update(int id, Customer customer)
        {
            var existing = _customers.FirstOrDefault(c => c.Id == id);
            if (existing is null) return null;

            existing.Name = customer.Name;
            existing.CompanyName = customer.CompanyName;
            existing.Email = customer.Email;
            existing.Phone = customer.Phone;
            existing.Address = customer.Address;
            existing.Notes = customer.Notes;
            existing.UpdatedAt = DateTime.UtcNow;
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _customers.FirstOrDefault(c => c.Id == id);
            if (existing is null) return false;
            _customers.Remove(existing);
            return true;
        }
    }
}
