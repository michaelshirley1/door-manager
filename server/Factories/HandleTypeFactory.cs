using BusinessApi.Models;

namespace BusinessApi.Factories
{
    public interface IHandleTypeFactory
    {
        IEnumerable<HandleType> GetAll(string? finish = null, string? mechanism = null);
        HandleType? GetById(int id);
        HandleType Create(HandleType handleType);
        HandleType? Update(int id, HandleType handleType);
        bool Delete(int id);
    }

    public class HandleTypeFactory : IHandleTypeFactory
    {
        private static int _nextId = 4;

        private static readonly List<HandleType> _handleTypes =
        [
            new HandleType
            {
                Id = 1,
                Name = "Lever Handle",
                Finish = "Brushed Nickel",
                Mechanism = "Latch",
                Description = "Standard lever handle with latch mechanism.",
                IsActive = true,
                Price = 56.23f,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            },
            new HandleType
            {
                Id = 2,
                Name = "Pull Handle",
                Finish = "Stainless Steel",
                Mechanism = "Pull",
                Description = "Straight pull handle for commercial doors.",
                IsActive = true,
                Price = 56.23f,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            },
            new HandleType
            {
                Id = 3,
                Name = "Door Knob",
                Finish = "Chrome",
                Mechanism = "Knob",
                Description = "Classic round door knob with privacy lock.",
                IsActive = true,
                Price = 56.23f,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            },
        ];

        public IEnumerable<HandleType> GetAll(string? finish = null, string? mechanism = null)
        {
            var query = _handleTypes.AsEnumerable();
            if (finish is not null)
                query = query.Where(h => h.Finish != null && h.Finish.Equals(finish, StringComparison.OrdinalIgnoreCase));
            if (mechanism is not null)
                query = query.Where(h => h.Mechanism != null && h.Mechanism.Equals(mechanism, StringComparison.OrdinalIgnoreCase));
            return query;
        }

        public HandleType? GetById(int id) =>
            _handleTypes.FirstOrDefault(h => h.Id == id);

        public HandleType Create(HandleType handleType)
        {
            handleType.Id = _nextId++;
            handleType.CreatedAt = DateTime.UtcNow;
            _handleTypes.Add(handleType);
            return handleType;
        }

        public HandleType? Update(int id, HandleType handleType)
        {
            var existing = _handleTypes.FirstOrDefault(h => h.Id == id);
            if (existing is null) return null;

            existing.Name = handleType.Name;
            existing.Finish = handleType.Finish;
            existing.Mechanism = handleType.Mechanism;
            existing.Description = handleType.Description;
            existing.IsActive = handleType.IsActive;
            existing.Price = handleType.Price;
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _handleTypes.FirstOrDefault(h => h.Id == id);
            if (existing is null) return false;
            _handleTypes.Remove(existing);
            return true;
        }
    }
}
