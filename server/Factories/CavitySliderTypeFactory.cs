using BusinessApi.Models;

namespace BusinessApi.Factories
{
    public interface ICavitySliderTypeFactory
    {
        IEnumerable<CavitySliderType> GetAll(string? supplier = null, int? heightMm = null, string? category = null, bool? isPOA = null);
        CavitySliderType? GetById(int id);
        CavitySliderType Create(CavitySliderType cavitySliderType);
        CavitySliderType? Update(int id, CavitySliderType cavitySliderType);
        bool Delete(int id);
    }

    public class CavitySliderTypeFactory : ICavitySliderTypeFactory
    {
        private static int _nextId = 4;

        private static readonly List<CavitySliderType> _cavitySliderTypes =
        [
            new CavitySliderType
            {
                Id = 1,
                Supplier = "Hallmark",
                ProductSystem = "Assembled Unit",
                UnitType = "Single 90mm stud Architrave",
                StudPocket = "90mm",
                FinishDetail = "Architrave",
                HeightMm = 2040,
                WidthRange = "610-910",
                Price = 320.00f,
                IsPOA = false,
                PriceBasis = "per unit",
                Category = "Cavity Slider",
                Subcategory = "Assembled",
                IsActive = true,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            },
            new CavitySliderType
            {
                Id = 2,
                Supplier = "CS For Doors",
                ProductSystem = "SpaceMaker",
                UnitType = "Single 140mm stud D/G",
                StudPocket = "140mm",
                FinishDetail = "Double Grooved",
                HeightMm = 2040,
                WidthRange = "610-910",
                Price = 410.00f,
                IsPOA = false,
                PriceBasis = "per unit",
                Category = "Cavity Slider",
                Subcategory = "SpaceMaker",
                IsActive = true,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            },
            new CavitySliderType
            {
                Id = 3,
                Supplier = "CS For Doors",
                ProductSystem = "MidWay",
                UnitType = "Cavity Slider",
                StudPocket = "90mm stud / 10mm or 13mm linings",
                FinishDetail = "Grooved",
                HeightMm = 2400,
                WidthRange = "Up to 910",
                IsPOA = true,
                PriceBasis = "kit",
                Category = "Cavity Slider",
                Subcategory = "MidWay",
                IsActive = true,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            },
        ];

        public IEnumerable<CavitySliderType> GetAll(string? supplier = null, int? heightMm = null, string? category = null, bool? isPOA = null)
        {
            var query = _cavitySliderTypes.AsEnumerable();
            if (supplier is not null)
                query = query.Where(c => c.Supplier.Equals(supplier, StringComparison.OrdinalIgnoreCase));
            if (heightMm is not null)
                query = query.Where(c => c.HeightMm == heightMm);
            if (category is not null)
                query = query.Where(c => c.Category != null && c.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
            if (isPOA is not null)
                query = query.Where(c => c.IsPOA == isPOA);
            return query;
        }

        public CavitySliderType? GetById(int id) =>
            _cavitySliderTypes.FirstOrDefault(c => c.Id == id);

        public CavitySliderType Create(CavitySliderType cavitySliderType)
        {
            cavitySliderType.Id = _nextId++;
            cavitySliderType.CreatedAt = DateTime.UtcNow;
            _cavitySliderTypes.Add(cavitySliderType);
            return cavitySliderType;
        }

        public CavitySliderType? Update(int id, CavitySliderType cavitySliderType)
        {
            var existing = _cavitySliderTypes.FirstOrDefault(c => c.Id == id);
            if (existing is null) return null;

            existing.Supplier = cavitySliderType.Supplier;
            existing.ProductSystem = cavitySliderType.ProductSystem;
            existing.UnitType = cavitySliderType.UnitType;
            existing.StudPocket = cavitySliderType.StudPocket;
            existing.FinishDetail = cavitySliderType.FinishDetail;
            existing.HeightMm = cavitySliderType.HeightMm;
            existing.WidthRange = cavitySliderType.WidthRange;
            existing.IsPOA = cavitySliderType.IsPOA;
            existing.Price = cavitySliderType.IsPOA ? null : cavitySliderType.Price;
            existing.PriceBasis = cavitySliderType.PriceBasis;
            existing.Category = cavitySliderType.Category;
            existing.Subcategory = cavitySliderType.Subcategory;
            existing.IsActive = cavitySliderType.IsActive;
            return existing;
        }

        public bool Delete(int id)
        {
            var existing = _cavitySliderTypes.FirstOrDefault(c => c.Id == id);
            if (existing is null) return false;
            _cavitySliderTypes.Remove(existing);
            return true;
        }
    }
}
