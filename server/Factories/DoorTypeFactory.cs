using BusinessApi.Models;

namespace BusinessApi.Factories
{
    public interface IDoorTypeFactory
    {
        IEnumerable<DoorType> GetAll(string? leafType = null, string? material = null, int? heightMm = null, bool? isPOA = null);
        DoorType? GetById(int id);
        DoorType Create(DoorType doorType);
        DoorType? Update(int id, DoorType doorType);
        bool Delete(int id);
    }

    public class DoorTypeFactory : IDoorTypeFactory
    {
        private static int _nextId = 4;

        private static readonly List<DoorType> _doorTypes =
        [
            new DoorType
            {
                Id = 1,
                Name = "Solid Core Timber",
                LeafType = "Single",
                Material = "Timber",
                Description = "Standard solid core timber door, suitable for interior and exterior use.",
                IsActive = true,
                Price = 500.00f,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            },
            new DoorType
            {
                Id = 2,
                Name = "Hollow Core",
                LeafType = "Single",
                Material = "Composite",
                Description = "Lightweight hollow core door for interior use.",
                IsActive = true,
                Price = 69.00f,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            },
            new DoorType
            {
                Id = 3,
                Name = "Fire Door",
                LeafType = "Single",
                Material = "Steel",
                Description = "FRR 60/60/60 rated fire door for commercial buildings.",
                IsActive = true,
                IsPOA = true,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            },
        ];

        public IEnumerable<DoorType> GetAll(string? leafType = null, string? material = null, int? heightMm = null, bool? isPOA = null)
        {
            var query = _doorTypes.AsEnumerable();
            if (leafType is not null)
                query = query.Where(d => d.LeafType != null && d.LeafType.Equals(leafType, StringComparison.OrdinalIgnoreCase));
            if (material is not null)
                query = query.Where(d => d.Material != null && d.Material.Equals(material, StringComparison.OrdinalIgnoreCase));
            if (heightMm is not null)
                query = query.Where(d => d.HeightMm == heightMm);
            if (isPOA is not null)
                query = query.Where(d => d.IsPOA == isPOA);
            return query;
        }

        public DoorType? GetById(int id) =>
            _doorTypes.FirstOrDefault(d => d.Id == id);

        public DoorType Create(DoorType doorType)
        {
            doorType.Id = _nextId++;
            doorType.CreatedAt = DateTime.UtcNow;
            _doorTypes.Add(doorType);
            return doorType;
        }

        public DoorType? Update(int id, DoorType doorType)
        {
            var existing = _doorTypes.FirstOrDefault(d => d.Id == id);
            if (existing is null) return null;

            existing.Name = doorType.Name;
            existing.LeafType = doorType.LeafType;
            existing.Material = doorType.Material;
            existing.ProductRange = doorType.ProductRange;
            existing.HeightMm = doorType.HeightMm;
            existing.WidthSize = doorType.WidthSize;
            existing.SkinThickness = doorType.SkinThickness;
            existing.Description = doorType.Description;
            existing.IsPOA = doorType.IsPOA;
            existing.Notes = doorType.Notes;
            existing.IsActive = doorType.IsActive;
            existing.Price = doorType.IsPOA ? null : doorType.Price;
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _doorTypes.FirstOrDefault(d => d.Id == id);
            if (existing is null) return false;
            _doorTypes.Remove(existing);
            return true;
        }
    }
}
