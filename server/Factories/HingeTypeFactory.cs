using BusinessApi.Models;

namespace BusinessApi.Factories
{
    public interface IHingeTypeFactory
    {
        IEnumerable<HingeType> GetAll();
        HingeType? GetById(int id);
        HingeType Create(HingeType hingeType);
        HingeType? Update(int id, HingeType hingeType);
        bool Delete(int id);
    }

    public class HingeTypeFactory : IHingeTypeFactory
    {
        private static int _nextId = 4;

        private static readonly List<HingeType> _hingeTypes =
        [
            new HingeType
            {
                Id = 1,
                Name = "Butt Hinge",
                Finish = "Stainless Steel",
                SizeMm = "100mm",
                Description = "Standard butt hinge for timber doors.",
                IsActive = true,
                Price = 56.23f,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            },
            new HingeType
            {
                Id = 2,
                Name = "Continuous Hinge",
                Finish = "Aluminium",
                SizeMm = "Full Length",
                Description = "Piano hinge for heavy-duty commercial doors.",
                IsActive = true,
                Price = 56.23f,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            },
            new HingeType
            {
                Id = 3,
                Name = "Spring Hinge",
                Finish = "Chrome",
                SizeMm = "75mm",
                Description = "Self-closing spring hinge for fire doors.",
                IsActive = true,
                Price = 56.23f,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            },
        ];

        public IEnumerable<HingeType> GetAll() => _hingeTypes;

        public HingeType? GetById(int id) =>
            _hingeTypes.FirstOrDefault(h => h.Id == id);

        public HingeType Create(HingeType hingeType)
        {
            hingeType.Id = _nextId++;
            hingeType.CreatedAt = DateTime.UtcNow;
            _hingeTypes.Add(hingeType);
            return hingeType;
        }

        public HingeType? Update(int id, HingeType hingeType)
        {
            var existing = _hingeTypes.FirstOrDefault(h => h.Id == id);
            if (existing is null) return null;

            existing.Name = hingeType.Name;
            existing.Finish = hingeType.Finish;
            existing.SizeMm = hingeType.SizeMm;
            existing.Description = hingeType.Description;
            existing.IsActive = hingeType.IsActive;
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _hingeTypes.FirstOrDefault(h => h.Id == id);
            if (existing is null) return false;
            _hingeTypes.Remove(existing);
            return true;
        }
    }
}
